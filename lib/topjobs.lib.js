const request = require('axios');
const url = require('url');
const cheerio = require('cheerio');

const TOPJOBS_DOMAIN = "http://topjobs.lk";
const TOPJOBS_NUMBER_OF_RECORDS = 39;

class TopJobs {

  constructor(config = {
    numberOfPages: 4
  }) {
    if(!config.url || typeof config.url === 'undefined') {
      throw new Error('URL is required.');
    }
    if(!config.numberOfPages || typeof config.numberOfPages === 'string') {
      throw new Error('numberOfPages is not defined or should be a number.');
    }
    this.url = config.url;
    this.numberOfPages = config.numberOfPages || 4;
  }

  scrapePage(uri) {
    return new Promise((resolve, reject) => {
      request
        .get(uri || this.url)
        .then((response) => {
          let html = response.data;
          let $ = cheerio.load(html);
          // Get the table records .. they make it so easy.
          let tableRows = [];
          for (var index = 0; index <= TOPJOBS_NUMBER_OF_RECORDS; index++) {
            let currentRow = $(`#tr${index}`);
            tableRows.push(currentRow);
          }
          // Remove any elements without any children.
          tableRows = tableRows.filter((e) => {
            return e
              .children()
              .length >= 7;
          });
          // Return the neccesary bits from the table rows
          let jobs = tableRows.map((line) => {
            let position, company, description, link, openingDate, closingDate;
            company = line.find('td:nth-child(3)').find('h1').text().trim();
            position = line.find('td:nth-child(3)').find('h2').text().trim();
            description = line.find('td:nth-child(4)').text().trim();
            openingDate = new Date(line.find('td:nth-child(5)').text().trim());
            closingDate = new Date(line.find('td:nth-child(6)').text().trim());
            let _link = line.find('td:nth-child(3)').find('h2').find('a').attr('href').match(/\/(.*).jsp'/g)[0].trim();
            link = url.resolve(TOPJOBS_DOMAIN, _link);
            return {
              position,
              company,
              description,
              openingDate,
              closingDate,
              link
            };
          });
          return resolve(jobs);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  getPages(numberOfPages = 4) {
    return new Promise((resolve, reject) => {
      let pages = [];
      for (var index = 1; index <= numberOfPages; index++) {
        pages.push(this.scrapePage(`${TOPJOBS_SOFTWARE}&pageNo=${index}`));
      }
      Promise
        .all(pages)
        .then((data) => {
          resolve([].concat.apply([], data));
        })
        .catch((error) => reject(error));
    });
  }

  getImage(link) {
    return new Promise((resolve, reject) => {
      request
        .get(link)
        .then((response) => {
          let html = response.data;
          let $ = cheerio.load(html);
          let base64Image = $('img.vacancy-img').attr('src');
          console.log('sd', base64Image);
          let imageBlob = new Buffer(base64Image, 'base64');

          return resolve(imageBlob);
        })
        .catch((error) => reject(error));
    });
  }
}

module.exports = TopJobs;
module.exports.Section = require('./section.lib');
