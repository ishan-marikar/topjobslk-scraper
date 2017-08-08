# TopJobs.lk Scraper

```js
const TopJobsScraper = require('topjobslk-scraper');


let topJobs = new TopJobsScraper({
  numberOfPages: 5,
  url: TopJobsScraper.Section.SOFTWARE
});

topJobs
  .scrape()
  .then(data => {
    console.log(
      JSON.stringify(data, null, 2)
    );
    console.log(`There are ${data.length} listings.`);
  })
  .catch(error => {
    console.log(error);
  });
```
