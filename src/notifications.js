var localStorage = require('../localStorage');

async function setNotification(msg) {
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
  var notifications = localStorage.getItem("notifications");
  console.log(notifications);
  if (!notifications) {
    notifications = {};
  }
  // Bildirim değeri güncellenir
  /*notifications[notificationName] = {
    value: notificationValue.toLowerCase() === "on" ? true : false,
    channelId: msg.channel.id,
  };*/

  // bildirim değeri güncellenir
  notifications={
    ...notifications,
    [notificationName]: {
      value: notificationValue.toLowerCase() === "on" ? "on" : "off",
      channelId: msg.channel.id,
    }
  }

  console.log(notifications);
  // Bildirimler kaydedilir
  localStorage.setItem("notifications", notifications);
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

}

module.exports = {
    setNotification,
};