from datetime import date, datetime
import json
import psycopg2
import os
from psycopg2.extras import RealDictCursor

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def handler(event, context):
    with psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            query_params = event.get("queryStringParameters", {})
            aggregate_type = query_params.get('aggregate_type', 'overall_sentiment')

            start_date = query_params.get("start_date", "2000-01-01")
            end_date = query_params.get("end_date", "2023-12-31")
            topic = query_params.get("topic", "Australia")

            if start_date > end_date:
                start_date, end_date = end_date, start_date

            filters = "WHERE a.publication_date BETWEEN %s AND %s"
            params = [start_date, end_date]
            if 'author' in query_params:
                filters += " AND a.author ILIKE %s"
                params.append(f"%{query_params['author']}%")
            if 'headline' in query_params:
                filters += " AND a.headline ILIKE %s"
                params.append(f"%{query_params['headline']}%")
            if 'section' in query_params:
                filters += " AND a.section ILIKE %s"
                params.append(query_params['section'])
            if 'page_no' in query_params:
                filters += " AND a.page_no = %s"
                params.append(query_params['page_no'])
            if 'guid' in query_params:
                filters += " AND a.guid = %s"
                params.append(query_params['guid'])
            
            if aggregate_type == 'overall_sentiment':
                query = f"""
                SELECT 
                    CASE 
                        WHEN sentiment_polarity > 0.1 THEN 'Positive'
                        WHEN sentiment_polarity < -0.05 THEN 'Negative'
                        ELSE 'Neutral'
                    END AS sentiment_group,
                    COUNT(*) AS count
                FROM articles a
                {filters}
                GROUP BY sentiment_group;
                """
            elif aggregate_type == 'topic_sentiment':
                query = f"""
                SELECT 
                    c.classification,
                    COUNT(CASE WHEN a.sentiment_polarity > 0.1 THEN 1 END) AS Positive,
                    COUNT(CASE WHEN a.sentiment_polarity BETWEEN -0.05 AND 0.1 THEN 1 END) AS Neutral,
                    COUNT(CASE WHEN a.sentiment_polarity < -0.05 THEN 1 END) AS Negative
                FROM 
                    articles a
                JOIN 
                    article_classifications ac ON a.guid = ac.article_guid
                JOIN 
                    classifications c ON ac.classification_id = c.id
                {filters}
                GROUP BY 
                    c.classification
                ORDER BY 
                    COUNT(*) DESC
                LIMIT 30;
                """
            elif aggregate_type == 'market_sentiment_over_time':
                query = f"""
                SELECT month,
                    CASE 
                        WHEN avg_sentiment > 0.1 THEN 'Positive'
                        WHEN avg_sentiment < -0.05 THEN 'Negative'
                        ELSE 'Neutral'
                    END AS sentiment_group,
                    count
                FROM (
                    SELECT DATE_TRUNC('month', a.publication_date) AS month, AVG(a.sentiment_polarity) as avg_sentiment, COUNT(*) as count
                    FROM articles a
                    {filters}
                    GROUP BY month
                ) as subquery
                ORDER BY month, count DESC
                LIMIT 30;
                """
            elif aggregate_type == 'classification_distribution':
                query = f"""
                SELECT c.classification, COUNT(*) AS count
                FROM article_classifications ac
                JOIN classifications c ON ac.classification_id = c.id
                JOIN articles a ON ac.article_guid = a.guid
                {filters}
                GROUP BY c.classification
                ORDER BY count DESC
                LIMIT 30;
                """
            elif aggregate_type == 'named_entity_distribution':
                query = f"""
                SELECT e.entity, COUNT(*) AS count
                FROM article_named_entities ae
                JOIN named_entities e ON ae.entity_id = e.id
                JOIN articles a ON ae.article_guid = a.guid
                {filters}
                GROUP BY e.entity
                ORDER BY count DESC
                LIMIT 30;
                """
            elif aggregate_type == 'count':
                query = f"""
                SELECT COUNT(*) as count
                FROM articles a
                {filters};
                """
            elif aggregate_type == 'topic_sentiment_over_time':
                query = f"""
                SELECT 
                    DATE_TRUNC('month', a.publication_date) AS month,
                    COUNT(*) AS Total_Articles,
                    COUNT(CASE WHEN a.sentiment_polarity > 0.1 THEN 1 END) AS Positive,
                    COUNT(CASE WHEN a.sentiment_polarity BETWEEN -0.05 AND 0.1 THEN 1 END) AS Neutral,
                    COUNT(CASE WHEN a.sentiment_polarity < -0.05 THEN 1 END) AS Negative
                FROM 
                    articles a
                JOIN 
                    article_named_entities ane ON a.guid = ane.article_guid
                JOIN 
                    named_entities ne ON ane.entity_id = ne.id
                {filters}
                AND 
                    ne.entity = '{topic}'
                GROUP BY 
                    month
                ORDER BY 
                    month;
                """
            else:
                return {
                    "statusCode": 400,
                    "body": json.dumps({ "error": "Invalid aggregate_type" }, indent=2),
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                }

            cursor.execute(query, params)
            result = cursor.fetchall()
            
            # Serialise the dates to strings
            for item in result:
                for key, value in item.items():
                    if key == 'month':
                        item[key] = value.strftime("%Y-%m")
            
            for item in result:
                for key, value in item.items():
                    if isinstance(value, (datetime, date)):
                        item[key] = value.isoformat()
            
            return {
                "statusCode": 200,
                "body": json.dumps({ "result": result }, indent=2),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
