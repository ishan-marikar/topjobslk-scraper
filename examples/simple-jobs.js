const TopJobs = require('../');
let topJobs = new TopJobs();

topJobs
  .scrapePage(TopJobs.Section.SOFTWARE)
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.log(error);
  });

topJobs
  .getPages(9).then((data) => {
    console.log(JSON.stringify(data, null, 2));
  }).catch((error) => {
    console.log(error);
  });
