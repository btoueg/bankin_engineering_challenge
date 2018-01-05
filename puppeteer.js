const fs = require("fs");
const puppeteer = require("puppeteer");

const postloadFile = fs.readFileSync("./postload.js", "utf8");

(async () => {
  const browser = await puppeteer.launch();

  const fetchPage = async url => {
    console.log(`scraping ${url}...`);
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    // make setTimeout no-op (assumption: used only to slow the scraping)
    // make alert non-blocking
    await page.evaluateOnNewDocument(`
      window.setTimeout = (fn, delay) => fn(); // fix slowmode
      window.alert = window.console.log; // fix failmode
    `);
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
  const output = {
    transactions: [].concat.apply([], all_transactions) // flatten arrays
  };
  fs.writeFileSync("./output.json", JSON.stringify(output, null, 2), "utf8");
  await browser.close();
})();
