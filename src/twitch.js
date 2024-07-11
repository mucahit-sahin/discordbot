const axios = require("axios");
var localStorage = require('../localStorage');

// streamer control
async function isStreamerOnline(username) {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: process.env.TWITCH_ACCESS_TOKEN,
        },
      }
    );

    const { data } = response.data;
    if (data.length > 0) {
      console.log(`${username} is currently live streaming!`);
      // Burada istediğiniz işlemleri yapabilirsiniz
      return `Şu anda ${username} Twitch'te yayında! Başlığı: ${data[0].title} - ${data[0].viewer_count} izleyici.\nhttps://twitch.tv/${username}`;
    } else {
      console.log(`${username} is not live streaming right now.`);
      return `${username} şu anda yayında değil.`;
    }
    return data;
  } catch (error) {
    console.log("Hata:", error);
  }
}

// streamer notifications

async function checkTwitchStreams(client) {
  /*
  // Bildirim ayarlarını veritabanından çek
  const notificationSettings = await db.get("notifications");
  // Eğer bildirim ayarları yoksa veya bildirimler kapalıysa
  if (!notificationSettings || !notificationSettings.twitch.value) return;

  // Replit veritabanından canlı yayın yapan kullanıcıları alın
  const liveStreamers = new Set(await db.get("liveStreamers")) || new Set();
  // Replit veritabanından takip edilen kullanıcıları alın
  const twitchStreamers = Array.from(await db.get("twitchStreamers")) || [];*/

  // Bildirim ayarlarını localStorage'dan çek
  const notificationSettings = localStorage.getItem("notifications");
  // Eğer bildirim ayarları yoksa veya bildirimler kapalıysa
  if (!notificationSettings || !notificationSettings.twitch.value) return;

  // LocalStorage'dan canlı yayın yapan kullanıcıları alın
  const liveStreamers = new Set(localStorage.getItem("liveStreamers")) || new Set();
  // LocalStorage'dan takip edilen kullanıcıları alın
  const twitchStreamers = Array.from(localStorage.getItem("twitchStreamers")) || [];

  for (const streamer of twitchStreamers) {
    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/streams?user_login=${streamer}`,
        {
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: process.env.TWITCH_ACCESS_TOKEN,
          },
        }
      );

      const data = response.data;

      if (data.data.length > 0) {
        // Yayın açık ise belirlediğiniz kanala bir mesaj gönderin
        const channelID = process.env.CHANNEL_ID;
        const channel = client.channels.cache.get(channelID);
        if (!liveStreamers.has(streamer)) {
          liveStreamers.add(streamer);
          channel.send(
            `${streamer} Twitch'te yayına başladı! Başlık: ${data.data[0].title} - ${data.data[0].viewer_count} izleyici.\nhttps://twitch.tv/${streamer}`
          );
        }
      } else {
        // Yayın kapalı ise setten silin
        liveStreamers.delete(streamer);
      }
      /*
      // Veritabanını güncelleyin
      await db.set("liveStreamers", [...liveStreamers]);*/
      // LocalStorage güncelleyin
      localStorage.setItem("liveStreamers", [...liveStreamers]);
    } catch (error) {
      console.error(`Twitch API hatası: ${error.message}`);
    }
  }
}

// export
module.exports = {
  isStreamerOnline,
  checkTwitchStreams,
};
