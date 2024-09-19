const translate = require('node-google-translate-skidz');

const textsToTranslate = [
    { text: 'Title in English', source: 'en', target: 'es' },
    { text: 'Culture in English', source: 'en', target: 'es' },
    { text: 'Dynasty in English', source: 'en', target: 'es' }
];

textsToTranslate.forEach(item => {
    translate({
        text: item.text,
        source: item.source,
        target: item.target
    }, function(result) {
        console.log(`Original: ${item.text}`);
        console.log(`Traducido: ${result.translation}`);
    });
});
