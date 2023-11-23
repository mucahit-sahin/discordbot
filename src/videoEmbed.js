
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

      // Kullanıcının adını alır ve değiştirilmiş mesajı oluşturur
      const username = message.author.username;
      const finalMessage = `${modifiedContent} - Gönderen: @${username}`;

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

      // Kullanıcının adını alır ve değiştirilmiş mesajı oluşturur
      const username = message.author.username;
      const finalMessage = `${modifiedContent} - Gönderen: @${username}`;

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

      // Kullanıcının adını alır ve değiştirilmiş mesajı oluşturur
      const username = message.author.username;
      const finalMessage = `${modifiedContent} - Gönderen: @${username}`;

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

      // Kullanıcının adını alır ve değiştirilmiş mesajı oluşturur
      const username = message.author.username;
      const finalMessage = `${modifiedContent} - Gönderen: @${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
    if (message.content.includes("x.com") && !message.content.includes("fixupx")) {
      const modifiedContent = message.content.replace(/x/g, "fixupx");

      // Eski mesajı siler
      await message.delete();

      // Kullanıcının adını alır ve değiştirilmiş mesajı oluşturur
      const username = message.author.username;
      const finalMessage = `${modifiedContent} - Gönderen: @${username}`;

      // Değiştirilmiş mesajı gönderir
      await message.channel.send(finalMessage);
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  getInstagramLinks,
  getTiktokLinks,
  getRedditLinks,
  getTwitterLinks,
};
