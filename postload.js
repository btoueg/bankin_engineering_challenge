// this is a postload script
// it has to be evaluated in the headless browser once all js scripts have run
$(() => {
  // run on jQuery ready

  // if failmode is true, find an HTML button by id and click it
  // it's supposed to generate the data
  const reloadTransactionsButton = document.querySelector("#btnGenerate");
  if (reloadTransactionsButton) {
    reloadTransactionsButton.click();
  }
  // if iframe is true, the HTML table is built inside an iframe
  // find the relevant document object
  const iframe = document.querySelector("iframe");
  const doc = iframe
    ? document.querySelector("iframe").contentWindow.document
    : document;
  scraped_transactions = []; // global (do not add var/const/let keyword)
  // select all tr tags
  doc.querySelectorAll("tr").forEach(tr => {
    // "tr" stands for table row
    // the first row is supposed to have 3 table headers "th"
    // the following rows are supposed to have 3 table data cells "td"
    const row = [];
    tr.querySelectorAll("td").forEach(td => row.push(td.innerHTML));
    if (row.length !== 3) return;
    // from this line the current row contains 3 data cells
    // we assume the following format:
    // <tr><td>Checking</td><td>Transaction 5</td><td>101€</td></tr>
    const [account, transaction, amount] = row;
    const currency = amount.replace(/^(\-|\+)?([0-9 ]+(\.[0-9 ]+)?)/, "");
    scraped_transactions.push({
      account, // account is scraped as-is
      transaction, // transaction name is scraped as-is
      amount: parseFloat(amount), // amount is parsed as a float (not great)
      currency // currency is the amount striped from signs, digits and spaces
    });
  });
});
