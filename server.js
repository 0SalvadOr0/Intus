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
import { createClient } from '@supabase/supabase-js';

// 🔧 ES6 Module Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🚀 Express Application Setup
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// 🔑 Supabase (server-side) configuration
const SUPABASE_URL = process.env.VITE_SUPABASEURL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASEANONKEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServer = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

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
      'https://intuscorleone.it',
      'https://www.intuscorleone.it',
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
  if (origin === 'https://intuscorleone.it' || 
      origin === 'https://www.intuscorleone.it') {
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

// 🔍 Debug Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  const url = req.url;
  
  if (origin) {
    console.log(`🌐 Request: ${method} ${url} from ${origin}`);
  }
  
  if (method === 'OPTIONS') {
    console.log(`✈️ Preflight from: ${origin || 'no-origin'}`);
  }
  
  next();
});

app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// 🧰 Utilities
const escapeHtml = (str = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const stripHtmlTags = (html = '') => html.replace(/<[^>]*>/g, ' ');

const truncate = (text = '', max = 200) => {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
};

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

// 🔗 Social share OG for Blog Posts (server-rendered for crawlers)
app.get('/share/blog/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).send('Bad request');
    }

    if (!supabaseServer) {
      return res.status(500).send('Configurazione Supabase mancante sul server');
    }

    const { data: post, error } = await supabaseServer
      .from('blog_posts')
      .select('id, titolo, excerpt, contenuto, autore, created_at, copertina_url, categoria')
      .eq('id', id)
      .eq('pubblicato', true)
      .single();

    if (error || !post) {
      return res.status(404).send('Articolo non trovato');
    }

    const siteUrl = `${req.protocol}://${req.get('host')}`;
    const targetUrl = `${siteUrl}/blog?post=${post.id}`;

    const title = escapeHtml(post.titolo || 'Articolo');
    const rawDesc = post.excerpt || stripHtmlTags(post.contenuto || '');
    const description = escapeHtml(truncate(rawDesc, 200));
    const image = (post.copertina_url && /^https?:\/\//i.test(post.copertina_url))
      ? post.copertina_url
      : `${siteUrl}/files/logos/logo_cuore.png`;

    const published = post.created_at ? new Date(post.created_at).toISOString() : undefined;
    const author = escapeHtml(post.autore || '');

    // Minimal HTML with OG/Twitter meta for crawlers and meta refresh for users
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${targetUrl}">

  <meta property="og:site_name" content="Intus Corleone APS" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${targetUrl}" />
  <meta property="og:image" content="${image}" />
  ${published ? `<meta property="article:published_time" content="${published}" />` : ''}
  ${author ? `<meta property="article:author" content="${author}" />` : ''}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <meta http-equiv="refresh" content="0;url=${targetUrl}">
</head>
<body>
  <noscript>
    <a href="${targetUrl}">Vai all'articolo</a>
  </noscript>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    console.error('❌ Share route error:', e);
    return res.status(500).send('Errore interno');
  }
});

// 🧪 File Type Validation
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

// 🔍 Health Check - FIXED ROUTE
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    security: { 
      helmet: 'enabled', 
      cors: 'configured', 
      rateLimit: 'active', 
      authentication: 'none' 
    },
    server: { 
      environment: process.env.NODE_ENV || 'development',
      allowedOrigins: allowedOrigins.length 
    }
  });
});

// 📤 Upload Allegato
app.post('/api/upload-allegato', uploadLimiter, upload.single('file'), (req, res) => {
  console.log(`📎 Upload allegato request from: ${req.headers.origin}`);
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Nessun file caricato' });
  }
  
  console.log(`✅ File uploaded: ${req.file.filename}`);
  
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
  console.log(`📚 Upload documento request from: ${req.headers.origin}`);
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Nessun file caricato' });
  }
  
  const name = sanitizeInput(req.body.name);
  const description = sanitizeInput(req.body.description);
  const category = sanitizeInput(req.body.category);
  
  console.log(`✅ Document uploaded: ${req.file.filename}`);
  
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
  console.log(`📋 Documents list request from: ${req.headers.origin}`);
  
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
    
    console.log(`✅ Returning ${documents.length} documents`);
    res.json({ success: true, documents });
  } catch (error) {
    console.error(`❌ Error retrieving documents: ${error.message}`);
    res.status(500).json({ success: false, error: 'Errore nel recupero dei documenti' });
  }
});

// 🗑️ Delete Document - FIXED ROUTE PARAMETERS
app.delete('/api/documents/:source/:filename', (req, res) => {
  const { source, filename } = req.params;
  console.log(`🗑️ Delete request: ${source}/${filename} from: ${req.headers.origin}`);
  
  try {
    const sanitizedSource = source.replace(/[^a-zA-Z]/g, '');
    const sanitizedFilename = path.basename(filename);
    
    let filePath;
    if (sanitizedSource === 'archivio') {
      filePath = path.join(archivioDir, sanitizedFilename);
    } else if (sanitizedSource === 'allegati') {
      filePath = path.join(allegatiDir, sanitizedFilename);
    } else {
      return res.status(400).json({ success: false, error: 'Sorgente documento non valida' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Documento non trovato' });
    }
    
    fs.unlinkSync(filePath);
    console.log(`✅ File deleted: ${sanitizedFilename}`);
    res.json({ success: true, message: 'Documento eliminato con successo' });
  } catch (error) {
    console.error(`❌ Error deleting file: ${error.message}`);
    res.status(500).json({ success: false, error: 'Errore durante l\'eliminazione del documento' });
  }
});

// 🚨 Global Error Handler
app.use((err, req, res, next) => {
  console.error(`🚨 Server Error: ${err.message}`);
  console.error(`📍 Stack: ${err.stack}`);
  
  if (err.message && err.message.toLowerCase().includes('cors')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'Origin non autorizzato per questa risorsa'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File troppo grande',
      message: 'Dimensione massima: 5MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Tipo di file non supportato'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Errore interno del server'
  });
});

// 🚀 Server Startup
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🎯 === INTUS BACKEND SERVER ===`);
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.length} configured`);
  console.log(`📁 Public directory: ${publicDir}`);
  console.log(`📎 Allegati directory: ${allegatiDir}`);
  console.log(`📚 Archivio directory: ${archivioDir}`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`================================\n`);
});

// 🛡️ Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
