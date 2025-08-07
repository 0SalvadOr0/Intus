# 📋 Modifiche Sistema Upload e Call di Idee

## ✅ Modifiche Completate

### 🗂️ 1. Sistemazione Path Upload

**Problema risolto:** I documenti dalla dashboard andavano in `files/allegati` invece di `files/archivio`

**Modifiche effettuate:**
- ✅ Aggiornato `server.js` per gestire correttamente le directory dinamicamente
- ✅ Creato nuovo componente `DocumentUploader.tsx` specifico per l'archivio
- ✅ Aggiornato `FileUploader.tsx` per indicare chiaramente che va in allegati (Call Idee)
- ✅ Sistemate le categorie di default per evitare inconsistenze

**Risultato:**
- 📁 **Dashboard documenti** → `files/archivio/` (categoria: "Documenti Ufficiali")
- 📎 **Call di idee allegati** → `files/allegati/` (categoria: "Allegati Call Idee")

### 🏷️ 2. Filtri Categorie Sistemati

**Problema risolto:** Inconsistenze nelle categorie tra endpoint diversi

**Categorie standardizzate:**
- `"Documenti Ufficiali"` - Per documenti della dashboard (archivio)
- `"Allegati Call Idee"` - Per allegati del call di idee
- `"Generale"` - Categoria di fallback

### 🗄️ 3. Database Call di Idee

**Problema risolto:** Struttura tabella mancante o incompleta per candidature

**Script SQL creati:**
- `sql-scripts/call_idee_giovani_setup.sql` - **Creazione tabella completa**
- `sql-scripts/call_idee_giovani_alter.sql` - **Aggiornamento tabella esistente**

## 🚀 Istruzioni per l'Implementazione

### Passo 1: Database (OBBLIGATORIO)

**Opzione A - Tabella Nuova:**
```sql
-- Esegui in Supabase SQL Editor
-- File: sql-scripts/call_idee_giovani_setup.sql
```

**Opzione B - Tabella Esistente:**
```sql
-- Esegui in Supabase SQL Editor
-- File: sql-scripts/call_idee_giovani_alter.sql
```

### Passo 2: Verifica Sistema Upload

1. **Avvia il backend:**
   ```bash
   node server.js
   # oppure
   ./start-backend.sh
   ```

2. **Test upload documenti:**
   - Dashboard → Gestione Documenti → Upload
   - Verifica che i file vadano in `files/archivio/`

3. **Test upload allegati:**
   - Call di Idee → Upload allegati
   - Verifica che i file vadano in `files/allegati/`

### Passo 3: Test Call di Idee

1. Vai su `/presenta-progetto`
2. Compila il form completamente
3. Aggiungi allegati
4. Invia candidatura
5. Verifica in dashboard → "Richieste Call Idee"

## 📝 Struttura Finale

```
files/
├── archivio/          # Documenti ufficiali (Dashboard)
│   ├── documento1.pdf
│   └── documento2.docx
└── allegati/          # Allegati Call Idee
    ├── progetto1.pdf
    └── progetto2.pdf

components/
├── DocumentUploader.tsx    # Per archivio (Dashboard)
└── FileUploader.tsx       # Per allegati (Call Idee)
```

## 🔧 Campi Tabella call_idee_giovani

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | UUID | ✅ | Chiave primaria |
| `created_at` | TIMESTAMP | ✅ | Data creazione |
| `titolo_progetto` | VARCHAR(255) | ✅ | Titolo del progetto |
| `descrizione_progetto` | TEXT | ✅ | Descrizione dettagliata |
| `coprogramma` | JSONB | ❌ | Array coprogrammi |
| `data_inizio` | DATE | ✅ | Data inizio progetto |
| `data_fine` | DATE | ✅ | Data fine progetto |
| `autorizzazioni` | TEXT | ❌ | Autorizzazioni necessarie |
| `referente_nome` | VARCHAR(100) | ✅ | Nome referente |
| `referente_cognome` | VARCHAR(100) | ✅ | Cognome referente |
| `referente_email` | VARCHAR(255) | ✅ | Email referente |
| `referente_telefono` | VARCHAR(50) | ✅ | Telefono referente |
| `referente_data_nascita` | DATE | ✅ | Data nascita referente |
| `referente_codice_fiscale` | VARCHAR(16) | ❌ | Codice fiscale referente |
| `numero_partecipanti` | VARCHAR(10) | ✅ | Range partecipanti |
| `descrizione_gruppo` | TEXT | ❌ | Descrizione del gruppo |
| `partecipanti` | JSONB | ✅ | Array partecipanti |
| `figure_supporto` | JSONB | ❌ | Array figure supporto |
| `luogo_svolgimento` | VARCHAR(255) | ✅ | Luogo evento |
| `categoria` | VARCHAR(100) | ✅ | Categoria progetto |
| `categoria_descrizione` | TEXT | ✅ | Descrizione categoria |
| `tipo_evento` | VARCHAR(100) | ✅ | Tipo di evento |
| `descrizione_evento` | TEXT | ✅ | Descrizione evento |
| `altro` | TEXT | ❌ | Note aggiuntive |
| `allegati` | JSONB | ❌ | Array file allegati |
| `spese_attrezzature` | JSONB | ❌ | Array spese attrezzature |
| `spese_servizi` | JSONB | ❌ | Array spese servizi |
| `spese_generali` | JSONB | ❌ | Oggetto spese generali |
| `valutazione` | JSONB | ❌ | Oggetto valutazione |

## ⚠️ Note Importanti

1. **Backup Database:** Fai sempre un backup prima di eseguire gli script SQL
2. **Test Locale:** Testa tutto in ambiente di sviluppo prima di andare in produzione
3. **Permessi File:** Assicurati che le directory `files/` abbiano i permessi corretti
4. **Supabase RLS:** Se usi Row Level Security, configura le policy per la tabella
5. **CORS:** Verifica che il backend sia accessibile dal frontend

## 🆘 Risoluzione Problemi

### ❌ "Nessun file caricato"
- Verifica che il server backend sia avviato
- Controlla i permessi delle directory `files/`

### ❌ "Table doesn't exist"
- Esegui lo script SQL appropriato in Supabase
- Verifica la connessione al database

### ❌ "Upload failed"
- Controlla i log del server
- Verifica dimensione file (max 10MB)
- Controlla formato file (PDF, DOC, DOCX)

### ❌ "Insert failed"
- Verifica che tutti i campi obbligatori siano compilati
- Controlla la struttura della tabella con gli script forniti

## 📧 Per Supporto

Se riscontri problemi, fornisci:
1. Messaggio di errore completo
2. Log del server backend
3. Struttura attuale della tabella (query: `\d call_idee_giovani`)
