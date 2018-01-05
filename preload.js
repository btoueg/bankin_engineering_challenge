// this is a preload script
// it has to be evaluated in the headless browser before any other js scripts

// make setTimeout no-op (assumption: used only to slow the scraping)
window.setTimeout = (fn, delay) => fn(); // fix slowmode
// make alert no-op (thus non-blocking)
window.alert = window.console.log; // fix failemode

scraped_transactions = new Array(); // global (do not add var/const/let keyword)
const push = Array.prototype.push; // alias native function for later use
Array.prototype.push = function(item) {
  // override Array push method
  if (item.length === 3) {
    // 1. assume item is an array of 3 elements
    // FIXME we could check properly if item is an array:
    // (Array.isArray(item) && item.length === 3)
    // but it slows down the script a lot
    // 2. assume the following pattern: ['str1', 'str2', 'str3']
    const [account, transaction, amount] = item;
    if (
      !(
        account === "Account" &&
        transaction === "Transaction" &&
        amount === "Amount"
      ) && // discard header ['Account', 'Transaction', 'Amount']
      transaction.toString().startsWith("Transaction ") // consistency check
    ) {
      const currency = amount.replace(/^(\-|\+)?([0-9 ]+(\.[0-9 ]+)?)/, "");
      // store interecpted transactions into global scraped_transactions array
      scraped_transactions.push({
        account, // account is scraped as-is
        transaction, // transaction is scraped as-is
        amount: parseFloat(amount), // amount is parsed as a float (not great)
        currency // currency is the amount striped from signs, digits and spaces
      });
    }
  }
  // eventually push item into array
  return push.call(this, ...arguments);
};
