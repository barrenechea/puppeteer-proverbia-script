import proverbiaDriver from "./driver.js";

const quote = await proverbiaDriver.getQuoteOfTheDay();

console.log(JSON.stringify(quote));
process.exit(quote ? 0 : 1);
