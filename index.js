const express = require('express');
const path = require('path');
const translate = require('node-google-translate-skidz'); // Importa el paquete de traducción
const app = express();
const port = 3000;

app.use(express.json());// Middleware para analizar el cuerpo de la solicitud JSON

// Ruta para traducir texto
app.post('/translate', (req, res) => {
    const { text, targetLang } = req.body;
    console.log(text);
    translate({
        text: text,
        source: 'en', // Idioma de origen (Inglés)
        target: targetLang, // Idioma de destino (Español)
    }, (result) => {
        if (result && result.translation) {
            res.json({ translatedText: result.translation });
        } else {
            res.status(500).json({ error: 'Error al traducir el texto' });
        }
    });
});


// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Enviar el archivo HTML al acceder a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
