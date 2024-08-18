import json
import os
import boto3

s3 = boto3.client('s3',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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"
)
BUCKET_NAME = 'seng3011-student'

def handler(event, context):
    # Get the guid from the event (assuming it is passed as a JSON body)
    try:
        guid = event['queryStringParameters']['guid']
    except (KeyError, TypeError, json.JSONDecodeError) as e:
        print(f"Error parsing guid from event: {e}")
        return {
            "statusCode": 400,
            "body": json.dumps({'message': "Invalid request, no GUID provided"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }

    filename = f"SE3011-24-F11A-02/article_data/{guid}.json"

    # Try to fetch the file from S3
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
        article_text = response['Body'].read().decode('utf-8')
        return {
            "statusCode": 200,
            "body": json.dumps({'article_text': article_text}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        }
    except s3.exceptions.NoSuchKey:
        print("No such key:", filename)
        return {
            "statusCode": 404,
            "body": json.dumps({'message': "Article not found"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
    except Exception as e:
        print(f"Error accessing S3: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({'message': "Something went wrong :("}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
