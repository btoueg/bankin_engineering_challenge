const fs = require("fs");
const puppeteer = require("puppeteer");

const postloadFile = fs.readFileSync("./postload.js", "utf8");

(async () => {
  const browser = await puppeteer.launch();

  const fetchPage = async url => {
    console.log(`scraping ${url}...`);
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    await page.evaluateOnNewDocument(
      "window.setTimeout = (fn, delay) => fn();"
    );
    await page.evaluateOnNewDocument("window.alert = window.console.log;");
    await page.goto(url);
    await page.addScriptTag({ content: postloadFile });
    console.log(`${url} scraped!`);
    return await page.evaluate("scraped_transactions");
  };

  const fetchPromises = [];
  for (start = 0; start < 5000; start += 50) {
    fetchPromises.push(
      fetchPage(`http://web.bankin.com/challenge/index.html?start=${start}`)
    );
  }

  const all_transactions = await Promise.all(fetchPromises);
  console.log([].concat.apply([], all_transactions));
  await browser.close();
})();
