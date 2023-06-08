const axios = require("axios");
const cheerio = require("cheerio");

const url =
  "https://www.technopat.net/sosyal/bolum/indirim-koesesi.257/?order=post_date&direction=desc";

async function getDiscounts() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const discounts = [];
    $(".structItem").each((i, element) => {
      const discount = {
        title:
          $(".structItem-title a:first-child", element).text() +
          " - " +
          $(".structItem-title a:last-child", element).text(),
        link:
          "https://www.technopat.net" +
          $(".structItem-title a:last-child", element).attr("href"),
        date: $(".structItem-startDate", element).text(),
      };
      discounts.push(discount);
    });
    return discounts;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getDiscounts,
};
