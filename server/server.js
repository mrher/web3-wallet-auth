const express = require('express');
const path = require('path'); // Добавляем модуль path для работы с путями
const bodyParser = require('body-parser');
const { Secp256k1, sha256 } = require('@cosmjs/crypto');
const { fromHex } = require('@cosmjs/encoding');

const app = express();
app.use(bodyParser.json());

// Раздача статических файлов из директории 'client'
app.use('/client', express.static(path.join(__dirname, '../client')));

// Серверная часть для проверки подписи
async function verifySignature(txRaw) {
  const txBytes = Uint8Array.from(atob(txRaw.tx), c => c.charCodeAt(0));
  const hash = sha256(txBytes);

  const publicKey = fromHex(txRaw.publicKey); // Публичный ключ в формате hex
  const signature = fromHex(txRaw.signature); // Подпись в формате hex

  const valid = await Secp256k1.verifySignature(signature, hash, publicKey);
  return valid;
}

app.post('/api/authenticate', async (req, res) => {
  const { account, txRaw } = req.body;

  const isValid = await verifySignature(txRaw);

  if (isValid) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid signature' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
