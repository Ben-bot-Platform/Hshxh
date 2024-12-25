const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// توکن ربات تلگرام خود را جایگزین کنید
const token = '7359086776:AAHMskzuE3I7_pgS7g4k_fxifD5mZscsDiE';
const bot = new TelegramBot(token, { polling: true });

// دستور شروع
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "سلام! لینک ویدئوی یوتیوب را بفرستید.");
});

// دریافت لینک ویدئو
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // بررسی اگر متن یک لینک یوتیوب است
  if (ytdl.validateURL(text)) {
    bot.sendMessage(chatId, "دانلود شروع شد، لطفاً صبر کنید...");

    try {
      const info = await ytdl.getInfo(text);
      const title = info.videoDetails.title;
      const videoPath = path.join(__dirname, `${title}.mp4`);
      const stream = ytdl(text, { quality: 'highest' }).pipe(fs.createWriteStream(videoPath));

      stream.on('finish', () => {
        bot.sendVideo(chatId, videoPath, { caption: `دانلود کامل شد: ${title}` })
          .then(() => fs.unlinkSync(videoPath)) // حذف فایل محلی
          .catch(err => console.error(err));
      });
    } catch (error) {
      bot.sendMessage(chatId, "خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
      console.error(error);
    }
  } else {
    bot.sendMessage(chatId, "لطفاً یک لینک معتبر از یوتیوب ارسال کنید.");
  }
});