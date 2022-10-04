import cheerio from "cheerio";
import axios from "axios";

export async function isLive(username) {
  let response = await axios.get(`https://twitchtracker.com/${username}`);
  const $ = cheerio.load(response.data);

  const card = $(".live-indicator-container span").text();
  if (card.trim() === "LIVE") return true;
  else return false;
}
