const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const postloadFile = `
if (window.$) {
  ${fs.readFileSync("./postload.js", "utf8")}
}
window.scraped_transactions;
`;

(async () => {
  const fetchPage = async url => {
    console.log(`scraping ${url}...`);
    const dom = await JSDOM.fromURL(url, {
      runScripts: "dangerously",
      resources: "usable",
      beforeParse: window => {
        window.setTimeout = (fn, delay) => fn();
        window.alert = () => {}; // make alert non blocking
      }
    });

    const res = await new Promise(resolve => {
      const handle = setInterval(() => {
        const result_outside = dom.window.eval(postloadFile);
        if (result_outside) {
          clearInterval(handle);
          resolve(result_outside);
        }
      }, 16);
    });
    console.log(`${url} scraped!`);
    return res;
  };

  const fetchPromises = [];
  for (start = 0; start < 5000; start += 50) {
    fetchPromises.push(
      fetchPage(`http://web.bankin.com/challenge/index.html?start=${start}`)
    );
  }

  const all_transactions = await Promise.all(fetchPromises);
  console.log([].concat.apply([], all_transactions));
})();
