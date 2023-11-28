const axios = require("axios");
const cheerio = require("cheerio");
const { EmbedBuilder } = require("discord.js");

const url =
  "https://www.technopat.net/sosyal/bolum/indirim-koesesi.257/?order=post_date&direction=desc";

// indirimleri getir
async function getDiscounts() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const discounts = [];
    $(".js-threadList>.structItem.js-inlineModContainer").each((i, element) => {
      const discount = {
        title:
          $(".structItem-title a:first-child", element).text() +
          " - " +
          $(".structItem-title a:last-child", element).text(),
        link:
          "https://www.technopat.net" +
          $(".structItem-title a:last-child", element).attr("href"),
        date: $(".structItem-startDate", element).text(),
      };
      discounts.push(discount);
    });
    return discounts;
  } catch (error) {
    console.error(error);
  }
}

async function writeDiscounts(msg) {
  const discounts = await getDiscounts();
  const embed = new EmbedBuilder()
    .setTitle("İndirimler")
    .addFields(
      discounts.map((discount) => ({
        name: discount.title,
        value: `[Linke git](${discount.link})` + " - " + discount.date,
      }))
    )
    .setFooter({
      text: "Kaynak: https://www.technopat.net/sosyal/bolum/indirim-koesesi.257/",
    })
    .setTimestamp(new Date());
  msg.reply({ embeds: [embed] });
}

// yeni bir indirim var mı kontrol et varsa döndür
async function checkNewDiscount(client, db) {
  try {
    // Bildirim ayarlarını veritabanından çek
    const notificationSettings = await db.get("notifications");

    // Eğer bildirim ayarları yoksa veya bildirimler kapalıysa
    if (!notificationSettings || !notificationSettings.indirim.value) return;

    // İndirimleri çek
    const discounts = await getDiscounts();

    // Son indirimi Replit veritabanından çek
    const lastDiscount = await db.get("lastDiscount");

    // Eğer veritabanında indirim yoksa veritabanına kaydet
    if (!lastDiscount) {
      await db.set("lastDiscount", discounts[0]);
      return;
    }

    // Eğer veritabanındaki indirim, indirimlerde yoksa
    if (!discounts.find((discount) => discount.link === lastDiscount.link)) {
      // Veritabanındaki indirimi sil
      await db.delete("lastDiscount");
      return;
    }

    // Son indirim ile yeni indirimi karşılaştır
    if (lastDiscount.link !== discounts[0].link) {
      // Eğer yeni indirim varsa veritabanına kaydet
      await db.set("lastDiscount", discounts[0]);

      // Yeni eklenen indirimleri döndür (yani baştan son indirime kadar olan indirimler )
      const newDiscounts = [];
      for (let i = 0; i < discounts.length; i++) {
        if (discounts[i].link === lastDiscount.link) break;
        newDiscounts.push(discounts[i]);
      }

      // Eğer yeni indirim varsa Yeni indirimleri mesaj olarak gönder (Embed mesajı)
      if (newDiscounts.length > 0) {
        // Bildirim kanalını çek
        const channel = await client.channels
          .fetch(notificationSettings.indirim.channelId)
          .catch(console.error);
        if (!channel) return;

        const embed = new EmbedBuilder()
          .setTitle("Yeni indirimler")
          .addFields(
            ...newDiscounts.map((discount) => ({
              name: discount.title,
              value: `[Linke git](${discount.link})` + " - " + discount.date,
            }))
          )
          .setFooter({
            text: "Kaynak: https://www.technopat.net/sosyal/bolum/indirim-koesesi.257/",
          })
          .setTimestamp(new Date());

        channel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getDiscounts,
  writeDiscounts,
  checkNewDiscount,
};
