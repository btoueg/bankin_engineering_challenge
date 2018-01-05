const fs = require("fs");
const puppeteer = require("puppeteer");

const preloadFile = fs.readFileSync("./preload.js", "utf8");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  // analysis of the webpage shows that the transactions are generated
  // on the client side in a javascript array before being added to the DOM
  // preloadFile hooks on array push method and collect all transactions
  // before being added to DOM
  // it works in all mode (slowmode, hasiframe, failmode)
  await page.evaluateOnNewDocument(preloadFile);
  // load page once
  await page.goto("http://web.bankin.com/challenge/index.html");
  // analysis of the webpage shows that the transactions are generated
  // in doGenerate() function, which relies on global variable start
  // by modifying start value, we mimic pagination
  // loop over all known pages
  // in case of failmode, doGenerate() has never been called
  // hence we need to evaluate scraped_transactions.length
  // we chose to add one script tag per page because it just works
  // we tried moving the for loop inside the addScriptTag content but...
  // it does not work!?
  const start_at = await page.evaluate(`scraped_transactions.length`);
  for (start = start_at; start < 5000; start += 50) {
    await page.addScriptTag({
      content: `
        window.start = ${start};
        doGenerate();
      `
    });
  }
  const all_transactions = await page.evaluate(`scraped_transactions`);

  const output = {
    transactions: [].concat.apply([], all_transactions) // flatten arrays
  };
  fs.writeFileSync("./output.json", JSON.stringify(output, null, 2), "utf8");
  await browser.close();
})();
