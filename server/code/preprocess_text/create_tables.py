import psycopg2
import os
import json

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def handler(event, context):
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT)

    cursor = conn.cursor()
    
    # DROP TABLE article_classifications;
    # DROP TABLE article_named_entities;
    # DROP TABLE classifications;
    # DROP TABLE named_entities;
    # DROP TABLE articles;
    
    create_articles_table_query = """
    CREATE TABLE IF NOT EXISTS articles (
        guid VARCHAR(255) PRIMARY KEY,
        headline TEXT,
        author VARCHAR(255),
        section VARCHAR(255),
        modified TIMESTAMP,
        publication_date DATE,
        page_no VARCHAR(10),
        word_count INT,
        sentiment_polarity FLOAT,
        sentiment_subjectivity FLOAT,
        avg_sentence_length FLOAT,
        topic VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    create_classifications_table_query = """
    CREATE TABLE IF NOT EXISTS classifications (
        id SERIAL PRIMARY KEY,
        classification TEXT UNIQUE
    );
    """

    create_named_entities_table_query = """
    CREATE TABLE IF NOT EXISTS named_entities (
        id SERIAL PRIMARY KEY,
        entity TEXT UNIQUE
    );
    """

    create_articles_classifications_table_query = """
    CREATE TABLE IF NOT EXISTS article_classifications (
        article_guid VARCHAR(255),
        classification_id INTEGER,
        PRIMARY KEY (article_guid, classification_id),
        FOREIGN KEY (article_guid) REFERENCES articles(guid),
        FOREIGN KEY (classification_id) REFERENCES classifications(id)
    );
    """

    create_articles_entities_table_query = """
    CREATE TABLE IF NOT EXISTS article_named_entities (
        article_guid VARCHAR(255),
        entity_id INTEGER,
        PRIMARY KEY (article_guid, entity_id),
        FOREIGN KEY (article_guid) REFERENCES articles(guid),
        FOREIGN KEY (entity_id) REFERENCES named_entities(id)
    );
    """

    cursor.execute(create_articles_table_query)
    cursor.execute(create_classifications_table_query)
    cursor.execute(create_named_entities_table_query)
    cursor.execute(create_articles_classifications_table_query)
    cursor.execute(create_articles_entities_table_query)
    
    conn.commit()
    
    cursor.close()
    conn.close()

    print("Tables created successfully.")

    return {
        'statusCode': 200,
        'body': json.dumps('SUCCESS')
    }

