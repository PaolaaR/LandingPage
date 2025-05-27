const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Nueva API Key para Khipu v3
const khipuApiKey = 'f0157878-baeb-4207-8f9b-f13203a09e30';

app.post('/crear-pago', async (req, res) => {
  const { plan, monto } = req.body;

  const payload = {
    subject: `Pago plan ${plan}`,
    currency: "CLP",
    amount: Number(monto),
    transaction_id: `txn_${Date.now()}`,
    return_url: "http://localhost:3000/exito",
    cancel_url: "http://localhost:3000/cancelado",
    notification_url: "http://localhost:3000/api/khipu/notify"
  };

  try {
    const response = await fetch('https://payment-api.khipu.com/v3/payments', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Tu-App-Express',  // Puedes personalizar esto
        'x-api-key': khipuApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Khipu:', errorText);
      return res.status(500).send('Error en Khipu: ' + errorText);
    }

    const data = await response.json();

    // Redirige al usuario al link de pago
    return res.redirect(data.payment_url);
  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).send('Error del servidor: ' + error.message);
  }
});

app.get('/exito', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exito.html'));
});
app.get('/cancelado', (req, res) => res.send('Pago cancelado.'));

// Endpoint para recibir notificaciones de Khipu
app.post('/api/khipu/notify', (req, res) => {
  console.log('Notificación de Khipu recibida:', req.body);
  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));
