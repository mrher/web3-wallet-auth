// Важно: данный код рассчитан на работу в браузере
async function connectCosmosWallet() {
    const chainId = 'cosmoshub-4'; // Идентификатор сети Cosmos Hub
    const rpcEndpoint = 'https://rpc.cosmos.network'; // RPC-эндпоинт
  
    // Подключение к кошельку через Keplr (или другой Cosmos-кошелек)
    if (!window.getOfflineSigner || !window.keplr) {
      alert("Please install Keplr extension");
      return;
    }
  
    await window.keplr.enable(chainId);
    const offlineSigner = window.getOfflineSigner(chainId);
  
    const accounts = await offlineSigner.getAccounts();
    const firstAccount = accounts[0];
    console.log('Connected account:', firstAccount.address);
  
    // Создание клиента для подписания транзакций
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner);
    
    // Подпись данных (в данном случае транзакции)
    const message = 'Authenticate with this message';
    const tx = {
      msg: [],
      fee: {
        amount: [{ denom: 'uatom', amount: '5000' }],
        gas: '200000',
      },
      signatures: null,
      memo: message,
    };
  
    const txRaw = await client.sign(firstAccount.address, tx.msg, tx.fee, tx.memo);
  
    console.log('Signed transaction:', txRaw);
  
    // Отправка подписи на сервер для проверки
    const response = await fetch('http://localhost:3000/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account: firstAccount.address, txRaw }),
    });
  
    if (response.ok) {
      console.log('Authentication successful!');
    } else {
      console.error('Authentication failed!');
    }
  }
  
  // Вызов функции при загрузке страницы или по событию
  window.onload = function() {
    connectCosmosWallet();
  };
  