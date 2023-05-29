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
const { askGPT } = require("./src/chatgpt");

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
    checkTwitchStreams(client, db);
  }, 60000); // Her dakika kontrol etmek için 60000 milisaniye (60 saniye) kullanıyoruz
});

client.on("messageCreate", (msg) => {
  // selama cevap verme
  let selam = ["selam ", "sa ", "selamın aleyküm", "selamın aleykum"];
  if (selam.some((word) => msg.content.toLowerCase().includes(word))) {
    if (msg.author.id === process.env.ME_ID) {
      msg.reply(`as Aşkım benim. Seni çok seviyorum :heart:. Hizmetindeyim.`);
    } else {
      msg.reply(`as ${msg.author}`);
    }
  }

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

  // Botun kendisini etiketlendiği mesajları kontrol et
  if (msg.mentions.has(client.user)) {
    const content = msg.content.replace(`<@!${client.user.id}>`, "").trim();
    if (content.length > 0) {
      askGPT(content, msg, openai);
    }
  }
});

client.login(process.env.TOKEN); // Discord bot tokenınızı buraya girin
