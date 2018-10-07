const express = require('express');
const cors = require('cors');
const Wiki = require('./wiki');
const debug = require('debug');

const port = 4000;
const app = express();

const log = debug('log');

/**
 * Class Middleware that returns promise with resolved array of data
 * from the english wikipedia api endpoint
 */
class Middleware {
	constructor() { }

	/**
     * Middleware function
     * 
     * @param {*} req HTTP request argument to the middleware function
     * @param {*} res HTTP respons argument to the middleware function
     * @param {*} next Callback argument to the middleware function
     */
	middleware(req, res, next) {
		let fetchData = new Promise((resolve, reject) => {
			let wiki = new Wiki();
			wiki.checkIfPageExists().then(() => {
				resolve(wiki.arrayOfData);
				log('Array of data sent to Middleware.');
			}).catch(error => {
				if (error) reject();
				log('Array of data couldn\'t be sent to Middleware.');
			});
		}).then((data) => {
			if (data) {
				req.data = data;
				next();
			}
		}).catch(error => {
			log(error);
		});

		return fetchData;
	}
}

/**
 * Class Server that starts new instance of a server on port 4000
 */
class Server extends Middleware {
	constructor() {
		super();
		this.initCORS();
		this.initMiddleware();
		this.initRoutes();
		this.start();
	}

	/**
     * Enables CORS
     */
	initCORS() {
		app.use(cors());
	}

	/**
     * Initializes middleware
     */
	initMiddleware() {
		app.use(this.middleware);
	}

	/**
     * Creates routes
     */
	initRoutes() {
		app.get('/', (req, res) => {
			try {
				res.status(200).send(JSON.stringify(req.data, null, '\t'));
				log('Response object should contain new data.');
			} catch (error) {
				res.status(204).send('The server cannot return any content.');
				log('Response object may not conatin any data.');
			}
		});
	}

	/**
     * Starts server
     */
	start() {
		app.listen(port, () => {
			log('Listening on port: ' + port);
		});
	}

}

new Server();