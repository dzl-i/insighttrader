import logging
import json
import boto3
import time
import psutil
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        Namespace='SE3011-24-F11A-02-RetreivalService',
        MetricData=[
            {
                'MetricName': metric,
                'Value': value,
                'Unit': unit
            }
        ]
    )
    

def pub_event_log(message):
    group_name = 'RetreivalLogs'
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

@xray_recorder.capture('handler')
def handler(event, context):
    pub_metric('InvocationCount', 1, 'Count')
    start_time = time.time()
    try:
        logger.info("Handler invoked - Retreival Service")
        s3 = boto3.client(
            "s3",
            aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
            aws_secret_access_key="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"
        )

        body = event["queryStringParameters"]

        try: 
            with xray_recorder.in_subsegment('s3_data_retrieval') as seg:
                dataset_id = body["dataset_id"]
                start_year = int(body.get("start_year", "0"))
                end_year = int(body.get("end_year", "9999"))
                metadata_only = body.get("metadata_only", False)

                logger.info(f"Retreival Service - Dataset id: {dataset_id}")
                logger.info(f"Retreival Service - Start year: {start_year}")
                logger.info(f"Retreival Service - End year: {end_year}")

                prefix = f"SE3011-24-F11A-02/processed_data/{dataset_id}/"
                adage_files = s3.list_objects_v2(
                    Bucket="seng3011-student",
                    Prefix=prefix).get(
                    'Contents',
                    [])
        except Exception as e: 
            raise
        final_adage_data_model = None
        
        try:
            with xray_recorder.in_subsegment('data_retreival') as seg:
                for file_info in adage_files:
                    file_key = file_info['Key']
                    file_year = file_key.split("/")[-1].split(".")[0]

                    if any(
                        str(year) == file_year for year in range(
                            start_year,
                            end_year + 1)):
                        logger.info(f"Retreival Service - Reading file: {file_key}")
                        file_content = s3.get_object(
                            Bucket="seng3011-student",
                            Key=file_key)['Body'].read().decode('utf-8')
                        adage_data_model = json.loads(file_content)

                        if final_adage_data_model is None:
                            final_adage_data_model = adage_data_model
                        else:
                            for event in adage_data_model["events"]:
                                # Avoid duplicate events based on guid
                                if not any(event["attribute"]["guid"] == existing_event["attribute"]["guid"]
                                        for existing_event in final_adage_data_model["events"]):
                                    final_adage_data_model["events"].append(event)
        except Exception as e: 
            raise
        
        
        if final_adage_data_model:
            final_adage_data_model["dataset_id"] = f"{dataset_id}_{start_year}-{end_year}"
            if metadata_only:
                for event in final_adage_data_model["events"]:
                    event["attribute"].pop("text", None)
        else:
            logger.error(f"Retreival Service - Error: No data found")
            pub_event_log(f"An error occured while retreiving data: No data found")
            return {
                "statusCode": 404,
                "body": json.dumps({"status": "No data found"}),
                "headers": {
                    "Content-Type": "application/json",
                },
            }
            
        end_time = time.time()
        exec_time = end_time - start_time
        pub_metric('ExecutionTime', exec_time, 'Seconds')
        logger.info(f"Retreival Service - Total Execution time: {exec_time:.2f} seconds")
        
        total_mem = psutil.Process().memory_info().rss/1024/1024
        pub_metric('MemoryUsage', total_mem, 'Megabytes')
        logger.info(f"Retreival Service - Memory usage: {total_mem:.2f} MB")
        
        return {
            "statusCode": 200,
            "body": json.dumps(final_adage_data_model, separators=(',', ':')),
            "headers": {
                "Content-Type": "application/json",
            },
        }
        
    except Exception as e:
        logger.error(f"Retreival Service - Error in data retrieval or processing: {e}")
        pub_event_log(f"An error occured while retreiving data: {e}")

        return {
            "statusCode": 500,
            "body": '{"status":"Server error"}',
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }


# resp = handler({
#     "body": json.dumps({
#         "dataset_id": "afr",
#         "start_year": "2017",
#         "end_year": "2017",
#         "metadata_only": True
#     })
# }, None)

# with open("response.json", "w") as f:
#     f.write(json.dumps(json.loads(resp["body"]), indent=2))
