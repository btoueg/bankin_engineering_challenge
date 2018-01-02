$(() => {
  // run once jQuery init is complete

  // if failmode is true, an HTML button to enable data generation is created
  // find it and click it, if relevant
  const reloadTransactionsButton = document.querySelector("#btnGenerate");
  if (reloadTransactionsButton) {
    reloadTransactionsButton.click();
  }
  // if iframe is true, the table is built in an iframe
  // find the relevant document object
  const iframe = document.querySelector("iframe");
  const doc = iframe
    ? document.querySelector("iframe").contentWindow.document
    : document;
  // select all td tags
  const arr = [];
  doc.querySelectorAll("td").forEach(item => arr.push(item.innerHTML));
  result_inside = arr;
});
