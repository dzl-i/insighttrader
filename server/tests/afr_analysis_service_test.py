import json
from unittest.mock import patch, MagicMock
from code.afr_analysis_service.handler import handler


@patch("code.afr_analysis_service.handler.boto3.client")
def test_handler_with_valid_input(mock_boto3):
    # Mock the S3 client behavior
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3

    # Mock the pickle.loads function
    mock_pickle = MagicMock()
    with patch("code.afr_analysis_service.handler.pickle.loads", mock_pickle):
        # Set up mock model, vectorizer, and label encoder
        mock_model = MagicMock()
        mock_vec = MagicMock()
        mock_enc = MagicMock()

        mock_pickle.side_effect = [mock_model, mock_vec, mock_enc]

        # Set up mock text vector and predicted label
        mock_text_vec = MagicMock()
        mock_vec.transform.return_value = [mock_text_vec]
        mock_predicted_label = [0]
        mock_model.predict.return_value = mock_predicted_label
        mock_enc.inverse_transform.return_value = ["topic_a"]

        # Set up mock event
        event = {"queryStringParameters": {"text": "This is a test text."}}

        # Call the handler function
        response = handler(event, None)

        # Assert the expected response
        assert response["statusCode"] == 200
        assert response["body"]["predicted_topic"] == "topic_a"


@patch("code.afr_analysis_service.handler.boto3.client")
def test_handler_with_missing_text(mock_boto3):
    # Mock the S3 client behavior
    mock_s3 = MagicMock()
    mock_boto3.return_value = mock_s3

    # Set up mock event with missing text
    event = {"queryStringParameters": {}}

    # Call the handler function
    response = handler(event, None)

    # Assert the expected error response
    assert response["statusCode"] == 500
    assert (
        "Error occured while preprocessing data"
        in json.loads(response["body"])["message"]
    )
