const TopJobs = require("../");
let topJobs = new TopJobs({
  url: TopJobs.Section.SOFTWARE,
  retrieveAttachments: false
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

// topJobs
//   .scrapePage()
//   // or .scrapePage(TopJobs.Section.SOFTWARE);
//   .then(data => {
//     console.log(JSON.stringify(data, null, 2));
//   })
//   .catch(error => {
//     console.log(error);
//   });
