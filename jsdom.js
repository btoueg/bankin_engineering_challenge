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
        // make setTimeout no-op (assumption: used only to slow the scraping)
        window.setTimeout = (fn, delay) => fn(); // fix slowmode
        // make alert no-op (thus non-blocking)
        window.alert = () => {}; // fix failmode
      }
    });

    // jsdom fundamental limitation:
    // we cannot predict what scripts has been loaded
    // https://github.com/tmpvar/jsdom#asynchronous-script-loading
    // we need a hack: we poll dom.window.eval until window.$ is defined
    // it's not bullet proof but seems good enough
    // TODO add a timeout mechanism to prevent infinite loop
    const res = await new Promise(resolve => {
      const timerId = setInterval(() => {
        const scraped_transactions = dom.window.eval(postloadFile);
        if (scraped_transactions !== undefined) {
          clearInterval(timerId); // not sure it's required, but it's cleaner
          resolve(scraped_transactions);
        }
      }, 16); // ms (TODO experiments and measure to find the best value)
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
  console.log([].concat.apply([], all_transactions)); // flatten arrays
})();
