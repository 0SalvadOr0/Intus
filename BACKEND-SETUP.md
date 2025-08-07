# 🚀 Setup Backend per Upload Allegati

## ✅ **Completato**

1. ✅ **Backend Express Server** (`server.js`)
2. ✅ **FileUploader aggiornato** per usare backend reale  
3. ✅ **AttivitaGrid** con layout specifico richiesto
4. ✅ **Animazioni personalizzate** in Tailwind
5. ✅ **Scripts di avvio** per Windows e Linux

## 🔧 **Come Avviare il Sistema Completo**

### **Passo 1: Avvia il Backend**

**Su Windows:**
```bash
start-backend.bat
```

**Su Linux/Mac:**
```bash
./start-backend.sh
```

**Manuale:**
```bash
# Installa dipendenze backend
cp server-package.json package.json
npm install

# Avvia server
node server.js
```

### **Passo 2: Avvia Frontend** (terminale separato)
```bash
npm run dev
```

## 🎯 **Sistema Funzionante**

- **Frontend**: `http://localhost:5173` (Vite)
- **Backend**: `http://localhost:3001` (Express)
- **Upload Endpoint**: `http://localhost:3001/api/upload-allegato`
- **File Directory**: `files/allegati/`

## 📁 **Struttura File**

```
├── server.js                 # Backend Express
├── server-package.json       # Dipendenze backend
├── start-backend.sh          # Script Linux/Mac
├── start-backend.bat         # Script Windows
├── files/allegati/           # Directory upload locale
└── src/components/
    ├── FileUploader.tsx      # Upload con backend reale
    └── AttivitaGrid.tsx      # Layout specifico richiesto
```

## 🔥 **Caratteristiche**

### **Backend:**
- ✅ Upload locale in `files/allegati/`
- ✅ Validazione file (PDF, DOC, DOCX)
- ✅ Limite 10MB per file
- ✅ Nomi file sanitizzati con timestamp
- ✅ CORS configurato
- ✅ Error handling completo

### **Frontend:**
- ✅ AttivitaGrid con animazioni `fade-in-right` e `fade-in-left`
- ✅ Layout a 6 categorie come richiesto
- ✅ FileUploader connesso al backend
- ✅ Progress bar e feedback utente
- ✅ Link diretti alle categorie progetti

## 🐛 **Troubleshooting**

**Errore CORS:**
- Assicurati che il backend sia in ascolto su porta 3001

**File non caricati:**
- Verifica che la directory `files/allegati/` esista
- Controlla i permessi di scrittura

**Backend non parte:**
- Installa Node.js se non presente
- Esegui `npm install` nella root

## 🎨 **AttivitaGrid - Layout Implementato**

Il nuovo componente `AttivitaGrid` replica esattamente il layout CSS richiesto:

- ✅ **6 categorie** disposte in griglia 3x2
- ✅ **Animazioni** `fade-in-right` e `fade-in-left` alternate
- ✅ **Styling** identico al CSS fornito
- ✅ **Colori** arancione rgb(255, 117, 14)
- ✅ **Border radius** 28px sui bottoni
- ✅ **Transform matrix** per le animazioni
- ✅ **Link** diretti a categorie progetti

L'output finale è ora perfettamente corrispondente al formato richiesto!
