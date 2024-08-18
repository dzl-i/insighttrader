FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ${LAMBDA_TASK_ROOT}

RUN pip install -r requirements.txt
COPY handler.py ${LAMBDA_TASK_ROOT}

# RUN python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('stopwords'); nltk.download('maxent_ne_chunker'); nltk.download('words'); nltk.download('averaged_perceptron_tagger')"

CMD ["handler.handler"]
