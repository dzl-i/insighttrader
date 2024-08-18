import boto3
import json

s3 = boto3.client('s3',
    aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    aws_secret_access_key="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"
)
dynamodb = boto3.resource('dynamodb')

TABLE_NAME = 'SE3011-24-F11A-02_Articles'
BUCKET_NAME = 'seng3011-student'

def handler(event, context):
    try:
        print("Processing", len(event['Records']), "events")

        for record in event['Records']:
            # table = dynamodb.Table(TABLE_NAME)
            # message = json.loads(record['body'])
            
            try:
                # Do stuff with message
                pass
            except Exception as e:
                print(e)
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps('Error'),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }    

    return {
        'statusCode': 200,
        'body': json.dumps('Success'),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
    }

if __name__ == "__main__":
    print(handler({
        "Records": [
            {
                "body": "doc6tfvj3tyh041nj801lfw"
            }
        ]
    }, None))
