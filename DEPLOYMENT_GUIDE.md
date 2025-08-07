# 🚀 Guida Deployment: IONOS VPS + GoDaddy Domain

## 📋 **FASE 1: PREPARAZIONE DOMINIO (GoDaddy)**

### 1.1 Acquisto e Configurazione Dominio
- [ ] Acquistare dominio `intuscorleone.it` su GoDaddy
- [ ] Accedere al pannello di controllo GoDaddy
- [ ] Andare su "Gestione DNS" del dominio
- [ ] Annotare i nameserver attuali (backup)

### 1.2 Configurazione DNS (da fare dopo setup VPS)
```
Configurare questi record DNS su GoDaddy:
A Record: @ → [IP_DEL_VPS]
A Record: www → [IP_DEL_VPS]
CNAME: ftp → intuscorleone.it
```

---

## 🖥️ **FASE 2: SETUP VPS IONOS**

### 2.1 Configurazione Iniziale Server
- [ ] Acquistare VPS IONOS con Ubuntu 22.04 LTS
- [ ] Ottenere IP pubblico e credenziali SSH
- [ ] Primo accesso via SSH: `ssh root@[IP_VPS]`

### 2.2 Configurazione Base Ubuntu
```bash
# Aggiornamento sistema
sudo apt update && sudo apt upgrade -y

# Installazione software base
sudo apt install -y curl wget git unzip nano htop ufw

# Configurazione firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### 2.3 Creazione Utente Non-Root
```bash
# Creare utente
sudo adduser intus
sudo usermod -aG sudo intus

# Configurare SSH per nuovo utente
sudo mkdir /home/intus/.ssh
sudo cp ~/.ssh/authorized_keys /home/intus/.ssh/
sudo chown -R intus:intus /home/intus/.ssh
sudo chmod 700 /home/intus/.ssh
sudo chmod 600 /home/intus/.ssh/authorized_keys

# Test accesso: ssh intus@[IP_VPS]
```

---

## 🔧 **FASE 3: INSTALLAZIONE SOFTWARE**

### 3.1 Node.js e NPM
```bash
# Installare Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificare installazione
node --version
npm --version

# Installare PM2 per gestione processi
sudo npm install -g pm2
```

### 3.2 Nginx (Web Server)
```bash
# Installazione
sudo apt install nginx -y

