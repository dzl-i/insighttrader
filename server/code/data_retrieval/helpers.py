from datetime import datetime

def convert_to_adage_event(item):
    """
    Convert a PostgreSQL item to an ADAGE event.
    `item` is a dictionary with keys matching the database columns.
    """
    if item.get('classifications') is None:
        item['classifications'] = ''
        
    if item.get('named_entities') is None:
        item['named_entities'] = ''

    return {
        "time_object": {
            "timestamp": item.get('publication_date').isoformat() if item.get('publication_date') else None,
            "timezone": "GMT+11"
        },
        "event_type": "article",
        "attribute": {
            "event_id": item.get('guid'),
            "headline": item.get('headline'),
            "publication_date": item.get('publication_date').isoformat() if item.get('publication_date') else None,
            "author": item.get('author'),
            "section": item.get('section', ''),
            "word_count": item.get('word_count', 0),
            "sentiment_polarity": item.get('sentiment_polarity', 0.0),
            "sentiment_subjectivity": item.get('sentiment_subjectivity', 0.0),
            "avg_sentence_length": item.get('avg_sentence_length', 0.0),
            "classifications": item.get('classifications', []).split(","),
            "named_entities": item.get('named_entities', []).split(","),
            "page_no": str(item.get('page_no')),
        }
    }

def construct_adage_json(events):
    """
    Construct the full ADAGE JSON structure with provided events.
    `events` is a list of event dictionaries.
    """
    return {
        "data_source": "Australian Financial Review",
        "dataset_type": "News Articles",
        "dataset_id": "afr",
        "time_object": {
            "timestamp": datetime.now().isoformat(),
            "timezone": "GMT+11"
        },
        "events": events
    }
