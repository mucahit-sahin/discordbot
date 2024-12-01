const localStorage = require("../localStorage");

// instagram linklerini alıp, "instagram" yazısını "ddinstagram" olarak değiştirir
async function getInstagramLinks(message) {
  try {
    if (
      message.content.includes("instagram.com") &&
      !message.content.includes("ddinstagram")
    ) {
      const modifiedContent = message.content.replace(
        /instagram/g,
        "ddinstagram"
      );

      // Eski mesajı siler
      await message.delete();

      // Kullanıcı mention'ı alır ve mention'lı mesajı oluşturur
      const username = message.author.toString();
      const finalMessage = `${modifiedContent} - Gönderen: ${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// tiktok linklerini alıp, "tiktok" yazısını "vxtiktok" olarak değiştirir
async function getTiktokLinks(message) {
  try {
    if (
      message.content.includes("tiktok.com") &&
      !message.content.includes("vxtiktok")
    ) {
      const modifiedContent = message.content.replace(/tiktok/g, "vxtiktok");

      // Eski mesajı siler
      await message.delete();

      // Kullanıcı mention'ı alır ve mention'lı mesajı oluşturur
      const username = message.author.toString();
      const finalMessage = `${modifiedContent} - Gönderen: ${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// reddit linklerini alıp, "reddit" yazısını "rxddit" olarak değiştirir
async function getRedditLinks(message) {
  try {
    if (
      message.content.includes("reddit.com") &&
      !message.content.includes("rxddit")
    ) {
      const modifiedContent = message.content.replace(/reddit/g, "rxddit");

      // Eski mesajı siler
      await message.delete();

      // Kullanıcı mention'ı alır ve mention'lı mesajı oluşturur
      const username = message.author.toString();
      const finalMessage = `${modifiedContent} - Gönderen: ${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// twitter linklerini alıp, "twitter" yazısını "fxtwitter" olarak değiştirir
// x linklerini alıp, "x" yazısını "fixupx" olarak değiştirir
async function getTwitterLinks(message) {
  try {
    if (
      message.content.includes("twitter.com") &&
      !message.content.includes("fxtwitter")
    ) {
      const modifiedContent = message.content.replace(/twitter/g, "fxtwitter");

      // Eski mesajı siler
      await message.delete();

      // Kullanıcı mention'ı alır ve mention'lı mesajı oluşturur
      const username = message.author.toString();
      const finalMessage = `${modifiedContent} - Gönderen: ${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
    if (
      message.content.includes("x.com") &&
      !message.content.includes("fixupx")
    ) {
      const modifiedContent = message.content.replace(/x/g, "fixupx");

      // Eski mesajı siler
      await message.delete();

      // Kullanıcı mention'ı alır ve mention'lı mesajı oluşturur
      const username = message.author.toString();
      const finalMessage = `${modifiedContent} - Gönderen: ${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// tüm fonksiyonları tek bir fonksiyon içinde topladım
async function getLinks(message) {
  // Linkleri güncelleme açık mı kontrol et
  const updateLinks = localStorage.getItem("updateLinks");
  if (!updateLinks) return;
  // Linkleri al
  getInstagramLinks(message);
  getTiktokLinks(message);
  getRedditLinks(message);
  getTwitterLinks(message);
}

// Linkleri güncelleme açık yada kapalı yapma, komut: !embedLinks true/false
async function updateLinks(message) {
  try {
    // Komutu ayır
    const args = message.content.split(" ");
    // Komutu kontrol et
    if (args[0] === "!embedLinks") {
      // Komutu kontrol et
      if (args[1] === "true") {
        localStorage.setItem("updateLinks", true);
        await message.channel.send("Link güncelleme açık.");
      } else if (args[1] === "false") {
        localStorage.setItem("updateLinks", false);
        await message.channel.send("Link güncelleme kapalı.");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  getLinks,
  updateLinks,
};
