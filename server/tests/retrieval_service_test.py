import json
from unittest.mock import patch, MagicMock
from code.retrieval_service.handler import handler

def setup_s3_mock(mock_s3, list_objects_response, get_object_response):
    """Utility function to setup S3 mock responses."""
    mock_s3.list_objects_v2.return_value = list_objects_response
    mock_s3.get_object.return_value = {"Body": MagicMock(read=lambda: get_object_response)}

def test_valid_input_single_year():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        setup_s3_mock(mock_s3, {
            "Contents": [
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"}
            ]
        }, b'{"events": [], "dataset_id": "afr"}')
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2017",
                "metadata_only": "true"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        assert "application/json" in response["headers"]["Content-Type"]
        body = json.loads(response["body"])
        assert body["dataset_id"] == "afr_2017-2017"
        assert "events" in body

def test_valid_input_multiple_years():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        setup_s3_mock(mock_s3, {
            "Contents": [
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"},
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2018.json"}
            ]
        }, b'{"events": [{"attribute": {"guid": "123"}}], "dataset_id": "afr"}')
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2018",
                "metadata_only": "true"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["dataset_id"] == "afr_2017-2018"
        assert len(body["events"]) == 1  # Assuming de-duplication logic is correct

def test_invalid_start_year_format():
    event = {
        "queryStringParameters": {
            "dataset_id": "afr",
            "start_year": "twenty17",
            "end_year": "2017",
            "metadata_only": "true"
        }
    }
    response = handler(event, None)
    assert response["statusCode"] == 500

def test_invalid_metadata_only_value():
    event = {
        "queryStringParameters": {
            "dataset_id": "afr",
            "start_year": "2017",
            "end_year": "2018",
            "metadata_only": "not_a_boolean"
        }
    }
    
    # Default value for metadata_only is True
    response = handler(event, None)
    assert response["statusCode"] == 200

def test_s3_service_unavailable():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        mock_s3.list_objects_v2.side_effect = Exception("S3 Service Error")
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2017",
                "metadata_only": "true"
            }
        }
        response = handler(event, None)
        assert response["statusCode"] == 500

def test_handler_with_no_matching_files():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        mock_s3.list_objects_v2.return_value = {"Contents": []}

        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "3000",
                "end_year": "3001",
                "metadata_only": "true"
            }
        }
        response = handler(event, None)

        assert response["statusCode"] == 404
        assert json.loads(response["body"])["status"] == "No data found"


def test_valid_data_retrieval():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        with open("tests/mock_s3/afr/2017.json", "rb") as file:
            mock_data = file.read()
        setup_s3_mock(mock_s3, {
            "Contents": [{"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"}]
        }, mock_data)
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2017",
                "metadata_only": "false"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body["events"]) == 3  # Confirm all events are returned

def test_metadata_only_request():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        with open("tests/mock_s3/afr/2017.json", "rb") as file:
            mock_data = file.read()
        setup_s3_mock(mock_s3, {
            "Contents": [{"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"}]
        }, mock_data)
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2017",
                "metadata_only": "true"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert all("text" not in event["attribute"] for event in body["events"])  # Confirm text is omitted

def test_event_de_duplication():
    # Assuming there's an overlap/duplicate event across years for demonstration purposes
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        with open("tests/mock_s3/afr/2017.json", "rb") as file_2017, open("tests/mock_s3/afr/2018.json", "rb") as file_2018:
            mock_data_2017 = file_2017.read()
            # Modify 2018 data to include a duplicate event from 2017 for testing
            data_2018 = json.load(file_2018)
            data_2017 = json.loads(mock_data_2017)
            # Add a duplicate event from 2017 to 2018
            data_2018["events"].append(data_2017["events"][0])
            mock_data_2018 = json.dumps(data_2018).encode()

        setup_s3_mock(mock_s3, {
            "Contents": [
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"},
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2018.json"}
            ]
        }, mock_data_2017)  # Assuming setup_s3_mock can handle multiple files correctly
        mock_s3.get_object.side_effect = [{"Body": MagicMock(read=lambda: mock_data_2017)},
                                          {"Body": MagicMock(read=lambda: mock_data_2018)}]
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2018",
                "metadata_only": "false"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        total_events_without_duplication = len(data_2017["events"]) + len(data_2018["events"]) - 1
        assert len(body["events"]) == total_events_without_duplication  # Ensure duplicate is not included

def test_data_filtering_by_year():
    with patch("code.retrieval_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        with open("tests/mock_s3/afr/2017.json", "rb") as file_2017, open("tests/mock_s3/afr/2018.json", "rb") as file_2018:
            mock_data_2017 = file_2017.read()
            mock_data_2018 = file_2018.read()
        # Setup mock S3 response to list both 2017 and 2018 files
        mock_s3.list_objects_v2.return_value = {
            "Contents": [
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2017.json"},
                {"Key": "SE3011-24-F11A-02/processed_data/afr/2018.json"}
            ]
        }
        # Mock get_object to return the correct file based on the Key
        def get_object(Bucket, Key):
            if "2017" in Key:
                return {"Body": MagicMock(read=lambda: mock_data_2017)}
            elif "2018" in Key:
                return {"Body": MagicMock(read=lambda: mock_data_2018)}
            else:
                raise ValueError("File Key not recognized")
        mock_s3.get_object.side_effect = get_object
        
        event = {
            "queryStringParameters": {
                "dataset_id": "afr",
                "start_year": "2017",
                "end_year": "2018",
                "metadata_only": "false"
            }
        }
        response = handler(event, None)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])

        expected_event_count = 12
        assert len(body["events"]) == expected_event_count, "Expected number of events not found."
