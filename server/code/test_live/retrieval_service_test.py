# retrieval_service_test.py

import unittest
import requests

class TestRetrievalService(unittest.TestCase):
    BASE_URL = "https://kffxjq6hph.execute-api.ap-southeast-2.amazonaws.com/F11A_CRUNCH_API/retrieval_service"

    def test_retrieve_data_success(self):
        """Test retrieving data successfully from the service."""
        params = {
            "dataset_id": "testing",
            "start_year": "2017",
            "end_year": "2017",
            "metadata_only": "true"
        }
        response = requests.get(self.BASE_URL, params=params)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue("events" in data)
        self.assertIsInstance(data["events"], list)

    def test_retrieve_data_no_data_found(self):
        """Test retrieving data for a dataset that doesn't exist."""
        params = {
            "dataset_id": "nonexistent",
            "start_year": "2017",
            "end_year": "2017",
            "metadata_only": "true"
        }
        response = requests.get(self.BASE_URL, params=params)
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(data["status"], "No data found")
