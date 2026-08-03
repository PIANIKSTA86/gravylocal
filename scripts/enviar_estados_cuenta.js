const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const PB_URL = 'http://localhost:8090'; // Cambia si tu PocketBase está en otro puerto
const PB_TOKEN = 'TU_TOKEN_ADMIN'; // Reemplaza por tu token admin

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TU_CORREO@gmail.com', // Reemplaza por tu correo
    pass: 'TU_CONTRASEÑA_DE_APP' // Usa contraseña de aplicación
  }
});

async function obtenerEmailPropietario(propietarioId) {
  const res = await fetch(`${PB_URL}/api/collections/terceros/records/${propietarioId}`, {
    headers: { Authorization: 'Bearer ' + PB_TOKEN }
  });
  const data = await res.json();
  return data.email || data.correo || null;
}

async function obtenerEstadosCuenta() {
  const res = await fetch(`${PB_URL}/api/collections/estados_cuenta/records?perPage=200`, {
    headers: { Authorization: 'Bearer ' + PB_TOKEN }
  });
  const data = await res.json();
  return data.items || [];
}

async function enviarCorreo(destinatario, pdfUrl, nombreArchivo) {
  const pdfRes = await fetch(pdfUrl);
  const pdfBuffer = await pdfRes.buffer();

  await transporter.sendMail({
    from: '"Administración" <TU_CORREO@gmail.com>',
    to: destinatario,
    subject: 'Estado de Cuenta Mensual',
    text: 'Adjuntamos su estado de cuenta mensual. También puede consultarlo en la app.',
    attachments: [
      { filename: nombreArchivo, content: pdfBuffer }
    ]
  });
}

(async () => {
  const estados = await obtenerEstadosCuenta();
  for (const estado of estados) {
    try {
      const email = await obtenerEmailPropietario(estado.propietario);
      if (!email) {
        console.error('No se encontró email para propietario', estado.propietario);
        continue;
      }
      const pdfUrl = `${PB_URL}/api/files/estados_cuenta/${estado.id}/${estado.pdf}`;
      await enviarCorreo(email, pdfUrl, estado.pdf);
      console.log(`Enviado a ${email}`);
    } catch (err) {
      console.error('Error enviando a', estado, err);
    }
  }
})();
