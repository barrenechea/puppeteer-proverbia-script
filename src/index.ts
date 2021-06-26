import proverbiaDriver from './driver.js';

(async () => {
  const quotes = await proverbiaDriver.getProverbia();

  // Only print the quote of the day (first on the array)
  console.log(JSON.stringify(quotes[0]));
  process.exit(quotes ? 0 : 1);
})();
