const request = require("axios");
const url = require("url");
const cheerio = require("cheerio");
const debug = require("debug")("topjobs-scraper");

const TOPJOBS_DOMAIN = "http://topjobs.lk";
const TOPJOBS_NUMBER_OF_RECORDS = 1000;

class TopJobs {
  constructor(config) {
    this.url = config.url;
    this.numberOfPages = config.numberOfPages || 1;
    this.numberOfRecords = config.numberOfRecords || TOPJOBS_NUMBER_OF_RECORDS;
    this.retrieveAttachments = config.retrieveAttachments || false;
  }

  scrape() {
    debug(`method[scrape] = ${this.url} with ${this.numberOfPages} pages`);
    return this.getPages(this.url, this.numberOfPages);
  }

  scrapePage(uri) {
    debug(`method[scrape] = ${uri}`);
    return new Promise((resolve, reject) => {
      if (!uri || !this.url || typeof this.url === "undefined") {
        throw new Error("URL is required.");
      }
      debug(`method[scrape] -> creating web request to ${uri}`);
      request
        .get(uri || this.url)
        .then(response => {
          debug(
            `method[scrape] <- got response = status code is ${
              response.status
            } from ${uri}`
          );
          let html = response.data;
          let $ = cheerio.load(html);
          // Get the table records .. they make it so easy.
          let tableRows = [];
          debug(
            `method[scrape] <- looping through the record ${
              this.numberOfRecords
            } times.`
          );
          for (var index = 0; index <= this.numberOfRecords; index++) {
            let currentRow = $(`#tr${index}`);
            tableRows.push(currentRow);
          }
          debug(`method[scrape] <- Removing elements without children`);
          // Remove any elements without any children.
          tableRows = tableRows.filter(e => {
            return e.children().length >= 7;
          });
          debug(`method[scrape] <- mapping data to array`);
          // Return the neccesary bits from the table rows
          let jobs = tableRows.map(async line => {
            let position,
              company,
              description,
              link,
              openingDate,
              closingDate,
              attachment;
            company = line
              .find("td:nth-child(3)")
              .find("h1")
              .text()
              .trim();
            position = line
              .find("td:nth-child(3)")
              .find("h2")
              .text()
              .trim();
            description = line
              .find("td:nth-child(4)")
              .text()
              .trim();
            openingDate = line
              .find("td:nth-child(5)")
              .text()
              .trim();
            openingDate = new Date(openingDate);
            closingDate = line
              .find("td:nth-child(6)")
              .text()
              .trim();
            closingDate = new Date(closingDate);
            let _link = line
              .find("td:nth-child(3)")
              .find("h2")
              .find("a")
              .attr("href")
              .match(/\/(.*).jsp'/g)[0]
              .trim();
            link = url.resolve(TOPJOBS_DOMAIN, _link);
            if (this.retrieveAttachments) {
              attachment = await this.getAttachment(link);
            }
            return {
              position,
              company,
              description,
              openingDate,
              closingDate,
              link,
              attachment
            };
          });
          Promise.all(jobs).then(results => {
            debug(`method[scrape] <- found ${jobs.length} items`);
            return resolve(results);
          });
        })
        .catch(error => {
          return reject(error);
        });
    });
  }

  getPages(uri, numberOfPages = 1) {
    return new Promise((resolve, reject) => {
      if (
        !numberOfPages ||
        !this.numberOfPages ||
        typeof this.numberOfPages === "string"
      ) {
        throw new Error("numberOfPages is not defined or should be a number.");
      }
      let pages = [];
      for (var index = 1; index <= numberOfPages; index++) {
        pages.push(this.scrapePage(`${uri}&pageNo=${index}`));
      }
      Promise.all(pages)
        .then(data => {
          resolve([].concat.apply([], data));
        })
        .catch(error => reject(error));
    });
  }

  getAttachment(link) {
    return new Promise((resolve, reject) => {
      debug(`method[getImage] -> creating web request to ${link}`);
      request
        .get(link)
        .then(response => {
          debug(`method[getAttachment] <- got response from ${link}`);
          let item;
          let html = response.data;
          debug(`method[getAttachment] <- parsing response from ${link}`);
          let $ = cheerio.load(html);
          let element = $("#upper img").attr("src");
          // Check if it is a link to an image
          if (element && element.startsWith("/logo/")) {
            debug(`method[getAttachment] <- ${link} has image`);
            item = url.resolve(TOPJOBS_DOMAIN, element);
            return resolve({
              type: "image",
              link: item
            });
          }
          // Check if it is an image but not a link
          if (element && !element.startsWith("/logo/")) {
            debug(`method[getAttachment] <- ${link} has base encoded image`);
            debug(`method[getAttachment] -> returning ${item}`);
            return resolve({ type: "base64", link: element });
          }
          // Check if iFrame
          let iframe = $("#upper img").attr("href");
          if (iframe && iframe.length > 0) {
            debug(`method[getAttachment] <- ${link} has iframe`);
            return resolve({ type: "href", link: iframe });
          }
          // Check if text
          let htmlContent = $("#upper")
            .children()
            .html();
          if (htmlContent) {
            debug(`method[getAttachment] <- ${link} has text`);
            return resolve({ type: "html", link: htmlContent });
          }
          return resolve({
            type: "unknown"
          });
        })
        .catch(error => reject(error));
    });
  }
}

module.exports = TopJobs;
module.exports.Section = require("./section.lib");
