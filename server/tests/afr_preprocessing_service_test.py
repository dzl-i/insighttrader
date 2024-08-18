import json
import pytest
from unittest.mock import patch, MagicMock
from code.afr_preprocessing_service.handler import handler

# Mock data and function responses
mock_s3_get_response = {
    'Body': MagicMock(read=lambda: b'{"events": [{"attribute": {"guid": "1", "section": "Test", "publication_date": "2024-03-17", "page_no": 1, "classifications": "None", "headline": "Test Headline", "text": "Test text for processing."}}]}')
}

@pytest.fixture
def event():
    """Returns a mock event object for the lambda handler."""
    return {
        "queryStringParameters": {
            "dataset_id": "test_dataset",
            "start_year": "2017",
            "end_year": "2017"
        }
    }

@pytest.fixture
def context():
    """Returns a mock context object for the lambda handler."""
    return MagicMock()


@patch('code.afr_preprocessing_service.handler.boto3.client')
def test_handler_success(mock_boto3, event, context):
    # Setup mock boto3 S3 client
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3
    mock_s3.list_objects_v2.return_value = {
        "Contents": [{"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"}]
    }
    mock_s3.get_object.return_value = mock_s3_get_response

    response = handler(event, context)

    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['status'] == 'Success'
    mock_s3.put_object.assert_called_once()  # Verify that S3 put_object was called

@patch('code.afr_preprocessing_service.handler.boto3.client')
def test_handler_failure_no_files_found(mock_boto3, event, context):
    # Setup mock boto3 S3 client to simulate no files found
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3
    mock_s3.list_objects_v2.return_value = {
        "Contents": [{"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"}]
    }
    mock_s3.list_objects_v2.return_value = {"Contents": []}

    response = handler(event, context)

    assert response['statusCode'] == 404
    body = json.loads(response['body'])
    assert 'Error' in body['status']

@patch('code.afr_preprocessing_service.handler.boto3.client')
def test_handler_exception_during_processing(mock_boto3, event, context):
    # Setup mock boto3 S3 client to throw an exception during processing
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3
    mock_s3.get_object.side_effect = Exception("S3 error")

    response = handler(event, context)

    # Assertions
    assert response['statusCode'] == 404
    body = json.loads(response['body'])
    assert 'Error' in body['status']

@pytest.mark.skip("Test is not yet implemented")
@patch('code.afr_preprocessing_service.handler.boto3.client')
def test_preprocessing_adds_attributes_successfully(mock_boto3):
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3

    processed_data = {}

    original_file_content = json.dumps({
        "events": [
            {
                "attribute": {
                    "text": "Example text",
                }
            }
        ]
    })

    mock_s3.get_object.return_value = {'Body': MagicMock(read=lambda: original_file_content.encode())}

    # A mock function to capture the data passed to put_object
    def mock_put_object(Bucket, Key, Body, **kwargs):
        nonlocal processed_data
        processed_data = json.loads(Body)

    mock_s3.put_object.side_effect = mock_put_object

    handler(event={'queryStringParameters': {'dataset_id': 'test_dataset', 'start_year': '2017', 'end_year': '2018'}}, context=None)
    print(processed_data)

    # Check that the processed data has the new attributes
    assert 'modified' in processed_data['events'][0]['attribute']
    assert 'pre_processed_text' in processed_data['events'][0]['attribute']
    assert 'word_count' in processed_data['events'][0]['attribute']
    assert 'sent_polarity' in processed_data['events'][0]['attribute']
    assert 'sent_subjectivity' in processed_data['events'][0]['attribute']
    assert 'avg_sentence_length' in processed_data['events'][0]['attribute']
    assert 'named_entities' in processed_data['events'][0]['attribute']
    assert 'topic' in processed_data['events'][0]['attribute']
