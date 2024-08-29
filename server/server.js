const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Secp256k1, sha256 } = require('@cosmjs/crypto');
const { fromHex } = require('@cosmjs/encoding');
const { StargateClient } = require('@cosmjs/stargate'); // Подключаем StargateClient для работы с RPC

const app = express();
app.use(bodyParser.json());

// RPC Endpoint для подключения к блокчейну
const rpcEndpoint = 'https://rpc.cosmos.network'; // Публичный RPC узел Cosmos

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

  // Подключение к RPC узлу
  const client = await StargateClient.connect(rpcEndpoint);

  // Пример запроса баланса пользователя
  const balance = await client.getAllBalances(account);
  console.log('User balance:', balance);

  // Верификация подписи
  const isValid = await verifySignature(txRaw);

  if (isValid) {
    res.status(200).json({ success: true, balance });
  } else {
    res.status(401).json({ success: false, message: 'Invalid signature' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
