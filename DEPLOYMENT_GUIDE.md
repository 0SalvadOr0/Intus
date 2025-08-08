# 🚀 Guida al Deployment - Sito Intus

## 📋 Prerequisiti

### Per il Frontend (Client)
- Node.js 18+ 
- npm o yarn
- Dominio configurato
- Certificato SSL

### Per il Backend (Server API)
- Node.js 18+
- Servizio di hosting (VPS, AWS EC2, DigitalOcean, etc.)
- Reverse proxy (Nginx/Apache)
- PM2 per il process management

## 🔧 Configurazione Produzione

### 1. Frontend Build

```bash
# Installa dipendenze
npm install

# Genera build di produzione
npm run build

# Test build locale
npm run preview
```

### 2. Backend Configuration

#### Copia file di configurazione
```bash
cp .env.production .env
```

#### Modifica variabili ambiente in `.env`:
```env
PORT=3001
NODE_ENV=production
API_KEY=your-secure-random-api-key-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Installa dipendenze per produzione
```bash
npm install --production
```

### 3. Server Setup con PM2

#### Installa PM2 globalmente
```bash
npm install -g pm2
```

#### Crea file di configurazione PM2 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'intus-backend',
    script: 'server-production.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

#### Avvia l'applicazione
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configurazione Nginx

#### File configurazione Nginx (`/etc/nginx/sites-available/intus`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (Static Files)
    location / {
        root /path/to/your/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Upload size limit
        client_max_body_size 10M;
    }

    # File serving
    location /files {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Abilita sito e riavvia Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/intus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Sicurezza

### 1. Generazione API Key sicura
```bash
# Genera una chiave API sicura
openssl rand -hex 32
```

### 2. Configurazione Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Blocca accesso diretto al backend
sudo ufw deny 3001
```

### 3. Backup automatico
```bash
# Script di backup giornaliero
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backup/intus"
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /path/to/intus/files/

# Pulizia backup vecchi (conserva ultimi 7 giorni)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 4. Monitoraggio
```bash
# Monitora applicazione
pm2 monit

# Logs
pm2 logs intus-backend

# Restart se necessario
pm2 restart intus-backend
```

## 🌍 Deploy Frontend

### Opzione 1: Netlify/Vercel (Consigliato)

#### Netlify:
1. Connetti repository GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables:
   - `VITE_API_URL`: `https://yourdomain.com`

#### Vercel:
1. Connetti repository GitHub
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`

### Opzione 2: Server Statico
```bash
# Copia build su server
scp -r dist/* user@yourserver:/path/to/nginx/root/
```

## 🔍 Testing Post-Deploy

### 1. Test Backend API
```bash
# Health check
curl https://yourdomain.com/api/health

# Test upload (con API key)
curl -X POST https://yourdomain.com/api/upload-documento \
  -H "x-api-key: your-api-key" \
  -F "file=@test.pdf" \
  -F "name=Test Document" \
  -F "category=Test"
```

### 2. Test Frontend
- ✅ Navigazione tra pagine
- ✅ Caricamento blog/progetti  
- ✅ Form di contatto
- ✅ Upload documenti (se admin)
- ✅ Responsive design

## 🛠️ Manutenzione

### Update applicazione
```bash
# Backend
git pull origin main
npm install --production
pm2 restart intus-backend

# Frontend
git pull origin main
npm install
npm run build
# Copia nuovi file su server web
```

### Monitoring continuo
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/pm2

/home/user/.pm2/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 user user
    postrotate
        sudo -u user pm2 reloadLogs
    endscript
}
```

## 🚨 Troubleshooting

### Backend non risponde
```bash
pm2 status
pm2 logs intus-backend
pm2 restart intus-backend
```

### Errori di permessi file
```bash
sudo chown -R www-data:www-data /path/to/files/
sudo chmod -R 755 /path/to/files/
```

### SSL/HTTPS issues
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Database connection issues (se applicabile)
- Verifica credenziali in `.env`
- Controlla firewall database
- Test connessione diretta

## 📞 Supporto

Per problemi tecnici:
1. Controlla logs: `pm2 logs`
2. Verifica stato servizi: `pm2 status`
3. Test connettività: `curl https://yourdomain.com/api/health`
4. Controlla configurazione Nginx: `sudo nginx -t`

---

## 🔄 Quick Deploy Script

```bash
#!/bin/bash
# deploy.sh - Script rapido per deployment

set -e

echo "🚀 Starting deployment..."

# Frontend build
echo "📦 Building frontend..."
npm run build

# Backend restart
echo "🔄 Restarting backend..."
pm2 restart intus-backend

# Copy frontend files (se necessario)
if [ "$1" = "frontend" ]; then
    echo "📁 Copying frontend files..."
    sudo cp -r dist/* /var/www/intus/
fi

echo "✅ Deployment completed!"
echo "🌐 Check: https://yourdomain.com/api/health"
```

Rendi eseguibile:
```bash
chmod +x deploy.sh
./deploy.sh
```
