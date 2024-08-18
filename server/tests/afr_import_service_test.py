import json
from unittest.mock import patch, MagicMock
from code.afr_import_service.handler import handler


def test_handler_with_valid_input():
    # Mocking S3 client behavior
    with patch("code.afr_import_service.handler.boto3.client") as mock_boto3:
        # Setup mock S3 response
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        mock_s3.list_objects_v2.return_value = {
            "Contents": [{"Key": "SE3011-24-F11A-02/raw_datasets/afr/afr_2017.xml"}]
        }
        mock_s3.get_object.return_value = {
            "Body": MagicMock(
                read=lambda: b"<dcdossier><document>...</document></dcdossier>"
            )
        }

        # Call handler with a specific dataset and year range
        event = {
            "body": json.dumps(
                {"dataset_id": "afr", "start_year": "2017", "end_year": "2017"}
            )
        }
        response = handler(event, None)

        assert response["statusCode"] == 200
        assert response["body"] == '{"status":"Success"}'


def test_handler_with_invalid_input():
    # Mock S3 client to return a default response for any input since it shouldn't reach S3 interactions
    with patch("code.afr_import_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3

        # Call handler with missing 'dataset_id'
        event = {"body": json.dumps({"start_year": "2017", "end_year": "2017"})}
        response = handler(event, None)

        # Expecting a server error
        assert response["statusCode"] == 500


def test_handler_with_no_matching_files():
    # Mock S3 client to simulate no files found for the given criteria
    with patch("code.afr_import_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        mock_s3.list_objects_v2.return_value = {"Contents": []}

        # Call handler expecting no files for a future year range
        event = {
            "body": json.dumps(
                {"dataset_id": "afr", "start_year": "3000", "end_year": "3001"}
            )
        }
        response = handler(event, None)

        assert response["statusCode"] == 404
        assert response["body"] == '{"status":"No data found"}'


def test_handler_with_xml_parsing_error():
    # Mock S3 client to simulate an XML parsing error
    with patch("code.afr_import_service.handler.boto3.client") as mock_boto3:
        mock_s3 = MagicMock()
        mock_boto3.return_value = mock_s3
        mock_s3.list_objects_v2.return_value = {
            "Contents": [{"Key": "SE3011-24-F11A-02/raw_datasets/afr/file_2015.xml"}]
        }
        mock_s3.get_object.return_value = {
            "Body": MagicMock(read=lambda: b"<invalid_xml>")
        }

        # Call handler with a dataset and year range
        event = {
            "body": json.dumps(
                {"dataset_id": "afr", "start_year": "2015", "end_year": "2015"}
            )
        }
        response = handler(event, None)

        assert response["statusCode"] == 500
        assert (
            "Error" == json.loads(response["body"])["status"]
        )

