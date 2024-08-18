import logging
import json
import boto3
import os
from helpers import process_articles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

s3 = boto3.client('s3',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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"
)

sqs = boto3.client('sqs')

SQS_QUEUE_URL = os.environ.get("SQS_QUEUE_URL")
BUCKET_NAME = 'seng3011-student'

def handler(event, context):
    try:
        body = event.get('queryStringParameters', {})
        file_name = body.get("file_name", "SE3011-24-F11A-02/raw_datasets/afr/AFR_20170102-20170131.xml")
        dataset_id = body.get("dataset_id", "afr")

        file_content = s3.get_object(
            Bucket="seng3011-student",
            Key=file_name
        )['Body'].read().decode('utf-8')

        # This is where the article is added to the SQS queue for preprocessing
        def process_function(article_data):
            try:
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key=f"SE3011-24-F11A-02/article_data/{article_data['guid']}.json",
                    Body=article_data['text']
                )
                
                del article_data['text']
                
                sqs.send_message(
                    QueueUrl=SQS_QUEUE_URL,
                    MessageBody=json.dumps(article_data)
                )
                
                print("Imported", article_data['guid'])
            except Exception as e:
                logger.error(f"Error saving article data: {e}")

        process_articles(file_content, process_function, dataset_id)

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
            "file_name": "SE3011-24-F11A-02/raw_datasets/afr/AFR_20150101-20150131.xml"
        })
    }, None))
