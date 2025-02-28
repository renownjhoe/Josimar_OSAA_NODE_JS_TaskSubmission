const telegramUsers = new Map(); // Temporary storage

// Listen for new users starting the bot
telegramBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  telegramUsers.set(username, chatId);
});

export const getTelegramChatId = (username) => {
  return telegramUsers.get(username);
};