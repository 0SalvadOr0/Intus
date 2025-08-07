const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/files', express.static('files'));

// Ensure allegati and archivio directories exist
const allegatiDir = path.join(__dirname, 'files', 'allegati');
const archivioDir = path.join(__dirname, 'files', 'archivio');
if (!fs.existsSync(allegatiDir)) {
  fs.mkdirSync(allegatiDir, { recursive: true });
}
if (!fs.existsSync(archivioDir)) {
  fs.mkdirSync(archivioDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use different directory based on upload type
    const uploadType = req.body.uploadType || 'allegati';
    const targetDir = uploadType === 'archivio' ? archivioDir : allegatiDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato. Solo PDF, DOC e DOCX sono accettati.'), false);
    }
  }
});

// Upload endpoint
app.post('/api/upload-allegato', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    console.log('File uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/files/allegati/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore durante l\'upload del file'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File troppo grande. Dimensione massima: 10MB'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Errore del server'
  });
});

// Upload document to archivio
app.post('/api/upload-documento', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    const { name, description, category } = req.body;

    console.log('Document uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      name,
      description,
      category
    });

    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      name: name || req.file.originalname,
      description: description || '',
      category: category || 'Generale',
      fileUrl: `/files/archivio/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore durante l\'upload del documento'
    });
  }
});

// Get all documents from archivio
app.get('/api/documents', (req, res) => {
  try {
    const files = fs.readdirSync(archivioDir);
    const documents = files.map(file => {
      const filePath = path.join(archivioDir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();

      return {
        id: file,
        name: file,
        originalName: file,
        description: 'Documento dell\'archivio',
        category: 'Generale',
        fileUrl: `/files/archivio/${file}`,
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
        uploadDate: stats.birthtime.toISOString(),
        type: ext.replace('.', '').toUpperCase()
      };
    });

    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei documenti'
    });
  }
});

// Delete document from archivio
app.delete('/api/documenti/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(archivioDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Documento eliminato con successo'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'eliminazione del documento'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allegati directory: ${allegatiDir}`);
});

module.exports = app;
