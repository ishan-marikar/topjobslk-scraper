# TopJobs.lk Scraper

A tiny module to scrape job listings off topjobs.lk.

## Installation

`npm installtopjobslk-scraper --save`
**or**
`yarn topjobslk-scraper`

## Usage

### Customizable Options

```js
numberOfPages;
// Number of pages to scrape (only use when pagination is enabled on the website)
// defaults to 1

numberOfRecords;
// Maximum number of records on a page. Set this to something safe, like 1000 (formerly 43)
// defaults to 1000 (to accomodate the most amount of records)

retrieveAttachments;
// Retrieve images, links and html of the actual advertisements
// defaults to false turning this on will cause results to take longer due to the number of requests that will have to be made.
```

### Get Sections

```js
const TopJobsScraper = require("topjobslk-scraper");
// Returns the sections
console.log(Object.keys(TopJobsScraper.Section));
```

### Get Jobs Without Attachments

```js
const TopJobsScraper = require("topjobslk-scraper");
let topJobs = new TopJobsScraper({
  retrieveAttachments: false,
  url: TopJobsScraper.Section.SOFTWARE
});

topJobs
  .scrape()
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    console.log(`There are ${data.length} listings.`);
  })
  .catch(error => {
    console.log(error);
  });
```

### Get Jobs With Attachments

_Note: Getting jobs with Attachments takes longer than getting jobs without attachments due to the number of requests being made._

```js
const TopJobsScraper = require("topjobslk-scraper");
let topJobs = new TopJobsScraper({
  retrieveAttachments: true,
  url: TopJobsScraper.Section.SOFTWARE
});

topJobs
  .scrape()
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    console.log(`There are ${data.length} listings.`);
  })
  .catch(error => {
    console.log(error);
  });
```

## Tests

No tests yet. I like to live dangerously.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style
Add unit tests for any new or changed functionality. Lint and test your code.
