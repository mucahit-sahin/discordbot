import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import axios from "axios";
import cheerio from "cheerio";

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const chromeOptions = {
  headless: true,
  defaultViewport: null,
  args: ["--incognito", "--no-sandbox", "--single-process", "--no-zygote"],
  ignoreDefaultArgs: ["--disable-extensions"],
};

export async function getDiscountList() {
  let response = await axios.get(
    "https://www.technopat.net/sosyal/bolum/indirim-koesesi.257/?order=post_date&direction=desc"
  );
  let list = [];
  const $ = cheerio.load(response.data);

  $(".structItem").each((index, element) => {
    const title = $(element).find(".structItem-title>a:last-child").text();
    const link = $(element).find(".structItem-title>a:last-child").attr("href");
    const type = $(element).find(".labelLink").text();
    const date = $(element).find(".structItem-startDate").text();

    list.push({ title, link: "https://www.technopat.net" + link, type, date });
  });
  return list;
}
