const Discord = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
//const Client = require("@replit/database");
var localStorage = require("./localStorage");

const { isStreamerOnline, checkTwitchStreams } = require("./src/twitch");
const { writeCurrencies } = require("./src/currency");
const { writeDiscounts, checkNewDiscount } = require("./src/indirim");
const { getLinks } = require("./src/videoEmbed");
const { getHelp } = require("./src/help");
const { setNotification } = require("./src/notifications");

dotenv.config();

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
    //checkTwitchStreams(client);
    checkNewDiscount(client);
  }, 60000); // Her dakika kontrol etmek için 60000 milisaniye (60 saniye) kullanıyoruz
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // selama cevap verme

  let selam = ["selam", "sa", "selamın aleyküm", "selamın aleykum"];
  if (selam.some((word) => msg.content.toLowerCase() === word)) {
    if (msg.author.id === process.env.ME_ID) {
      msg.reply(`as Aşkım benim. Seni çok seviyorum :heart:. Hizmetindeyim.`);
    } else {
      msg.reply(`as ${msg.author}`);
    }
  }

  // linkleri alıp, embed mesajı oluşturur
  getLinks(msg);

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

    // LocalStorage kullanarak streamer ekleme
    var streamers = localStorage.getItem("twitchStreamers");
    if (!streamers) {
      streamers = [];
    }
    streamers.push(username);
    localStorage.setItem("twitchStreamers", streamers);
    msg.reply("Streamer başarıyla eklendi.");
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

    // LocalStorage kullanarak streamer silme
    var streamers = localStorage.getItem("twitchStreamers");
    if (!streamers) {
      streamers = [];
    }
    streamers = streamers.filter((streamer) => streamer !== username);
    localStorage.setItem("twitchStreamers", streamers);
    msg.reply("Streamer başarıyla silindi.");
  }

  // twitch takip edilenleri listelemek (herkes için)
  if (msg.content.startsWith("!liststreamers")) {
    // LocalStorage kullanarak streamer listeleme
    var streamers = localStorage.getItem("twitchStreamers");
    if (!streamers) {
      streamers = [];
    }
    msg.reply(`Takip edilen streamerlar: ${streamers.join(", ")}`);
  }

  // Yayında olan streamerları listelemek (herkes için)
  if (msg.content.startsWith("!listonline")) {
    // LocalStorage kullanarak yayında olan streamerları listeleme
    var streamers = localStorage.getItem("liveStreamers");
    if (!streamers) {
      streamers = [];
    }
    msg.reply(`Yayında olan streamerlar: ${streamers.join(", ")}`);
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
    setNotification(msg);
  }

  // Botta kullanılan komutların listelenip ve komutların açıklanması (Embed mesajı)
  if (msg.content.startsWith("!help")) {
    getHelp(msg);
  }
});

client.login(process.env.TOKEN); // Discord bot tokenınızı buraya girin
