# Directory Allegati

Questa directory è destinata a contenere i file allegati caricati attraverso il form "Presenta Progetto".

## Sviluppo vs Produzione

### Modalità Sviluppo (Attuale)
- I file vengono simulati con blob URLs temporanei
- Non vengono effettivamente salvati sul disco
- Utilizzato per testing e sviluppo dell'interfaccia

### Modalità Produzione (Da Implementare)
Per implementare il vero upload locale in produzione, è necessario:

1. **Backend Server**: Creare un endpoint API (Node.js, PHP, Python, etc.) che gestisca l'upload
2. **Configurazione Web Server**: Configurare il web server per servire i file da questa directory
3. **Sicurezza**: Implementare validazioni lato server per tipo file e dimensioni
4. **Gestione Errori**: Gestire errori di permessi, spazio disco, etc.

## Esempio Implementazione Backend (Node.js/Express)

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/allegati/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitized}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

app.post('/api/upload-allegato', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    fileName: req.file.filename,
    fileUrl: `/files/allegati/${req.file.filename}`,
    fileSize: req.file.size
  });
});
```

## Struttura File
- Nome formato: `timestamp_nome_file_sanitized.estensione`
- Tipi supportati: PDF, DOC, DOCX
- Dimensione massima: 10MB per file
- Massimo 3 file per progetto
