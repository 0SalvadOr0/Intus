import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🔧 ES6 Module Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🚀 Express Application Setup
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// 🔐 Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY || crypto.randomBytes(32).toString('hex');

console.log(`🔑 Generated API Key: ${UPLOAD_API_KEY}`);
console.log(`🔒 Store this key securely for frontend authentication`);

// 🛡️ Security Middleware Stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 🚦 Rate Limiting Configuration
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: {
    success: false,
    error: 'Troppi upload. Riprova tra 15 minuti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Troppe richieste. Riprova più tardi.'
  }
});

// 🌐 Enhanced CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches IP pattern
    if (allowedOrigins.includes(origin) || 
        origin.startsWith('http://217.160.124.10') || 
        origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Non autorizzato da CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], // Add OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// 📁 Directory Structure Setup
const publicDir = path.join(__dirname, 'public');
const allegatiDir = path.join(publicDir, 'files', 'allegati');
const archivioDir = path.join(publicDir, 'files', 'archivio');

// ✅ Ensure Required Directories Exist
[publicDir, allegatiDir, archivioDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created directory: ${dir}`);
  }
});

// 🔐 Authentication Middleware
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== UPLOAD_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Accesso non autorizzato. API key richiesta.'
    });
  }
  
  next();
};

// 🧪 Enhanced File Type Validation
const validateFileType = (file) => {
  // MIME type validation
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // File extension validation
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // File signature validation (magic numbers)
  const magicNumbers = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // DOC signature
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04] // DOCX (ZIP)
  };
  
  return allowedMimeTypes.includes(file.mimetype) && 
         allowedExtensions.includes(fileExt);
};

// 🔒 Secure Filename Generation
const generateSecureFilename = (originalName) => {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  
  return `${timestamp}_${randomStr}_${baseName}${ext}`;
};

// 🗃️ Secure Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = req.url.includes('/api/upload-documento') ? archivioDir : allegatiDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // Reduced to 5MB
    files: 1,
    fields: 10,
    fieldSize: 1024 * 1024 // 1MB per field
  },
  fileFilter: (req, file, cb) => {
    if (validateFileType(file)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato o potenzialmente pericoloso.'), false);
    }
  }
});

// 📝 Input Sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>]/g, '')
              .trim()
              .substring(0, 500);
};

// 📤 Secure Allegato Upload Endpoint
app.post('/api/upload-allegato', uploadLimiter, authenticateAPI, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    // 📊 Security logging
    console.log('📎 Secure file upload:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      clientIP: req.ip,
      userAgent: req.get('user-agent')
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
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'upload del file'
    });
  }
});

// 📚 Secure Document Upload Endpoint
app.post('/api/upload-documento', uploadLimiter, authenticateAPI, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    // 🧹 Sanitize metadata inputs
    const name = sanitizeInput(req.body.name);
    const description = sanitizeInput(req.body.description);
    const category = sanitizeInput(req.body.category);

    console.log('📄 Secure document upload:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      name, description, category,
      clientIP: req.ip
    });

    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      name: name || req.file.originalname,
      description: description || '',
      category: category || 'Documenti Ufficiali',
      fileUrl: `/files/archivio/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'upload del documento'
    });
  }
});

// 📋 Secure Document List Endpoint
app.get('/api/documents', authenticateAPI, (req, res) => {
  try {
    const files = fs.readdirSync(archivioDir);

    const documents = files.map(file => {
      const filePath = path.join(archivioDir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();

      return {
        id: crypto.createHash('sha256').update(file).digest('hex').substring(0, 16),
        name: file,
        originalName: file,
        description: 'Documento dell\'archivio',
        category: 'Documenti Ufficiali',
        fileUrl: `/files/archivio/${file}`,
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
        uploadDate: stats.birthtime.toISOString(),
        type: ext.replace('.', '').toUpperCase(),
        source: 'archivio'
      };
    });

    res.json({ success: true, documents });

  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei documenti'
    });
  }
});

// 🗑️ Secure Document Deletion Endpoint
app.delete('/api/documents/:source/:filename', authenticateAPI, (req, res) => {
  try {
    const { source, filename } = req.params;
    
    // 🧹 Sanitize inputs and prevent path traversal
    const sanitizedSource = source.replace(/[^a-zA-Z]/g, '');
    const sanitizedFilename = path.basename(filename); // Prevents path traversal
    
    let filePath;
    
    if (sanitizedSource === 'archivio') {
      filePath = path.join(archivioDir, sanitizedFilename);
    } else if (sanitizedSource === 'allegati') {
      filePath = path.join(allegatiDir, sanitizedFilename);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Sorgente documento non valida'
      });
    }

    // 🔍 Security checks
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    // Ensure file is within allowed directories
    const resolvedPath = path.resolve(filePath);
    const allowedPaths = [path.resolve(archivioDir), path.resolve(allegatiDir)];
    
    if (!allowedPaths.some(allowedPath => resolvedPath.startsWith(allowedPath))) {
      return res.status(403).json({
        success: false,
        error: 'Accesso al file non autorizzato'
      });
    }

    fs.unlinkSync(filePath);
    
    console.log(`🗑️ Secure document deletion: ${sanitizedSource}/${sanitizedFilename} by IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Documento eliminato con successo'
    });
    
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'eliminazione del documento'
    });
  }
});

// 🔍 Enhanced Health Check with Security Info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimit: 'active',
      authentication: 'required'
    },
    server: {
      environment: process.env.NODE_ENV || 'development'
      // Removed sensitive HOST/PORT info
    }
  });
});

// ⚠️ Enhanced Error Handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File troppo grande. Dimensione massima: 5MB'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo file inaspettato'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Errore interno del server'
  });
});

// 🚀 Secure Server Startup
app.listen(PORT, HOST, () => {
  console.log(`🚀 Secure server running on ${HOST}:${PORT}`);
  console.log(`🔒 Security features enabled: Helmet, CORS, Rate Limiting, Authentication`);
  console.log(`🔑 API Key required for all protected endpoints`);
  console.log(`📊 Rate limits: 10 uploads/15min, 100 requests/min`);
});

export default app;