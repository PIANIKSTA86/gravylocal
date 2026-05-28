const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 4000; // Puedes cambiar el puerto si lo necesitas

// Endpoint protegido por una clave simple (puedes mejorar la seguridad)
const API_KEY = 'TU_API_KEY_SECRETA';

app.post('/api/enviar-estados-cuenta', (req, res) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  exec('node scripts/enviar_estados_cuenta.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    res.json({ success: true, output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de envío de estados de cuenta escuchando en http://localhost:${PORT}`);
});
