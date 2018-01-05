var MD5 = require("crypto-js/md5");

// by reverse engineering the web page, we find that
// transactions' amount are computed client side with the following formula
amount_calculator = m =>
  parseInt(MD5("Transaction " + m), 16) % 100 + (m % 50 || 50);

const transactions = [];
for (let i = 1; i < 5000; i++) {
  transactions.push({
    account: i < 450 ? "Checking" : "Savings", // reverse engineering magic
    transaction: `Transaction ${i}`,
    amount: amount_calculator(i),
    currency: "€" // always €
  });
}
console.log(transactions);
