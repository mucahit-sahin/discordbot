import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { getDiscountList } from "./src/indirim.js";
import { isLive } from "./src/twitch.js";
import { getGolvarList, getStreamUrl } from "./src/yayin.js";

dotenv.config();
const prefix = process.env.PREFIX;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;

  // selama cevap verme
  if (msg.content.trim().toLowerCase() === "sa") {
    if (msg.author.id === process.env.ME_ID) {
      msg.reply(`as Aşkım benim. Seni çok seviyorum :heart:. Hizmetindeyim.`);
    } else {
      msg.reply(`as ${msg.author}`);
    }
  }

  if (!msg.content.startsWith(prefix)) return;

  // komutlar
  let message = msg.content.trim().toLowerCase();
  if (message.startsWith(prefix + "açtımı")) {
    const username = message.split(" ")[1];
    msg.reply(`hemen bakıyorum cnm`);
    isLive(username)
      .then((x) => {
        msg.reply(`${x ? "Yayında cnm" : "Yayında değil cnm"}`);
      })
      .catch((err) => {
        console.log(err.message);
        msg.reply(`bir hata oluştu cnm`);
      });
  }

  if (message.startsWith(prefix + "golvar")) {
    const channel = message.split(" ")[1];
    msg.reply(`hemen bakıyorum cnm`);
    if (channel !== "list") {
      getStreamUrl(channel)
        .then((data) => {
          msg.reply("dede");
        })
        .catch((err) => {
          console.log(err.message);
          msg.reply(`bir hata oluştu cnm`);
        });
    } else {
      getGolvarList()
        .then((data) => {
          console.log(data.length);
          let text = "Lütfen Birini seçin (*golvar 5)";
          text += data.map((x, index) => {
            return "\n" + index + " - " + x.title;
          });
          msg.reply(text.toString());
        })
        .catch((err) => {
          console.log(err.message);
          msg.reply(`bir hata oluştu cnm`);
        });
    }
  }

  if (message === prefix + "indirim") {
    getDiscountList().then((list) => {
      let text = list.map((x, index) => {
        return `\n[${x.title}](${x.link}) - ${x.date}  ${
          x.type && " - (" + x.type + ")"
        }`;
      });
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("İndirimler")
        .setDescription(text.toString())
        .setTimestamp();
      msg.channel.send({ embeds: [embed] });
    });
  }
});
