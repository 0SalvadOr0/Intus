// 🔐 Secure API Client - client.ts
// Centralized TypeScript API management for all file operations

// 📋 Type Definitions
interface APIConfig {
  baseURL: string;
  apiKey?: string;
  maxFileSize: number;
  allowedTypes: string[];
  uploadTimeout: number;
}

interface RateLimiter {
  uploadCount: number;
  lastReset: number;
  maxUploads: number;
  windowMs: number;
}

interface DocumentMetadata {
  name?: string;
  description?: string;
  category?: string;
}

interface APIDocument {
  id: string;
  originalName?: string;
  name?: string;
  description?: string;
  category?: string;
  uploadDate: string | Date;
  size: string;
  type?: string;
  mimeType?: string;
  url?: string;
  downloadUrl?: string;
  _id?: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  documents?: APIDocument[];
  fileName?: string;
  error?: string;
  message?: string;
}

interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  error?: string;
  timestamp: string;
}

interface RateLimitStatus {
  uploadsUsed: number;
  uploadsRemaining: number;
  resetTime: Date;
  timeRemainingMs: number;
}

// 🏗️ Main API Client Class
class SecureAPIClient {
  private config: APIConfig;
  private rateLimiter: RateLimiter;

  constructor() {
    // 📊 Environment Configuration
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://217.160.124.10:3001',
      apiKey: import.meta.env.VITE_UPLOAD_API_KEY,
      maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
      allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || '').split(',').filter(Boolean),
      uploadTimeout: parseInt(import.meta.env.VITE_UPLOAD_TIMEOUT) || 30000
    };

    // 🚦 Rate Limiting Tracker
    this.rateLimiter = {
      uploadCount: 0,
      lastReset: Date.now(),
      maxUploads: 10,
      windowMs: 15 * 60 * 1000 // 15 minutes
    };

    // 🔍 Configuration Validation
    this._validateConfig();
  }

  // ✅ Configuration Validation
  private _validateConfig(): void {
    if (!this.config.apiKey) {
      console.warn('⚠️ VITE_UPLOAD_API_KEY not found - API calls will fail');
    }
    console.log('🔧 SecureAPIClient initialized:', {
      baseURL: this.config.baseURL,
      hasApiKey: !!this.config.apiKey,
      maxFileSize: `${(this.config.maxFileSize / 1024 / 1024).toFixed(1)}MB`
    });
  }

  // 🔒 Authentication Headers
  private _getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    
    return headers;
  }

  // 🚦 Rate Limiting Check
  private _checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if window expired
    if (now - this.rateLimiter.lastReset > this.rateLimiter.windowMs) {
      this.rateLimiter.uploadCount = 0;
      this.rateLimiter.lastReset = now;
    }

    if (this.rateLimiter.uploadCount >= this.rateLimiter.maxUploads) {
      const resetTime = new Date(this.rateLimiter.lastReset + this.rateLimiter.windowMs);
      throw new Error(`🚦 Limite upload raggiunto. Riprova alle ${resetTime.toLocaleTimeString()}`);
    }

    return true;
  }

  // 🧪 File Validation
  private _validateFile(file: File): boolean {
    const validationErrors: string[] = [];

    // Size validation
    if (file.size > this.config.maxFileSize) {
      validationErrors.push(`File troppo grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (max ${(this.config.maxFileSize / 1024 / 1024).toFixed(1)}MB)`);
    }

    // Type validation
    if (this.config.allowedTypes.length > 0 && !this.config.allowedTypes.includes(file.type)) {
      validationErrors.push(`Tipo file non supportato: ${file.type}`);
    }

    // Extension validation
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.toLowerCase().split('.').pop();
    if (fileExt && !allowedExtensions.includes(`.${fileExt}`)) {
      validationErrors.push(`Estensione non valida: .${fileExt}`);
    }

    // Name validation
    if (file.name.length > 255) {
      validationErrors.push('Nome file troppo lungo (max 255 caratteri)');
    }

    if (validationErrors.length > 0) {
      throw new Error(`❌ Validazione file fallita:\n• ${validationErrors.join('\n• ')}`);
    }

    return true;
  }

  // 🧹 Input Sanitization
  private _sanitizeInput(input: string, maxLength: number = 500): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, maxLength);
  }

  // 🌐 Base Fetch Method with Error Handling
  private async _secureRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this._getAuthHeaders(),
        ...(options.headers || {})
      },
      signal: AbortSignal.timeout(this.config.uploadTimeout)
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Use default error message if JSON parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const result: APIResponse<T> = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      
      return result;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('⏱️ Timeout: Richiesta troppo lenta');
        }
        if (error.name === 'AbortError') {
          throw new Error('🚫 Richiesta annullata');
        }
      }
      
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // 📤 Upload Document Method
  async uploadDocument(file: File, metadata: DocumentMetadata = {}): Promise<APIResponse> {
    try {
      // 🚦 Pre-flight checks
      this._checkRateLimit();
      this._validateFile(file);

      // 📋 Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // 🧹 Sanitize and append metadata
      if (metadata.name) {
        formData.append('name', this._sanitizeInput(metadata.name, 100));
      }
      if (metadata.description) {
        formData.append('description', this._sanitizeInput(metadata.description, 500));
      }
      if (metadata.category) {
        formData.append('category', this._sanitizeInput(metadata.category, 50));
      }

      // 🌐 Execute upload
      const result = await this._secureRequest('/api/upload-documento', {
        method: 'POST',
        body: formData
      });

      // 📊 Update rate limiter on success
      if (result.success) {
        this.rateLimiter.uploadCount++;
        console.log(`📄 Document uploaded: ${result.fileName} (${this.rateLimiter.uploadCount}/10)`);
      }

      return result;

    } catch (error) {
      console.error('❌ Document upload failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  // 📎 Upload Allegato Method
  async uploadAllegato(file: File): Promise<APIResponse> {
    try {
      this._checkRateLimit();
      this._validateFile(file);

      const formData = new FormData();
      formData.append('file', file);

      const result = await this._secureRequest('/api/upload-allegato', {
        method: 'POST',
        body: formData
      });

      if (result.success) {
        this.rateLimiter.uploadCount++;
        console.log(`📎 Allegato uploaded: ${result.fileName} (${this.rateLimiter.uploadCount}/10)`);
      }

      return result;

    } catch (error) {
      console.error('❌ Allegato upload failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  // 📋 Get Documents Method
  async getDocuments(): Promise<APIDocument[]> {
    try {
      const result = await this._secureRequest<APIDocument[]>('/api/documents');
      return result.documents || [];

    } catch (error) {
      console.error('❌ Failed to fetch documents:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  // 📋 Get All Documents Method (Archivio + Allegati)
  async getAllDocuments(): Promise<APIDocument[]> {
    try {
      // Chiama l'endpoint corretto che esiste nel backend
      const result = await this._secureRequest<APIDocument[]>('/api/documents');
      return result.documents || [];

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to fetch all documents:', errorMessage);
      throw new Error(`Errore nel recupero dei documenti: ${errorMessage}`);
    }
  }

  // 🗑️ Delete Document Method
  async deleteDocument(source: string, filename: string): Promise<APIResponse> {
    try {
      // 🧹 Input sanitization
      const sanitizedSource = source.replace(/[^a-zA-Z]/g, '');
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
      
      if (!sanitizedSource || !sanitizedFilename) {
        throw new Error('Parametri eliminazione non validi');
      }

      const result = await this._secureRequest(
        `/api/documents/${sanitizedSource}/${sanitizedFilename}`,
        { method: 'DELETE' }
      );

      console.log(`🗑️ Document deleted: ${sanitizedSource}/${sanitizedFilename}`);
      return result;

    } catch (error) {
      console.error('❌ Failed to delete document:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  // 🔍 Health Check Method
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      // Health check doesn't require authentication
      const response = await fetch(`${this.config.baseURL}/api/health`);
      const result: HealthCheckResponse = await response.json();
      
      console.log('🔍 Server Health Check:', result.status);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Health check failed:', errorMessage);
      return { 
        status: 'ERROR', 
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📊 Get Rate Limit Status
  getRateLimitStatus(): RateLimitStatus {
    const now = Date.now();
    const timeRemaining = this.rateLimiter.windowMs - (now - this.rateLimiter.lastReset);
    const resetTime = new Date(this.rateLimiter.lastReset + this.rateLimiter.windowMs);
    
    return {
      uploadsUsed: this.rateLimiter.uploadCount,
      uploadsRemaining: this.rateLimiter.maxUploads - this.rateLimiter.uploadCount,
      resetTime: resetTime,
      timeRemainingMs: Math.max(0, timeRemaining)
    };
  }
}

// 🔄 Utility Helper Functions
const uploadHelpers = {
  // 📊 Format file size
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // 🎯 Get file type icon
  getFileIcon: (mimeType: string): string => {
    const iconMap: Record<string, string> = {
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝'
    };
    return iconMap[mimeType] || '📄';
  },

  // ⏰ Format upload date
  formatDate: (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// 🚀 Create and Export Singleton Instance
const apiClient = new SecureAPIClient();

// 📤 Export Main API Client and Helper Functions
export default apiClient;
export { SecureAPIClient, uploadHelpers };

// 📋 Export Types for External Use
export type { 
  APIConfig, 
  DocumentMetadata, 
  APIDocument, 
  APIResponse, 
  HealthCheckResponse, 
  RateLimitStatus 
};