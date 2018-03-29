FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install \
    && npm install -g codecov \
    && npm install -g cowsay
