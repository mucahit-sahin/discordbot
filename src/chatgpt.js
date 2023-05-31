async function askGPT(question, openai) {
  try {
    console.log("ChatGPT ile soru soruldu:", question);
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant who responds succinctly",
        },
        { role: "user", content: question },
      ],
    });
    return gptResponse.data.choices[0].text;
  } catch (error) {
    console.error("ChatGPT ile bir hata oluştu:", error);
  }
}

module.exports = {
  askGPT,
};
