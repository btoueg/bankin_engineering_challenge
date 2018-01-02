const fs = require("fs");
const puppeteer = require("puppeteer");

const postloadFile = fs.readFileSync("./postload.js", "utf8");

(async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.evaluateOnNewDocument("window.setTimeout = (fn, delay) => fn();");
  await page.evaluateOnNewDocument("window.alert = window.console.log;");
  await page.goto("http://web.bankin.com/challenge/index.html");
  await page.addScriptTag({ content: postloadFile });

  console.log(await page.evaluate("result_inside"));

  await browser.close();
})();
