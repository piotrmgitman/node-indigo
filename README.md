# NodeIndigo

This project was generated with Node version v10.5.0

It is an API server with a single endpoint `/` that returns a list of Asia's largest cities in JSON format.

## Installation and Usage

You should have already installed:
    - node v10.5.0
    - npm v6.4.1

To start server:
    `npm install && npm run start`

To start server with a debug mode:
    `npm install && npm run start:log`

## To use server

Make sure your server is running `npm run start` or `npm run start:log` for a debug mode.

In a new terminal window type `curl http://localhost:4000/`.

You should receive a list of cities found on the page: `https://en.wikipedia.org/wiki/List_of_metropolitan_areas_in_Asia`. 

## CORS

Server has CORS being enabled.

## Linting

You can maintain your code quality with ease using already built in linter. Make sure you are in the project's main folder then type into terminal: `./node_modules/.bin/eslint server.js` or `./node_modules/.bin/eslint wiki.js`.
