import logging
import json
import boto3
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SQS_QUEUE_URL = os.environ.get("SQS_QUEUE_URL")
DATA_IMPORTER_LAMBDA_NAME = os.environ.get("DATA_IMPORTER_LAMBDA_NAME")

s3 = boto3.client('s3',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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"
)
sqs = boto3.client('sqs')
lambda_client = boto3.client('lambda')


def handler(event, context):
    try:
        body = event.get('queryStringParameters', {})

        dataset_id = body["dataset_id"]

        start_year = int(body.get("start_year", 2015))
        end_year = int(body.get("end_year", 2022))

        prefix_raw = f"SE3011-24-F11A-02/raw_datasets/{dataset_id}/"

        files = s3.list_objects_v2(
            Bucket="seng3011-student",
            Prefix=prefix_raw).get('Contents', []
        )

        for year in range(start_year, end_year + 1):
            year_files = [file for file in files if f"_{year}" in file['Key']]
            print(f"Processing {len(year_files)} files for year {year}")

            # Combine data for each year
            for file in year_files:
                file_name = file['Key']
                
                try:
                    lambda_client.invoke(
                        FunctionName=DATA_IMPORTER_LAMBDA_NAME,
                        Payload=json.dumps({
                            "queryStringParameters": {
                                "file_name": file_name,
                                "dataset_id": dataset_id
                            }
                        }),
                        InvocationType='Event'
                    )
                    print("Invoked importer for file:", file_name)
                except Exception as e:
                    print(e)

        return {
            "statusCode": 200,
            "body": json.dumps({"status": "Success"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }
        
    except Exception as e:
        msg = f"Error in importing data: {e}"

        return {
            "statusCode": 500,
            "body": json.dumps({"status": "Error", "message": msg}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }

if __name__ == "__main__":
    print(handler({
        "queryStringParameters": json.dumps({
            "dataset_id": "afr",
            "start_year": "2017",
            "end_year": "2017",
        })
    }, None))
