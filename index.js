const express = require('express');
const path = require('path');
const translate = require('node-google-translate-skidz'); // Importa el paquete de traducción
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para parsear JSON

// Ruta para traducir propiedades de las cards
app.post('/translate-card', async (req, res) => {
    const { title, culture, dynasty } = req.body;
    console.log(title);
    console.log(title, culture, dynasty);
    
    try {
        const translatedTitle = await translate({ text: title, source: 'en', target: 'es' });
        console.log('Translated Title Response:', translatedTitle); // Imprime la respuesta completa para verificar su estructura
        const translatedCulture = await translate({ text: culture, source: 'en', target: 'es' });
        console.log('Translated Culture Response:', translatedCulture); // Imprime la respuesta completa para verificar su estructura
        const translatedDynasty = await translate({ text: dynasty, source: 'en', target: 'es' });
        console.log('Translated Dynasty Response:', translatedDynasty); // Imprime la respuesta completa para verificar su estructura

        res.json({
            translatedTitle: translatedTitle.translation, // Verificar que 'translation' es la propiedad correcta
            translatedCulture: translatedCulture.translation,
            translatedDynasty: translatedDynasty.translation
        });
    } catch (error) {
        console.error('Error al traducir las propiedades de las cards:', error);
        res.status(500).json({ error: 'Error al traducir las propiedades de las cards' });
    }
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
