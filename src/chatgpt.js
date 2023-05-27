async function askGPT(question, message, openai) {
  try {
    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Say this is a test",
      max_tokens: 7,
      temperature: 0,
    });
    message.reply(`${gptResponse.data.choices[0].text}`);
    return;
  } catch (error) {
    console.error("ChatGPT ile bir hata oluştu:", error);
  }
}

module.exports = {
  askGPT,
};
