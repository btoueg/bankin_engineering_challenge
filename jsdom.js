const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const postloadFile = fs.readFileSync("./postload.js", "utf8");

JSDOM.fromURL("https://web.bankin.com/challenge/index.html", {
  runScripts: "dangerously",
  resources: "usable",
  beforeParse: window => {
    window.setTimeout = (fn, delay) => fn();
    window.alert = window.console.log;
  }
})
  .then(dom => {
    return new Promise((resolve, reject) => {
      let result_outside = null;
      let handle = setInterval(() => {
        result_outside = dom.window.eval(
          `
          if (window.$) {` +
            postloadFile +
            `}
          window.result_inside;
        `
        );
        if (result_outside) {
          clearInterval(handle);
          resolve(result_outside);
        }
      }, 16);
    });
  })
  .then(result => console.log(result));
