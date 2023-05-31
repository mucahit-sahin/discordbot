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
    requestWebSite();
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

  // GPT-3 ile sohbet etmek
  if (msg.content.startsWith("!chat")) {
    const message = msg.content.split("!chat")[1];
    if (!message) {
      msg.reply("Bir mesaj belirtin.");
      return;
    }
    const response = await openai.createChatCompletion({
      model: "davinci",
      prompt: message,
      maxTokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.5,
    });
    msg.reply(response.data.choices[0].text);
  }

  // Botta kullanılan komutların listelenip ve komutların açıklanması (Embed mesajı)
  if (msg.content.startsWith("!help")) {
    const embed = new Discord.EmbedBuilder()
      .setTitle("Komutlar")
      .addFields(
        {
          name: "!streamer <username>",
          value:
            "Twitch'te yayın yapan bir streamerin yayında olup olmadığını kontrol eder.",
        },
        {
          name: "!addstreamer <username>",
          value: "Twitch'te yayın yapan bir streameri takip edilenlere ekler.",
        },
        {
          name: "!removestreamer <username>",
          value:
            "Twitch'te yayın yapan bir streameri takip edilenlerden siler.",
        },
        {
          name: "!liststreamers",
          value: "Twitch'te yayın yapan streamerları listeler.",
        },
        {
          name: "!listonline",
          value: "Twitch'te yayında olan streamerları listeler.",
        },
        {
          name: "!help",
          value: "Komutları listeler.",
        }
      )
      .setColor(0x7289da)
      .setTimestamp(new Date());
    msg.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN); // Discord bot tokenınızı buraya girin

async function requestWebSite(url) {
  const response = await axios.get("https://discord-bot--scaletta865.repl.co/");
  return response.data;
}
