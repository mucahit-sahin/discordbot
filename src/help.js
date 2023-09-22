const { EmbedBuilder } = require("discord.js");

async function getHelp(msg) {
  const embed = new EmbedBuilder()
    .setTitle("Komutlar")
    .addFields(
      {
        name: "!help",
        value: "Komutları listeler.",
      },
      {
        name: "!indirim",
        value: "Teknoloji ürünlerindeki indirimleri listeler.",
      },
      {
        name: "!döviz",
        value: "Döviz kurlarını listeler.",
      },
      {
        name: "!bildirimindirim <on/off>",
        value: "İndirim bildirimlerini açar veya kapatır.",
      },
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
        value: "Twitch'te yayın yapan bir streameri takip edilenlerden siler.",
      },
      {
        name: "!liststreamers",
        value: "Twitch'te yayın yapan streamerları listeler.",
      },
      {
        name: "!listonline",
        value: "Twitch'te yayında olan streamerları listeler.",
      }
    )
    .setColor(0x7289da)
    .setTimestamp(new Date());
  msg.channel.send({ embeds: [embed] });
}

module.exports = {
  getHelp,
};
