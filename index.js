const Discord = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");

const { isStreamerOnline, checkTwitchStreams } = require("./src/twitch");

dotenv.config();

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
    checkTwitchStreams(client);
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
    isStreamerOnline(username).then((res) => {
      msg.reply(res);
    });
  }
});

client.login(process.env.TOKEN); // Discord bot tokenınızı buraya girin
