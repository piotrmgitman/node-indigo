const axios = require('axios');
const jsdom = require('jsdom').JSDOM;
const debug = require('debug');
const log = debug('log');

/**
 * Class Wiki that queries data from english wikipedia api endpoints
 */
class Wiki {
	constructor() {
		this.page = 'List_of_metropolitan_areas_in_Asia';
		this.array = [];
	}

	/**
   * Returns an array of data
   */
	get arrayOfData() {
		if (this.array.length > 0) {
			return this.array;
		} else {
			return [{ 'error': 'Array couldn\'t receive any data.' }];
		}
	}

	/**
   * Returns URL based on provided aim param
   * 
   * @param {*} aim must be a string (title, api or wiki)
   * @param {*} url must be a string (the full address of a page)
   */
	setUrl(aim, url = ('http://en.wikipedia.org/wiki/' + this.page)) {
		let protocol = url.split('//')[0];
		let domain = url.split('//')[1];

		switch (aim) {
		case 'title':
			return domain.split('/').pop();
		case 'api':
			return protocol + '//' + domain.split('/').shift() + '/w/api.php?';
		case 'wiki':
			return protocol + '//' + domain.split('/').shift();
		default:
			break;
		}
	}

	/**
   * Checks if the page exists
   */
	checkIfPageExists() {
		return new Promise((resolve, reject) => {
			axios.get(this.setUrl('api') + 'action=query&list=search&srsearch=' + this.setUrl('title') + '&format=json')
				.then(response => {
					if (response.data.query.search.length > 0) {
						response.data.query.search.map((v, i) => {
							let thePage = this.page.replace(/_/g, ' ');
							if (v.title === thePage && i === 0) {
								this.getSectionIndex().then(() => resolve());
								log('Searched page exists.');
							}
						});
					} else {
						log('Searched page doesn\'t exist.');
					}
				})
				.catch(error => {
					if (error) {
						reject();
						log(error);
					}
				});
		});
	}

	/**
   * Gets the index of a table section from the wikipedia page
   */
	getSectionIndex() {
		return new Promise((resolve, reject) => {
			axios.get(this.setUrl('api') + 'action=parse&page=' + this.setUrl('title') + '&prop=sections&format=json')
				.then(response => {
					response.data.parse.sections.map(v => {
						if (v.anchor === 'List') {
							this.getSectionContent(parseInt(v.index)).then(() => resolve());
							log('Section index stored.');
						}
					});
				})
				.catch(error => {
					if (error) {
						reject();
						log(error);
					}
				});
		});
	}
	/**
   * Gets the content of a table section from the wikipedia page
   * 
   * @param  {} sectionIndex must be a number
   */
	getSectionContent(sectionIndex) {
		return new Promise((resolve, reject) => {
			axios.get(this.setUrl('api') + 'action=parse&page=' + this.setUrl('title') + '&section=' + sectionIndex + '&format=json')
				.then(response => {
					let window = new jsdom(response.data.parse.text['*']).window;
					let temp = window.document.querySelectorAll('table tr');

					resolve(this.transformData(temp, this.array));
					log('Transformed table\'s data stored in an array.');
				})
				.catch(error => {
					if (error) {
						reject();
						log(error);
					}
				});
		});
	}

	/**
   * Transforms data and push them into new array
   * 
   * @param  {} data must be a DOM object
   * @param  {} array must be a reference to an empty array
   */
	transformData(data, array) {
		let tbody = [data];

		let name = null;
		let country = null;
		let population = null;
		let url = null;

		let categoryAreaIndex = null;
		let categoryCountryIndex = null;
		let categoryPopulationIndex = null;
		let categoryAreaUrlIndex = null;

		let categoryArray = [];
		let nameConditions = ['area', 'city', 'name'];
		let countryConditions = ['country'];
		let populationConditions = ['population', 'metropopulation'];

		tbody.forEach((c) => c.forEach((v, i) => {
			if (i < 1) {
				v.querySelectorAll('th').forEach((e, k) => {
					categoryArray.push({ 'index': k, 'category': e.textContent.toString() });
				});
				log('Table\'s category structure stored.');
			} else if (i > 0 && categoryArray.length > 0) {
				categoryArray.map(v => {
					nameConditions.some(el => v.category.toLowerCase().includes(el)) ? categoryAreaIndex = v.index : categoryAreaIndex = 1;
					nameConditions.some(el => v.category.toLowerCase().includes(el)) ? categoryAreaUrlIndex = v.index : categoryAreaUrlIndex = 1;
					countryConditions.some(el => v.category.toLowerCase().includes(el)) ? categoryCountryIndex = v.index : categoryCountryIndex = 3;
					populationConditions.some(el => v.category.toLowerCase().includes(el)) ? categoryPopulationIndex = v.index : categoryPopulationIndex = 4;
				});

				v.querySelectorAll('td').forEach((e, k) => {
					if (categoryAreaIndex !== null && categoryAreaUrlIndex !== null
            && categoryCountryIndex !== null && categoryPopulationIndex !== null) {
						switch (k) {
						case categoryAreaIndex || categoryAreaUrlIndex:
							name = e.textContent.split('\n').shift();
							url = e.querySelectorAll('a').length > 0 ? e.querySelector('a').href.split('\n').shift() : null;
							break;
						case categoryCountryIndex:
							country = e.textContent.split('\n').shift();
							break;
						case categoryPopulationIndex:
							population = isNaN(parseFloat(e.textContent.split('\n').shift().replace(/,/g, '')))
								? e.textContent.split('\n').shift()
								: parseFloat(e.textContent.split('\n').shift().replace(/,/g, ''));
							break;
						default:
							break;
						}
					}
				});

				array.push({
					'name': name ? name : null,
					'country': country ? country : null,
					'population': population ? population : null,
					'url': url ? this.setUrl('wiki') + url : this.setUrl('wiki') + '/' + this.setUrl('title')
				});
			}
		}));
		log('Table\'s data transformation completed.');
	}
}

module.exports = Wiki;
