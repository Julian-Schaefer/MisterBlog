
# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.9-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Log Level
ENV LOG_LEVEL warning

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

#Install NodeJS
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_16.x  | bash -
RUN apt-get -y install nodejs

# Install production dependencies.
RUN pip install pipenv
RUN pipenv install --system
RUN python -m nltk.downloader brown -d /usr/local/nltk_data
RUN python -m nltk.downloader punkt -d /usr/local/nltk_data
RUN python -m nltk.downloader maxent_treebank_pos_tagger -d /usr/local/nltk_data
RUN python -m nltk.downloader movie_reviews -d /usr/local/nltk_data
RUN python -m nltk.downloader wordnet -d /usr/local/nltk_data
RUN python -m nltk.downloader stopwords -d /usr/local/nltk_data
RUN pipenv --clear

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
# Timeout is set to 0 to disable the timeouts of the workers to allow Cloud Run to handle instance scaling.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 10 --timeout 0 --log-level $LOG_LEVEL "app:start_on_gcloud()"
