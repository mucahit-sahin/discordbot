// instagram linklerini alıp, "instagram" yazısını "ddinstagram" olarak değiştirir
async function getInstagramLinks(message) {
  if (
    message.content.includes("instagram") &&
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
}

module.exports = {
  getInstagramLinks,
};