# Avviare e abilitare
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 3.3 Certbot per SSL (Let's Encrypt)
```bash
# Installazione
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Link simbolico
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

## 📂 **FASE 4: DEPLOY APPLICAZIONE**

### 4.1 Clone Repository
```bash
# Spostarsi in directory web
cd /var/www

# Clone del repository (assicurati che sia pubblico o configura SSH keys)
sudo git clone https://github.com/0SalvadOr0/Intus.git intuscorleone
sudo chown -R intus:intus intuscorleone
cd intuscorleone
```

### 4.2 Configurazione Variabili Ambiente
```bash
# Creare file .env per frontend
nano .env.production
```
```env
# Frontend .env.production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://intuscorleone.it/api
```

```bash
# Creare file .env per backend (se necessario)
nano server/.env
```
```env
# Backend .env
PORT=3001
NODE_ENV=production
DATABASE_URL=your_database_url
```

### 4.3 Build Frontend
```bash
# Installare dipendenze
npm install

# Build production
npm run build

# Verificare che la cartella dist/ sia stata creata
ls -la dist/
```

### 4.4 Setup Backend (se presente)
```bash
# Se hai un server.js nella root
npm install express cors multer

# Oppure se hai una cartella server separata
cd server
npm install
cd ..
```

---

## 🌐 **FASE 5: CONFIGURAZIONE NGINX**

### 5.1 Configurazione Principale
```bash
# Backup configurazione default
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Creare nuova configurazione
sudo nano /etc/nginx/sites-available/intuscorleone
```

```nginx
# /etc/nginx/sites-available/intuscorleone
server {
    listen 80;
    server_name intuscorleone.it www.intuscorleone.it;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name intuscorleone.it www.intuscorleone.it;

    # SSL certificates (verranno generate da certbot)
    ssl_certificate /etc/letsencrypt/live/intuscorleone.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/intuscorleone.it/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Document root
    root /var/www/intuscorleone/dist;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy (se hai backend)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Files upload endpoint
    location /files/ {
        alias /var/www/intuscorleone/files/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

### 5.2 Attivazione Configurazione
```bash
# Rimuovere configurazione default
sudo rm /etc/nginx/sites-enabled/default

# Attivare nuova configurazione
sudo ln -s /etc/nginx/sites-available/intuscorleone /etc/nginx/sites-enabled/

# Test configurazione
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔒 **FASE 6: CERTIFICATO SSL**

### 6.1 Configurazione DNS Temporanea
```bash
# Prima di ottenere SSL, assicurati che il DNS punti al VPS
# Su GoDaddy: A Record @ → [IP_VPS]
# Aspetta propagazione DNS (può richiedere fino a 24h)

# Test risoluzione DNS
nslookup intuscorleone.it
```

### 6.2 Generazione Certificato SSL
```bash
# Ottenere certificato Let's Encrypt
sudo certbot --nginx -d intuscorleone.it -d www.intuscorleone.it

# Test auto-renewal
sudo certbot renew --dry-run

# Verificare certificato
sudo systemctl status certbot.timer
```

---

## 🚀 **FASE 7: GESTIONE PROCESSI (PM2)**

### 7.1 Configurazione PM2 (se hai backend)
```bash
# Creare file ecosystem
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'intus-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

```bash
# Avviare con PM2
pm2 start ecosystem.config.js --env production

# Salvare configurazione PM2
pm2 save
pm2 startup

# Monitoring
pm2 status
pm2 logs
```

---

## 📁 **FASE 8: GESTIONE FILES E PERMESSI**

### 8.1 Configurazione Directory Files
```bash
# Assicurarsi che la directory files/ esista e abbia permessi corretti
sudo chown -R www-data:www-data /var/www/intuscorleone/files/
sudo chmod -R 755 /var/www/intuscorleone/files/

# Per upload files (se necessario)
sudo chmod -R 777 /var/www/intuscorleone/files/uploads/
```

### 8.2 Backup Script
```bash
# Creare script backup
sudo nano /usr/local/bin/backup-intus.sh
```

```bash
#!/bin/bash
# Backup script
BACKUP_DIR="/home/intus/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Creare directory backup
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/intus_files_$DATE.tar.gz /var/www/intuscorleone/

# Mantenere solo ultimi 7 backup
find $BACKUP_DIR -name "intus_files_*.tar.gz" -mtime +7 -delete

echo "Backup completato: $BACKUP_DIR/intus_files_$DATE.tar.gz"
```

```bash
# Rendere eseguibile
sudo chmod +x /usr/local/bin/backup-intus.sh

# Aggiungere a crontab (backup giornaliero alle 2 AM)
crontab -e
# Aggiungere: 0 2 * * * /usr/local/bin/backup-intus.sh
```

---

## 🔄 **FASE 9: DEPLOY AUTOMATION**

### 9.1 Script di Deploy
```bash
# Creare script deploy
nano /home/intus/deploy.sh
```

```bash
#!/bin/bash
# Deploy script

cd /var/www/intuscorleone

# Backup before deploy
sudo /usr/local/bin/backup-intus.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart backend (se presente)
pm2 restart intus-backend

# Reload nginx
sudo systemctl reload nginx

echo "Deploy completato!"
```

```bash
# Rendere eseguibile
chmod +x /home/intus/deploy.sh
```

---

## 🛠️ **FASE 10: MONITORING E MAINTENANCE**

### 10.1 Log Monitoring
```bash
# Logs nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs PM2 (se backend)
pm2 logs

# Logs sistema
sudo journalctl -f
```

### 10.2 Configurazione Monitoraggio
```bash
# Installare htop per monitoring
sudo apt install htop iotop nethogs -y

# Configurare logrotate per evitare logs troppo grandi
sudo nano /etc/logrotate.d/nginx
```

---

## ✅ **CHECKLIST FINALE**

### Pre-Deploy
- [ ] Repository GitHub aggiornato
- [ ] Variabili ambiente configurate
- [ ] Database Supabase configurato e popolato
- [ ] DNS configurato su GoDaddy

### Post-Deploy
- [ ] Sito accessibile via https://intuscorleone.it
- [ ] SSL certificato attivo (verifica con browser)
- [ ] Tutte le pagine funzionanti
- [ ] Upload files funzionante
- [ ] Backend API funzionante (se presente)
- [ ] Mobile responsive
- [ ] Performance test (Google PageSpeed)

### Maintenance
- [ ] Backup automatico configurato
- [ ] Monitoring logs attivo
- [ ] Script deploy pronto
- [ ] Documentazione password e accessi

---

## 🆘 **TROUBLESHOOTING COMUNI**

### DNS non risolve
```bash
# Verificare propagazione DNS
dig intuscorleone.it
nslookup intuscorleone.it 8.8.8.8
```

### SSL non funziona
```bash
# Verificare certificato
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

### Sito non carica
```bash
# Controllare nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Controllare permessi
ls -la /var/www/intuscorleone/dist/
```

### Backend non risponde
```bash
# Controllare PM2
pm2 status
pm2 logs intus-backend
```

---

## 📞 **SUPPORTO**

In caso di problemi:
1. Controllare logs nginx: `/var/log/nginx/error.log`
2. Verificare stato servizi: `sudo systemctl status nginx`
3. Testare configurazione: `sudo nginx -t`
4. Riavviare servizi: `sudo systemctl restart nginx`

**Tempo stimato totale: 4-6 ore** (inclusa propagazione DNS)
