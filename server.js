import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🔧 ES6 Module Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🚀 Express Application Setup
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // 🌐 Bind to all interfaces

// 🛠️ Enhanced CORS Configuration for External Access
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

// 📁 Updated Directory Structure for Vite Compatibility
const publicDir = path.join(__dirname, 'public');
const allegatiDir = path.join(publicDir, 'files', 'allegati');
const archivioDir = path.join(publicDir, 'files', 'archivio');

// ✅ Ensure Required Directories Exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`📂 Created directory: ${publicDir}`);
}
if (!fs.existsSync(allegatiDir)) {
  fs.mkdirSync(allegatiDir, { recursive: true });
  console.log(`📂 Created directory: ${allegatiDir}`);
}
if (!fs.existsSync(archivioDir)) {
  fs.mkdirSync(archivioDir, { recursive: true });
  console.log(`📂 Created directory: ${archivioDir}`);
}

// 🗃️ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🎯 Dynamic directory selection based on endpoint
    let targetDir = allegatiDir; // default for /api/upload-allegato

    // Check the URL to determine the correct directory
    if (req.url.includes('/api/upload-documento')) {
      targetDir = archivioDir;
    } else if (req.url.includes('/api/upload-allegato')) {
      targetDir = allegatiDir;
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // 🕒 Timestamp-based unique filename generation
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

// 📋 File Upload Configuration & Validation
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 🎯 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // ✅ Allowed document types validation
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

// 📤 Allegato Upload Endpoint
app.post('/api/upload-allegato', upload.single('file'), (req, res) => {
  try {
    // 🔍 File validation check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    // 📊 Upload success logging
    console.log('📎 File uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // ✅ Success response structure - Updated URL for Vite
    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/files/allegati/${req.file.filename}`, // 🎯 Vite-compatible URL
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

  } catch (error) {
    // ⚠️ Error handling & logging
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore durante l\'upload del file'
    });
  }
});

// 📚 Document Upload to Archivio Endpoint
app.post('/api/upload-documento', upload.single('file'), (req, res) => {
  try {
    // 🔍 File validation check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    // 📝 Document metadata extraction
    const { name, description, category } = req.body;

    // 📊 Document upload logging
    console.log('📄 Document uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      name,
      description,
      category
    });

    // ✅ Success response with metadata - Updated URL for Vite
    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      name: name || req.file.originalname,
      description: description || '',
      category: category || 'Documenti Ufficiali',
      fileUrl: `/files/archivio/${req.file.filename}`, // 🎯 Vite-compatible URL
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    // ⚠️ Error handling & logging
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore durante l\'upload del documento'
    });
  }
});

// 📋 Document List Retrieval Endpoint (Archivio Only)
app.get('/api/documents', (req, res) => {
  try {
    // 📂 Read archivio directory contents
    const files = fs.readdirSync(archivioDir);

    // 🔄 Transform files into document objects
    const documents = files.map(file => {
      const filePath = path.join(archivioDir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();

      return {
        id: file,
        name: file,
        originalName: file,
        description: 'Documento dell\'archivio',
        category: 'Documenti Ufficiali',
        fileUrl: `/files/archivio/${file}`, // 🎯 Updated for Vite compatibility
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
        uploadDate: stats.birthtime.toISOString(),
        type: ext.replace('.', '').toUpperCase(),
        source: 'archivio'
      };
    });

    // ✅ Return document list
    res.json({ success: true, documents });

  } catch (error) {
    // ⚠️ Error handling
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei documenti'
    });
  }
});

// 📋 Unified Document List (Archivio + Allegati) Endpoint
app.get('/api/all-documents', (req, res) => {
  try {
    const allDocuments = [];

    // 📂 Read archivio directory contents
    if (fs.existsSync(archivioDir)) {
      const archivioFiles = fs.readdirSync(archivioDir);

      archivioFiles.forEach(file => {
        const filePath = path.join(archivioDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();

        allDocuments.push({
          id: `archivio_${file}`,
          name: file,
          originalName: file,
          description: 'Documento ufficiale dell\'archivio',
          category: 'Documenti Ufficiali',
          url: `/files/archivio/${file}`, // 🎯 Updated for Vite compatibility
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
          uploadDate: stats.birthtime.toISOString(),
          type: ext.replace('.', '').toUpperCase(),
          source: 'archivio'
        });
      });
    }

    // 📅 Sort by upload date (newest first)
    allDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    // ✅ Return unified document list
    res.json({ success: true, documents: allDocuments });

  } catch (error) {
    // ⚠️ Error handling
    console.error('❌ Error fetching all documents:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei documenti'
    });
  }
});

// 🗑️ Document Deletion Endpoint - Enhanced for both directories
app.delete('/api/documents/:source/:filename', (req, res) => {
  try {
    const { source, filename } = req.params;
    let filePath;

    // 🎯 Determine source directory
    if (source === 'archivio') {
      filePath = path.join(archivioDir, filename);
    } else if (source === 'allegati') {
      filePath = path.join(allegatiDir, filename);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Sorgente documento non valida'
      });
    }

    // 🔍 File existence validation
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    // 🗑️ Delete file from filesystem
    fs.unlinkSync(filePath);
    console.log(`🗑️ Document deleted: ${source}/${filename}`);

    // ✅ Deletion success response
    res.json({
      success: true,
      message: 'Documento eliminato con successo'
    });
    
  } catch (error) {
    // ⚠️ Error handling
    console.error('❌ Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'eliminazione del documento'
    });
  }
});

// ⚠️ Multer Error Handling Middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File troppo grande. Dimensione massima: 10MB'
      });
    }
  }
  
  // 🚨 Generic error response
  res.status(500).json({
    success: false,
    error: error.message || 'Errore del server'
  });
});

// 🔍 Enhanced Health Check Endpoint with Network Info
app.get('/api/health', (req, res) => {
  const networkInfo = {
    host: req.get('host'),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    origin: req.get('origin')
  };

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: {
      host: HOST,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    },
    client: networkInfo,
    directories: {
      public: fs.existsSync(publicDir),
      allegati: fs.existsSync(allegatiDir),
      archivio: fs.existsSync(archivioDir)
    }
  });
});

// 🚀 Enhanced Server Startup with Network Details
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📁 Public directory: ${publicDir}`);
  console.log(`📎 Allegati directory: ${allegatiDir}`);
  console.log(`📚 Archivio directory: ${archivioDir}`);
  console.log(`🌐 Health check: http://${HOST === '0.0.0.0' ? 'YOUR_SERVER_IP' : HOST}:${PORT}/api/health`);
  console.log(`🔗 External access: http://YOUR_SERVER_IP:${PORT}`);
  console.log(`📊 CORS enabled for all origins`);
});

// 📦 ES6 Module Export
export default app;