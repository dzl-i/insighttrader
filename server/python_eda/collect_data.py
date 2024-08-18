import pandas as pd
from lxml import etree
import io
import json
import matplotlib.pyplot as plt
import nltk
from nltk import ne_chunk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.chunk import conlltags2tree, tree2conlltags, RegexpParser
from nltk.corpus import stopwords
from nltk.tag import pos_tag
from nltk.stem import PorterStemmer
from nltk.tree import Tree
import numpy as np
from wordcloud import WordCloud,STOPWORDS
import string
import re

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')

# pd.set_option('display.max_columns', None)
# pd.set_option('display.max_rows', None)
# pd.set_option('display.max_colwidth', None)

def pos_tagging(text):
    word_tokens = word_tokenize(text)
    return pos_tag(word_tokens)

def chunking(tagged_tokens, grammar='NP: {<DT>?<JJ>*<NN>}'):
    cp = RegexpParser(grammar)
    tree = cp.parse(tagged_tokens)
    return tree


def named_entity_recognition(tagged_tokens):
    tree = ne_chunk(tagged_tokens)
    return tree

def get_continuous_chunks(text, chunk_func=named_entity_recognition):
    chunked = chunk_func(pos_tag(word_tokenize(text)))
    continuous_chunk = []
    current_chunk = []

    for i in chunked:
        if type(i) == Tree:
            current_chunk.append(" ".join([token for token, pos in i.leaves()]))
        else:
            if current_chunk:
                named_entity = " ".join(current_chunk)
                if named_entity not in continuous_chunk:
                    continuous_chunk.append(named_entity)
                current_chunk = []

    if current_chunk:
        named_entity = " ".join(current_chunk)
        if named_entity not in continuous_chunk:
            continuous_chunk.append(named_entity)
    return continuous_chunk


def apply_nlp_operations(events_df):
    events_df['pos_tags'] = events_df['text_for_ner'].apply(pos_tagging)
    return events_df


def json_to_df(json):
    jsonEvent = json.loads(json)
    processed_events = []

    for event in jsonEvent['events']:
        headline = event["attribute"]["headline"]
        byline = event["attribute"]["byline"]
        text = event["attribute"]["text"]
        length = len(text.split()) if text else 0
        processed_events.append({
            "headlines": headline,
            "bylines": byline,
            "text": text,
            "length": length
        })
        
    events_df = pd.DataFrame(processed_events)
    return events_df

def clean_data(jsonEventStr): 
    jsonEvent = json.loads(jsonEventStr)
    processed_events = []

    for event in jsonEvent['events']:
        headline = event["attribute"]["headline"]
        byline = event["attribute"]["byline"]
        text = event["attribute"]["text"]
        length = len(text.split()) if text else 0
        processed_events.append({
            "headlines": headline,
            "bylines": byline,
            "text": text,
            "length": length
        })
        
    events_df = pd.DataFrame(processed_events)
    
    REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
    BAD_SYMBOLS_RE = re.compile('[^0-9a-zA-Z #+_]')
    STOPWORDS = set(stopwords.words('english'))
    stemmer = PorterStemmer()
    
    events_df['clean_text'] = events_df['text'].apply(lambda x: clean_text(x, STOPWORDS, REPLACE_BY_SPACE_RE, BAD_SYMBOLS_RE, stemmer))
    events_df['clean_length'] = events_df['clean_text'].apply(lambda x: len(x.split()))
    
    events_df['text_for_ner'] = events_df['text'].apply(lambda x: clean_text_for_ner(x, STOPWORDS, REPLACE_BY_SPACE_RE, BAD_SYMBOLS_RE))

    events_df = apply_nlp_operations(events_df)
    events_df['named_entities'] = events_df['text_for_ner'].apply(get_continuous_chunks)    
    events_df['noun_phrases'] = events_df['pos_tags'].apply(lambda tags: chunking(tags, grammar='NP: {<DT>?<JJ>*<NN>}'))
    print(events_df)
    return events_df


