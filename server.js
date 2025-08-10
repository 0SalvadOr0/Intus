import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
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
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Troppi upload. Riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Troppe richieste. Riprova più tardi.' }
});

// 🌐 HTTP-Only Enhanced CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://intuscorleone.it',
      'http://www.intuscorleone.it',
      'http://217.160.124.10'
    ];

// 🔍 Simplified Origin Validation (HTTP-Only)
const validateOrigin = (origin, callback) => {
  console.log(`🔍 CORS Check - Origin: ${origin || 'undefined'}`);
  
  // Allow requests with no origin (mobile apps, server-to-server, etc.)
  if (!origin) {
    console.log('✅ No origin - allowing request');
    return callback(null, true);
  }

  // Check exact matches from allowed origins
  if (allowedOrigins.includes(origin)) {
    console.log(`✅ Origin approved: ${origin}`);
    return callback(null, true);
  }

  // Allow localhost variations for development
  if (origin.startsWith('http://localhost') || 
      origin.startsWith('http://127.0.0.1')) {
    console.log(`✅ Localhost approved: ${origin}`);
    return callback(null, true);
  }

  // Allow your server IP
  if (origin.startsWith('http://217.160.124.10')) {
    console.log(`✅ Server IP approved: ${origin}`);
    return callback(null, true);
  }

  // Allow your domain variations (HTTP only)
  if (origin === 'http://intuscorleone.it' || 
      origin === 'http://www.intuscorleone.it') {
    console.log(`✅ Domain approved: ${origin}`);
    return callback(null, true);
  }

  // Reject everything else
  console.log(`🚫 CORS REJECTED: ${origin}`);
  console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
  callback(new Error(`CORS: Origin ${origin} non autorizzato`));
};

// 🛡️ CORS Middleware Configuration
app.use(cors({
  origin: validateOrigin,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// 🔧 Explicit OPTIONS Handler
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`✈️ OPTIONS preflight from: ${origin || 'no-origin'}`);
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  res.status(200).send();
});

// 🔍 Simple Debug Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'];
  
  // Log ogni richiesta con origin
  if (origin) {
    console.log(`\n🌐 === CORS REQUEST DEBUG ===`);
    console.log(`📍 Origin: ${origin}`);
    console.log(`🔧 Method: ${method}`);
    console.log(`📂 URL: ${url}`);
    console.log(`💻 User-Agent: ${userAgent?.substring(0, 50)}...`);
    
    // Check se l'origin è in lista
    const isAllowed = allowedOrigins.includes(origin);
    console.log(`${isAllowed ? '✅' : '❌'} Origin Status: ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`🗂️ Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`================================\n`);
  }
  
  // Log specifico per preflight
  if (method === 'OPTIONS') {
    console.log(`✈️ PREFLIGHT REQUEST DETECTED`);
    console.log(`📋 Requested Headers: ${req.headers['access-control-request-headers'] || 'none'}`);
    console.log(`🔧 Requested Method: ${req.headers['access-control-request-method'] || 'none'}`);
  }
  
  next();
});

app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// 📁 Directory Structure Setup
const publicDir = path.join(__dirname, 'public');
const allegatiDir = path.join(publicDir, 'files', 'allegati');
const archivioDir = path.join(publicDir, 'files', 'archivio');

[publicDir, allegatiDir, archivioDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created directory: ${dir}`);
  }
});

// 🧪 Enhanced File Type Validation
const validateFileType = (file) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  return allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt);
};

// 🔒 Secure Filename Generation
const generateSecureFilename = (originalName) => {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  return `${timestamp}_${randomStr}_${baseName}${ext}`;
};

// 🗃️ Multer Configuration
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
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10, fieldSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (validateFileType(file)) cb(null, true);
    else cb(new Error('Tipo di file non supportato o potenzialmente pericoloso.'), false);
  }
});

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>]/g, '')
              .trim()
              .substring(0, 500);
};

// 📤 Upload Allegato
app.post('/api/upload-allegato', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Nessun file caricato' });
  res.json({
    success: true,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileUrl: `/files/allegati/${req.file.filename}`,
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  });
});

// 📚 Upload Documento
app.post('/api/upload-documento', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Nessun file caricato' });
  const name = sanitizeInput(req.body.name);
  const description = sanitizeInput(req.body.description);
  const category = sanitizeInput(req.body.category);
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
});

// 📋 Lista Documenti
app.get('/api/documents', (req, res) => {
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
    res.status(500).json({ success: false, error: 'Errore nel recupero dei documenti' });
  }
});

// 🗑️ Eliminazione Documento
app.delete('/api/documents/:source/:filename', (req, res) => {
  try {
    const { source, filename } = req.params;
    const sanitizedSource = source.replace(/[^a-zA-Z]/g, '');
    const sanitizedFilename = path.basename(filename);
    let filePath;
    if (sanitizedSource === 'archivio') filePath = path.join(archivioDir, sanitizedFilename);
    else if (sanitizedSource === 'allegati') filePath = path.join(allegatiDir, sanitizedFilename);
    else return res.status(400).json({ success: false, error: 'Sorgente documento non valida' });
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'Documento non trovato' });
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Documento eliminato con successo' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore durante l\'eliminazione del documento' });
  }
});

// 🔍 Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    security: { helmet: 'enabled', cors: 'configured', rateLimit: 'active', authentication: 'none' },
    server: { environment: process.env.NODE_ENV || 'development' }
  });
});

// 🚨 CORS Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.toLowerCase().includes('cors')) {
    console.log(`\n🚫 === CORS ERROR ===`);
    console.log(`❌ Error: ${err.message}`);
    console.log(`📍 Origin: ${req.headers.origin || 'undefined'}`);
    console.log(`🔧 Method: ${req.method}`);
    console.log(`📂 URL: ${req.url}`);
    console.log(`==================\n`);
    
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      origin: req.headers.origin,
      message: 'Origin non autorizzato per questa risorsa'
    });
  }
  next(err);
});

// 🚀 Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`📁 Public directory: ${publicDir}`);
  console.log(`📎 Allegati directory: ${allegatiDir}`);
  console.log(`📚 Archivio directory: ${archivioDir}`);
});
