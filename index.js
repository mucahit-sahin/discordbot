const Discord = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
const Client = require("@replit/database");

const { isStreamerOnline, checkTwitchStreams } = require("./src/twitch");
const { writeCurrencies } = require("./src/currency");
const { writeDiscounts, checkNewDiscount } = require("./src/indirim");
const {
  getInstagramLinks,
  getTiktokLinks,
  getRedditLinks,
  getTwitterLinks
} = require("./src/videoEmbed");
const { getHelp } = require("./src/help");
const { setNotification } = require("./src/notifications");

dotenv.config();

// Replit veritabanı istemcisini oluşturun
const db = new Client();

// Discord bot istemcisini oluşturun
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Bot olarak giriş yapıldı: ${client.user.tag}`);

  // Belirli aralıklarla Twitch API'ye istek göndererek yayınları kontrol etmek için bir zamanlayıcı ayarlayın
  setInterval(() => {
    requestWebSite();
    checkTwitchStreams(client, db);
    checkNewDiscount(client, db);
  }, 60000); // Her dakika kontrol etmek için 60000 milisaniye (60 saniye) kullanıyoruz
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // selama cevap verme
  let selam = ["selam ", "sa ", "selamın aleyküm", "selamın aleykum"];
  if (selam.some((word) => msg.content.toLowerCase().includes(word))) {
    if (msg.author.id === process.env.ME_ID) {
      msg.reply(`as Aşkım benim. Seni çok seviyorum :heart:. Hizmetindeyim.`);
    } else {
      msg.reply(`as ${msg.author}`);
    }
  }

  // instagram linklerini alıp, "instagram" yazısını "ddinstagram" olarak değiştirir
  getInstagramLinks(msg);
  // tiktok linklerini alıp, "tiktok" yazısını "vxtiktok" olarak değiştirir
  getTiktokLinks(msg);
  // reddit linklerini alıp, "reddit" yazısını "rxddit" olarak değiştirir
  getRedditLinks(msg);
  // twitter linklerini alıp, "twitter" yazısını "fxtwitter" olarak değiştirir
  getTwitterLinks(msg);

  // twitch streamer kontrolü
  if (msg.content.startsWith("!streamer")) {
    const username = msg.content.split(" ")[1];
    if (!username) {
      msg.reply("Bir kullanıcı adı belirtin.");
      return;
    }
    isStreamerOnline(username).then((res) => {
      msg.reply(res);
    });
  }

  // twitch takip edilenlere streamer eklemek (sadece benim için)
  if (msg.content.startsWith("!addstreamer")) {
    if (msg.author.id !== process.env.ME_ID) {
      msg.reply("Bu komutu kullanma izniniz yok.");
      return;
    }
    const username = msg.content.split(" ")[1];
    if (!username) {
      msg.reply("Bir kullanıcı adı belirtin.");
      return;
    }
    db.get("twitchStreamers").then((streamers) => {
      if (!streamers) {
        streamers = [];
      }
      streamers.push(username);
      db.set("twitchStreamers", streamers).then(() => {
        msg.reply("Streamer başarıyla eklendi.");
      });
    });
  }

  // twitch takip edilenlerden streamer silmek (sadece benim için)
  if (msg.content.startsWith("!removestreamer")) {
    if (msg.author.id !== process.env.ME_ID) {
      msg.reply("Bu komutu kullanma izniniz yok.");
      return;
    }
    const username = msg.content.split(" ")[1];
    if (!username) {
      msg.reply("Bir kullanıcı adı belirtin.");
      return;
    }
    db.get("twitchStreamers").then((streamers) => {
      if (!streamers) {
        streamers = [];
      }
      streamers = streamers.filter((streamer) => streamer !== username);
      db.set("twitchStreamers", streamers).then(() => {
        msg.reply("Streamer başarıyla silindi.");
      });
    });
  }

  // twitch takip edilenleri listelemek (herkes için)
  if (msg.content.startsWith("!liststreamers")) {
    db.get("twitchStreamers").then((streamers) => {
      if (!streamers) {
        streamers = [];
      }
      msg.reply(`Takip edilen streamerlar: ${streamers.join(", ")}`);
    });
  }

  // Yayında olan streamerları listelemek (herkes için)
  if (msg.content.startsWith("!listonline")) {
    db.get("liveStreamers").then((streamers) => {
      if (!streamers) {
        streamers = [];
      }
      msg.reply(`Yayında olan streamerlar: ${streamers.join(", ")}`);
    });
  }

  // Döviz kurlarını listelemek (Embed ile)
  if (msg.content.startsWith("!döviz")) {
    writeCurrencies(msg);
  }

  // İndirimleri listelemek (Embed ile)
  if (msg.content.startsWith("!indirim")) {
    writeDiscounts(msg);
  }

  // Bildirimlerini açmak veya kapamak, !bildirim bildirim_adı on/off  (sadece benim için)
  if (msg.content.startsWith("!bildirim")) {
    setNotification(msg, db);
  }

  // Botta kullanılan komutların listelenip ve komutların açıklanması (Embed mesajı)
  if (msg.content.startsWith("!help")) {
    getHelp(msg);
  }
});

client.login(process.env.TOKEN); // Discord bot tokenınızı buraya girin

async function requestWebSite(url) {
  const response = await axios.get("https://discord-bot--scaletta865.repl.co/");
  return response.data;
}
