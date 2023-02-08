import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const chromeOptions = {
  headless: true,
  defaultViewport: null,
  args: ["--incognito", "--no-sandbox", "--single-process", "--no-zygote"],
  ignoreDefaultArgs: ["--disable-extensions"],
};

const baseUrl = "https://golvar60.com/";

export async function getGolvarList() {
  const browser = await puppeteer.launch(chromeOptions);
  const bpage = await browser.newPage();

  await bpage.goto(`${baseUrl}`, {
    waitUntil: "networkidle0",
  });
  const channels = await bpage.evaluate(() => {
    const channels = Array.from(document.querySelectorAll("#eventlist a"));
    return channels.map((channel) => {
      return {
        title: channel.querySelector(".teams span").innerText,
      };
    });
  });
  await browser.close();
  console.log(channels);
  return channels;
}

export async function getStreamUrl(index) {
  const browser = await puppeteer.launch(chromeOptions);
  const bpage = await browser.newPage();

  let source = "";
  bpage.on("response", async (response) => {
    console.log(response.url());
    if (response.url().toString().includes("m3u8")) {
      source = response.url();
    }
  });

  await bpage.goto(`${baseUrl}`, {
    waitUntil: "networkidle2",
  });
  await bpage.click(`.player`);
  await bpage.screenshot({ path: "example.png", fullPage: true });

  await browser.close();
  console.log("+++++++" + source);
  return source;
}
