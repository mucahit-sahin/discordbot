const axios = require("axios");
const cheerio = require("cheerio");

async function getCurrencies() {
  try {
    // this site returns html text
    const response = await fetch("https://bigpara.hurriyet.com.tr/doviz/");
    const html = await response.text();
    const $ = cheerio.load(html);
    const currencies = [];
    $(".dovizBar>a").each((i, element) => {
      const currency = {
        name: $(".line1>.name", element).text(),
        buying: $(".box.bFirst>.value", element).text(),
        selling: $(".box:last-child>.value", element).text(),
      };
      currencies.push(currency);
    });
    return currencies;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getCurrencies,
};
