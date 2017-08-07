# TopJobs.lk Scraper

```js
const topjobs = require('topjobslk-scraper');

topJobs
  .scrapePage(TopJobs.Section.SOFTWARE)
  .then((data) => {
    console.log(
      JSON.stringify(data, null, 2)
    );
  })
  .catch((error) => {
    console.log(error);
  });
```