def clean_text(txt, stopwords, punctuation_filter, symbols_filter, stemmer):
    txt = txt.lower()
    txt = punctuation_filter.sub(' ', txt)
    txt = symbols_filter.sub('', txt)

    words = txt.split()

    filtered_words = [word for word in words if word not in stopwords]

    stemmed_words = [stemmer.stem(word) for word in filtered_words]

    clean_stemmed_txt = ' '.join(stemmed_words)
    return clean_stemmed_txt


def clean_text_for_ner(txt, stopwords, punctuation_filter, symbols_filter):
    txt = punctuation_filter.sub(' ', txt)
    txt = symbols_filter.sub('', txt)
    words = txt.split()
    filtered_words = [word for word in words if word.lower() not in stopwords]
    clean_txt = ' '.join(filtered_words)

    return clean_txt
    
def convert_to_adage_json(df):
    adage_data_model = {
        "data_source": "Australian Financial Review",
        "dataset_type": "News_Articles",
        "dataset_id": "AFR_2015",
        "time_object": {
            "timestamp": pd.Timestamp.now().isoformat(),
            "timezone": "GMT+11"
        },
        "events": []
    }
    
    for index, row in df.iterrows():
        event = {
            "time_object": {
                "timestamp": row["modified"].isoformat(),
                "duration": 0,
                "duration_unit": "second",
                "timezone": "GMT+11"
            },
            "event_type": "article",
            "attribute": {
                "guid": row["guid"],
                "byline": row["byline"],
                "headline": row["headline"],
                "section": row["section"],
                "publication_date": row["publication_date"].strftime("%Y-%m-%d"),
                "page_no": row["page_no"],
                "classifications": row["classifications"],
                "text": row.get("text")
            }
        }
        adage_data_model["events"].append(event)
    
    adage_data_model["time_object"]["timestamp"] = df["modified"].max().isoformat()
    
    return json.dumps(adage_data_model, indent=4)


xml_data = open('datasets/AFR_20150101-20150131.xml').read()

parser = etree.XMLParser(ns_clean=True)
xml = etree.parse(io.StringIO(xml_data), parser)

data = []

for dossier in xml.xpath('//dcdossier'):
    guid = dossier.get('guid')
    modified = dossier.get('modified')
    
    for doc in dossier.xpath('.//document'):
        newspaper_code = doc.xpath('.//NEWSPAPERCODE/text()')
        section = doc.xpath('.//SECTION/text()')
        story_name = doc.xpath('.//STORYNAME/text()')
        publication_date = doc.xpath('.//PUBLICATIONDATE/text()')
        newspaper = doc.xpath('.//NEWSPAPER/text()')
        page_no = doc.xpath('.//PAGENO/text()')
        byline = doc.xpath('.//BYLINE/text()')
        classifications = doc.xpath('.//CLASSIFICATION/text()')
        headline = doc.xpath('.//HEADLINE/text()')
        intro = doc.xpath('.//INTRO/text()')
        text = " ".join(doc.xpath('.//TEXT//text()'))
        
        data.append({
            'guid': guid,
            'modified': modified,
            'section': section[0].strip() if section else None,
            'publication_date': publication_date[0] if publication_date else None,
            'page_no': page_no[0].strip() if page_no else None,
            'byline': byline[0].strip() if byline else None,
            'classifications': classifications if classifications else None,
            'headline': headline[0].strip() if headline else None,
            'intro': intro[0].strip() if intro else None,
            'text': text.strip() if text else None,
        })

df = pd.DataFrame(data)
df['modified'] = pd.to_datetime(df['modified'])
df['publication_date'] = pd.to_datetime(df['publication_date'], errors='coerce')


df_cleaned = clean_data(convert_to_adage_json(df))
print(df_cleaned)
# df_cleaned['all_nammed'] = [','.join(map(str, l)) for l in all_nammed]