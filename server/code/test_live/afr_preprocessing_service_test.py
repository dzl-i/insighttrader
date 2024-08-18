import unittest
import requests

class TestAFRPreprocessingService(unittest.TestCase):
    BASE_URL = "https://kffxjq6hph.execute-api.ap-southeast-2.amazonaws.com/F11A_CRUNCH_API/collection/afr_preprocessing_service"

    def test_preprocessing_2017_success(self):
        """Test preprocessing for the year 2017 data successfully."""
        params = {
            "dataset_id": "testing",
            "start_year": "2017",
            "end_year": "2017"
        }
        response = requests.get(self.BASE_URL, params=params)
        print(response.json())
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'Success')
        # Ensure at least one event is processed and contains new attributes
        self.assertTrue(data['events'][0]['attribute'].get('pre_processed_text') is not None)

    def test_preprocessing_2017_to_2018_success(self):
        """Test preprocessing from 2017 to 2018 data successfully."""
        params = {
            "dataset_id": "testing",
            "start_year": "2017",
            "end_year": "2018"
        }
        response = requests.get(self.BASE_URL, params=params)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'Success')
        # Check for the new attributes in the response
        expected_attrs = ['modified', 'pre_processed_text', 'word_count', 'sent_polarity', 'sent_subjectivity', 'avg_sentence_length', 'named_entities', 'topic']
        for attr in expected_attrs:
            self.assertIn(attr, data['events'][0]['attribute'])

    def test_preprocessing_failure_no_data(self):
        """Test preprocessing with parameters that yield no data."""
        params = {
            "dataset_id": "nonexistent_dataset",
            "start_year": "2017",
            "end_year": "2018"
        }
        response = requests.get(self.BASE_URL, params=params)
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(data['message'], 'Dataset not found')
