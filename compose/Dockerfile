FROM python:3.6

RUN apt-get update && apt-get install -y vim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN pip install --upgrade pip ipdb ipython

COPY . /usr/src/app/

RUN pip install git+https://github.com/bigchaindb/bigchaindb.git
