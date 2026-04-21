require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioFrom = 'whatsapp:+15557864742';
const templateCarrusel = 'HX0d093672f05851ce20af48d7df779878';

// ============================================
// ENDPOINT: SOLO ENVIAR CARRUSEL DE BIENVENIDA
// ============================================
app.post('/send-template', async (req, res) => {
  try {
    console.log('📥 Webhook recibido desde Zapier:', req.body);

    let phoneNumber = req.body.phone || req.body.phoneNumber || req.body.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'No se proporcionó número de teléfono',
        received: req.body
      });
    }

    phoneNumber = phoneNumber.trim().replace(/\s+/g, '');

    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+521' + phoneNumber;
    }

    if (phoneNumber.startsWith('+52') && !phoneNumber.startsWith('+521')) {
      phoneNumber = phoneNumber.replace('+52', '+521');
    }

    console.log(`📤 Enviando carrusel de bienvenida a: ${phoneNumber}`);

    const message = await client.messages.create({
      from: twilioFrom,
      to: `whatsapp:${phoneNumber}`,
      contentSid: templateCarrusel,
    });

    console.log(`✅ Carrusel enviado | SID: ${message.sid}`);

    res.json({
      success: true,
      messageSid: message.sid,
      to: phoneNumber,
      status: message.status,
      message: 'Carrusel enviado - Bot IA tomará el control cuando responda'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: error.message,
      code: error.code
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'active',
    service: 'Novach AI - WhatsApp Lead Automation',
    endpoints: ['/send-template']
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 POST /send-template - Envía carrusel de bienvenida`);
});
