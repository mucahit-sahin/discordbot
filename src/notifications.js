async function setNotification(msg, db) {
  // Eğer komutu kullanan kişi ben değilsem
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
      if (notificationValue.toLowerCase() === "on") {
        msg.reply(
          "Bildirim ayarı başarıyla güncellendi. Bildirimler " +
            msg.channel.name +
            " kanalına gönderilecek."
        );
      }
      else
      {
        msg.reply(
          "Bildirim ayarı başarıyla güncellendi. Bildirimler " +
            msg.channel.name +
            " kanalına gönderilmeyecek."
        );
      }
    });
  });
}

module.exports = {
    setNotification,
};