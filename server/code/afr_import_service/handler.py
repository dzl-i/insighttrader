# pylint: skip-file
import logging
import json
import boto3
import io
import pandas as pd
from lxml import etree
import time
import psutil
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

parser = etree.XMLParser(ns_clean=True)

patch_all()

cloudwatch = boto3.client(
    'cloudwatch',
    region_name='ap-southeast-2',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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")


cloudwatch_logs = boto3.client(
    'logs',
    region_name='ap-southeast-2',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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")

def pub_metric(metric, value, unit):
    cloudwatch.put_metric_data(
        Namespace='SE3011-24-F11A-02-ImportService',
        MetricData=[
            {
                'MetricName': metric,
                'Value': value,
                'Unit': unit
            }
        ]
    )
    

def pub_event_log(message):
    group_name = 'ImportLogs'
    stream_name = 'Errors'

    try:
        cloudwatch_logs.create_log_group(logGroupName=group_name)
    except cloudwatch_logs.exceptions.ResourceAlreadyExistsException:
        pass

    try:
        cloudwatch_logs.create_log_stream(logGroupName=group_name, logStreamName=stream_name)
    except cloudwatch_logs.exceptions.ResourceAlreadyExistsException:
        pass

    cloudwatch_logs.put_log_events(
        logGroupName=group_name,
        logStreamName=stream_name,
        logEvents=[
            {
                'timestamp': int(round(time.time() * 1000)),
                'message': message
            }
        ]
    )



def xml_to_df(xml):
    data = []
    logger.info("Import Service - Converting XMLs to DataFrame")

    for dossier in xml.xpath('//dcdossier'):
        guid = dossier.get('guid')
        modified = dossier.get('modified')
        logger.info(f"Import Service - Converting XML with guid {guid} to Dataframe")

        for doc in dossier.xpath('.//document'):
            section = doc.xpath('.//SECTION/text()')
            publication_date = doc.xpath('.//PUBLICATIONDATE/text()')
            page_no = doc.xpath('.//PAGENO/text()')
            author = doc.xpath('.//BYLINE/text()')
            classifications = doc.xpath('.//CLASSIFICATION/text()')
            headline = doc.xpath('.//HEADLINE/text()')
            intro = doc.xpath('.//INTRO/text()')
            text = " ".join(doc.xpath('.//TEXT//text()'))

            data.append({
                'guid': guid,
                'modified': modified,
                'section': section[0].strip() if section else None,
                'publication_date': str(publication_date[0]) if publication_date else None,
                'page_no': page_no[0].strip() if page_no else None,
                'author': author[0].strip() if author else None,
                'classifications': classifications if classifications else None,
                'headline': headline[0].strip() if headline else None,
                'intro': intro[0].strip() if intro else None,
                'text': text.strip() if text else None,
            })

    df = pd.DataFrame(data)

    df['modified'] = pd.to_datetime(
        df['modified'],
        format='%Y-%m-%dT%H:%M:%S%z',
        errors='coerce',
        utc=True)
    df['publication_date'] = pd.to_datetime(
        df['publication_date'],
        format='%Y%m%d',
        errors='coerce',
        utc=True)

    # Cut text to 500 characters
    df['text'] = df['text'].str.slice(0, 500)

    # Remove rows with null classifications
    df = df.dropna(subset=['classifications'])

    # Only keep 20 rows
    df = df.head(20)

    logger.info("Import Service - XML to DataFrame conversion completed.")
    return df


def append_to_adage(adage_data_model, df):
    if adage_data_model is None:
        adage_data_model = {
            "data_source": "Australian Financial Review",
            "dataset_type": "News_Articles",
            "dataset_id": "afr",
            "time_object": {
                "timestamp": pd.Timestamp.now().isoformat(),
                "timezone": "GMT+11"
            },
            "events": []
        }
    else:
        adage_data_model = json.loads(adage_data_model)

    for _, row in df.iterrows():
        # If there is a duplicate guid, skip it
        if row["guid"] in [event["attribute"]["guid"]
                           for event in adage_data_model["events"]]:
            continue

        modified = ""
        publication_date = ""

        if not pd.isna(row["modified"]):
            publication_date = row["modified"].isoformat()

        if not pd.isna(row["publication_date"]):
            publication_date = row["publication_date"].strftime("%Y-%m-%d")

        event = {
            "time_object": {
                "timestamp": modified,
                "duration": 0,
                "duration_unit": "second",
                "timezone": "GMT+11"
            },
            "event_type": "article",
            "attribute": {
                "guid": row["guid"],
                "author": row["author"],
                "headline": row["headline"],
                "section": row["section"],
                "publication_date": publication_date,
                "page_no": row["page_no"],
                "classifications": row["classifications"],
                "text": row.get("text")
            }
        }
        adage_data_model["events"].append(event)

    adage_data_model["time_object"]["timestamp"] = df["modified"].max(
    ).isoformat()

    return json.dumps(adage_data_model, indent=2)

@xray_recorder.capture('handler')
def handler(event, context):
    pub_metric('InvocationCount', 1, 'Count')
    start_time = time.time()
    try:
        logger.info("Handler invoked - Import Service")
        s3 = boto3.client('s3')
        body = json.loads(event["body"])

        dataset_id = body["dataset_id"]
        start_year = end_year = None
        if body.get("start_year") and body.get("end_year"):
            start_year = int(body.get("start_year"))
            end_year = int(body.get("end_year"))

        logger.info(f"Import Service - Start year: {start_year}")
        logger.info(f"Import Service - End year: {end_year}")
        
        prefix_raw = f"SE3011-24-F11A-02/raw_datasets/{dataset_id}/"

        adage_data_models = {
            year: None for year in range(
                start_year, end_year + 1)}
        
        try: 
            with xray_recorder.in_subsegment('s3_data_retrieval') as seg:
                files = s3.list_objects_v2(
                    Bucket="seng3011-student",
                    Prefix=prefix_raw).get(
                    'Contents',
                    [])
        except Exception as e: 
            raise

        for year in range(start_year, end_year + 1):
            year_files = [file for file in files if f"_{year}" in file['Key']]

            for file in year_files:
                file_name = file['Key']
                logger.info(f"Import Service - Processing file: {file_name}")
                
                try: 
                    with xray_recorder.in_subsegment('xml_parsing') as seg:
                        file_content = s3.get_object(
                            Bucket="seng3011-student",
                            Key=file_name)['Body'].read().decode('utf-8')
                        parser = etree.XMLParser()
                        xml = etree.parse(io.StringIO(file_content), parser)

                        df = xml_to_df(xml)
                except Exception as e: 
                    raise
                adage_data_models[year] = append_to_adage(
                    adage_data_models[year], df)

        prefix_processed = f"SE3011-24-F11A-02/processed_data/{dataset_id}/"

        with xray_recorder.in_subsegment('save_processed_data') as seg:
            for year, adage_data_model in adage_data_models.items():
                if adage_data_model:
                    processed_file_key = f"{prefix_processed}{year}.json"
                    s3.put_object(
                        Bucket="seng3011-student",
                        Key=processed_file_key,
                        Body=adage_data_model)
                    logger.info(f"Saved combined ADAGE data for {year} to {processed_file_key}")
                else:
                  return {
                      "statusCode": 404,
                      "body": '{"status":"No data found"}',
                      "headers": {
                          "Content-Type": "application/json",
                          "Access-Control-Allow-Headers": "Content-Type",
                          "Access-Control-Allow-Origin": "*",
                          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                      },
                  }
        end_time = time.time()
        exec_time = end_time - start_time
        pub_metric('ExecutionTime', exec_time, 'Seconds')
        logger.info(f"Import Service - Total Execution time: {exec_time:.2f} seconds")
        total_mem = psutil.Process().memory_info().rss/1024/1024
        pub_metric('MemoryUsage', total_mem, 'Megabytes')
        logger.info(f"Import Service - Memory usage: {total_mem:.2f} MB")

        return {
            "statusCode": 200,
            "body": '{"status":"Success"}',
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }
        
    except Exception as e:
        msg =f"Error in importing data: {e}"
        logger.error("Import service - {msg}")
        pub_event_log(msg)

        return {
            "statusCode": 500,
            "body": json.dumps({"status": "Error", "message": msg}),
            "headers": {
                "Content-Type": "application/json",
            },
        }

# Test case
# handler({
#     "body": json.dumps({
#         "dataset_id": "afr",
#         "start_year": "2015",
#         "end_year": "2021"
#     })
# }, None)
