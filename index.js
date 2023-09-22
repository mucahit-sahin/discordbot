const Discord = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
const Client = require("@replit/database");

// OpenAI Chat API'ye bağlanmak için bir istemci oluşturun
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});
const openai = new OpenAIApi(configuration);

const { isStreamerOnline, checkTwitchStreams } = require("./src/twitch");
const { writeCurrencies } = require("./src/currency");
const { writeDiscounts, checkNewDiscount } = require("./src/indirim");
const { getInstagramLinks } = require("./src/instagram");
const { getHelp } = require("./src/help");

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
    // Eğer mesajı ben yazmadıysam
    if (msg.author.id !== process.env.ME_ID) {
      msg.reply("Bu komutu kullanma izniniz yok.");
      return;
    }
    // Bildirim adı ve değeri alınır
    const notificationName = msg.content.split(" ")[1];
    // Eğer bildirim adı belirtilmemişse
    if (!notificationName) {
      msg.reply("Bir bildirim adı belirtin.");
      return;
    }
    // Bildirim değeri alınır
    const notificationValue = msg.content.split(" ")[2];

    // Eğer bildirim değeri belirtilmemişse ve değer on veya off değilse
    if (!notificationValue || !["on", "off"].includes(notificationValue)) {
      msg.reply("Bir bildirim değeri belirtin. (on/off)");
      return;
    }

    // Bildirimler alınır
    db.get("notifications").then((notifications) => {
      if (!notifications) {
        notifications = {};
      }
      // Bildirim değeri güncellenir
      notifications[notificationName] = {
        value: notificationValue.toLowerCase() === "on" ? true : false,
        channelId: msg.channel.id,
      };
      // Bildirimler kaydedilir
      db.set("notifications", notifications).then(() => {
        msg.reply(
          "Bildirim başarıyla güncellendi. Bildirimler " +
            msg.channel.name +
            " kanalına gönderilecek."
        );
      });
    });
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
