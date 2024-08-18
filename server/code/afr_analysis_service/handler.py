# pylint: skip-file
import json
import boto3
import pickle
import logging
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
        Namespace='SE3011-24-F11A-02-AnalysisService',
        MetricData=[
            {
                'MetricName': metric,
                'Value': value,
                'Unit': unit
            }
        ]
    )


def pub_event_log(message):
    group_name = 'AnalysisLogs'
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

def s3_model(s3, bucket, key):
    try: 
        response = s3.get_object(Bucket=bucket, Key=key)
        model_data = response["Body"].read()
        model = pickle.loads(model_data)
        logger.info(f"Analysis Service - Successfully loaded model form S3: {bucket}/{key}")
        return model
    except Exception as e:
        logger.error(f"Analysis Service - Error loading model from S3: {str(e)}")
        raise e

@xray_recorder.capture('handler')
def handler(event, context):
    pub_metric('InvocationCount', 1, 'Count')
    start_time_service = time.time()
    try:
        logger.info("Handler invoked - Analysis Service")
        
        s3 = boto3.client(
            "s3",
            aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
            aws_secret_access_key="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"
        )
        
        body = event["queryStringParameters"]
        text = body["text"]
        logger.info(f"Analysis Service - Received text: {text}")
        
        try: 
            with xray_recorder.in_subsegment('load_models') as seg:
                start_time_models = time.time()
                model = s3_model(
                    s3,
                    "seng3011-student",
                    "SE3011-24-F11A-02/ml_models/naive_bayes_model.pkl")
                vec = s3_model(
                    s3,
                    "seng3011-student",
                    "SE3011-24-F11A-02/ml_models/vectorizer.pkl")
                enc = s3_model(
                    s3,
                    "seng3011-student",
                    "SE3011-24-F11A-02/ml_models/label_encoder.pkl")
                
                end_time_models = time.time()
                downl_time_models = end_time_models - start_time_models
                
                logger.info(f"Analysis Service - Time to load models: {downl_time_models:.2f} seconds")
        except Exception as e: 
            raise
        
        try:
            with xray_recorder.in_subsegment('predict_topic') as seg:
                text_vec = vec.transform([text])
                logger.info(f"Analysis Service - Imported model successfully")
                
                predicted_label = model.predict(text_vec)
                predicted_topic = enc.inverse_transform(predicted_label)[0]
                logger.info(f"Analysis Service - Predicted label: {predicted_topic}")
        except Exception as e: 
            raise
        
        end_time_service = time.time()
        total_time_service = end_time_service - start_time_service
        pub_metric('ExecutionTime', total_time_service, 'Seconds')
        logger.info(f"Analysis Service - Execution time: {total_time_service:.2f} seconds")
        
        total_mem = psutil.Process().memory_info().rss/1024/1024
        pub_metric('MemoryUsage', total_mem, 'Megabytes')
        logger.info(f"Analysis Service - Memory usage: {total_mem:.2f} MB")
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": {
                "predicted_topic": predicted_topic
            }
        }

    except Exception as e:
        msg = f"Error occured while preprocessing data: {str(e)}"
        logger.error(f"Analysis service - {msg}")
        pub_event_log(msg)

        return {
            "statusCode": 500,
            "body": json.dumps({"status": "Error", "message": msg}),
            "headers": {
                "Content-Type": "application/json",
            },
        }
