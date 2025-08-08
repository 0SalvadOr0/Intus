import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🔧 ES6 Module Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🚀 Express Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// 🔒 Security Configuration
const API_KEY = process.env.API_KEY || 'intus-api-key-2025';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://intuscorleone.it',
];

// 🛡️ Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow for file serving
}));

// 🚦 Rate Limiting Configuration
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    error: 'Too many upload attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

// 🌐 CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.use('/files', express.static('files'));

// 🔐 API Authentication Middleware
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing API key'
    });
  }
  
  next();
};

// 📁 Directory Structure Management
const allegatiDir = path.join(__dirname, 'files', 'allegati');
const archivioDir = path.join(__dirname, 'files', 'archivio');

// ✅ Ensure Required Directories Exist
[allegatiDir, archivioDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created directory: ${dir}`);
  }
});

// 🗃️ Enhanced Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetDir = allegatiDir;

    if (req.url.includes('/api/upload-documento')) {
      targetDir = archivioDir;
    } else if (req.url.includes('/api/upload-allegato')) {
      targetDir = allegatiDir;
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // 🔒 Secure filename generation
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100); // Limit filename length
    cb(null, `${timestamp}_${randomString}_${sanitizedName}`);
  }
});

// 📋 Enhanced File Upload Configuration
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only one file per request
  },
  fileFilter: (req, file, cb) => {
    // ✅ Strict file type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Check both mimetype and file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC and DOCX files are allowed.'), false);
    }
  }
});

// 📤 Protected Allegato Upload Endpoint
app.post('/api/upload-allegato', uploadLimiter, authenticateAPI, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // 📊 Secure upload logging (no sensitive data)
    console.log('📎 File uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      ip: req.ip,
      timestamp: new Date().toISOString()
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
      error: 'Internal server error'
    });
  }
});

// 📚 Protected Document Upload Endpoint
app.post('/api/upload-documento', uploadLimiter, authenticateAPI, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // 📝 Sanitize metadata
    const name = req.body.name?.substring(0, 200) || req.file.originalname;
    const description = req.body.description?.substring(0, 500) || '';
    const category = req.body.category?.substring(0, 100) || 'Documenti Ufficiali';

    console.log('📄 Document uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      name: name,
      description: description,
      category: category,
      fileUrl: `/files/archivio/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 📋 Protected Document List Endpoint
app.get('/api/documents', authenticateAPI, (req, res) => {
  try {
    if (!fs.existsSync(archivioDir)) {
      return res.json({ success: true, documents: [] });
    }

    const files = fs.readdirSync(archivioDir);
    const documents = files
      .filter(file => {
        // Only return valid document files
        const ext = path.extname(file).toLowerCase();
        return ['.pdf', '.doc', '.docx'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(archivioDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();

        return {
          id: file,
          name: file,
          originalName: file,
          description: 'Archive document',
          category: 'Official Documents',
          url: `/files/archivio/${file}`,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
          uploadDate: stats.birthtime.toISOString(),
          type: ext.replace('.', '').toUpperCase(),
          source: 'archivio'
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json({ success: true, documents });

  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 📋 Protected All Documents Endpoint  
app.get('/api/all-documents', authenticateAPI, (req, res) => {
  try {
    const allDocuments = [];

    if (fs.existsSync(archivioDir)) {
      const archivioFiles = fs.readdirSync(archivioDir);

      archivioFiles
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.pdf', '.doc', '.docx'].includes(ext);
        })
        .forEach(file => {
          const filePath = path.join(archivioDir, file);
          const stats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();

          allDocuments.push({
            id: `archivio_${file}`,
            name: file,
            originalName: file,
            description: 'Official archive document',
            category: 'Official Documents',
            url: `/files/archivio/${file}`,
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            mimeType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
            uploadDate: stats.birthtime.toISOString(),
            type: ext.replace('.', '').toUpperCase(),
            source: 'archivio'
          });
        });
    }

    allDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    res.json({ success: true, documents: allDocuments });

  } catch (error) {
    console.error('❌ Error fetching all documents:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 🗑️ Protected Document Deletion Endpoint
app.delete('/api/documents/:filename', authenticateAPI, (req, res) => {
  try {
    const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, ''); // Sanitize filename
    const filePath = path.join(archivioDir, filename);

    // Security check: ensure file is in the correct directory
    if (!filePath.startsWith(archivioDir)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file path'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    fs.unlinkSync(filePath);
    console.log(`🗑️ Document deleted: ${filename} by IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 🔍 Public Health Check Endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-production'
  });
});

// ⚠️ Enhanced Error Handling Middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size: 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Only one file per upload'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 🚫 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// 🚀 Server Startup
app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`🔐 API authentication: ${API_KEY ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🛡️ CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`📁 Upload directories configured`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
