import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X, FileText, FileImage, AlertTriangle, Clock } from "lucide-react";
import apiClient, { uploadHelpers } from '../utils/client.js';

interface DocumentUploaderProps {
  onFileUpload: (url: string, fileName: string) => void;
  onFileRemove?: (url: string) => void;
  uploadedFiles?: Array<{ url: string; name: string }>;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

const DocumentUploader = ({
  onFileUpload,
  onFileRemove,
  uploadedFiles = [],
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  maxFileSize = 10
}: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rateLimitStatus, setRateLimitStatus] = useState(apiClient.getRateLimitStatus());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 🎨 File Icon Helper
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileImage className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  // 🔍 File Type Validation
  const isValidFileType = (fileName: string) => {
    const extension = '.' + fileName.toLowerCase().split('.').pop();
    return acceptedTypes.includes(extension);
  };

  // 📏 File Size Helper (using uploadHelpers utility)
  const formatFileSize = uploadHelpers.formatFileSize;

  // 🔄 Update Rate Limit Status
  const updateRateLimitStatus = () => {
    setRateLimitStatus(apiClient.getRateLimitStatus());
  };

  // 📤 Main File Upload Handler
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('🚫 No files selected');
      return;
    }

    // 📊 File Limit Check
    if (uploadedFiles.length >= maxFiles) {
      toast({
        title: "🚫 Limite raggiunto",
        description: `Puoi caricare massimo ${maxFiles} file.`,
        variant: "destructive"
      });
      return;
    }

    const file = files[0];
    console.log('📄 File selected:', {
      name: file.name,
      size: uploadHelpers.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // ✅ Client-Side Validations
    try {
      // File type validation
      if (!isValidFileType(file.name)) {
        throw new Error(`❌ Tipo di file non supportato. Accettati: ${acceptedTypes.join(', ')}`);
      }

      // File size validation
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        throw new Error(`❌ File troppo grande (${formatFileSize(file.size)}). Limite: ${maxFileSize} MB`);
      }

      // Rate limit check
      const currentStatus = apiClient.getRateLimitStatus();
      if (currentStatus.uploadsRemaining <= 0) {
        throw new Error(`🚦 Limite upload raggiunto. Reset: ${currentStatus.resetTime.toLocaleTimeString()}`);
      }

    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Errore di validazione';
      toast({
        title: "Validazione fallita",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    // 🚀 Upload Process
    console.log('🚀 Starting secure document upload via apiClient...');
    setIsUploading(true);
    setUploadProgress(0);

    // 📈 Progress Animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // 📋 Prepare Upload Metadata
      const metadata = {
        name: file.name,
        description: 'Documento caricato dalla dashboard',
        category: 'Documenti Ufficiali'
      };

      console.log('📊 Upload metadata:', metadata);

      // 🔐 Secure Upload via API Client
      const result = await apiClient.uploadDocument(file, metadata);

      // ✅ Upload Success Handling
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Upload successful:', result);

      if (result.success) {
        // 🎯 Callback with file URL and name
        onFileUpload(result.fileUrl, result.originalName || file.name);
        
        // 📊 Update rate limit status
        updateRateLimitStatus();
        
        // 🎉 Success Toast
        toast({
          title: "📄 Documento caricato!",
          description: `${result.originalName || file.name} salvato in archivio/`,
        });

        console.log('🎯 File upload callback executed:', {
          fileUrl: result.fileUrl,
          fileName: result.originalName || file.name
        });
      } else {
        throw new Error(result.error || 'Upload failed without specific error');
      }

    } catch (uploadError) {
      // ❌ Error Handling
      clearInterval(progressInterval);
      console.error('❌ Secure upload failed:', uploadError);

      const errorMessage = uploadError instanceof Error 
        ? uploadError.message 
        : "Si è verificato un errore durante il caricamento del documento.";

      // 🚨 Error Toast with Details
      toast({
        title: "❌ Errore nel caricamento",
        description: errorMessage,
        variant: "destructive"
      });

      // 📊 Update rate limit even on error (in case partial rate limiting occurred)
      updateRateLimitStatus();

    } finally {
      // 🧹 Cleanup
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 🗑️ File Removal Handler
  const handleRemoveFile = (fileUrl: string) => {
    if (onFileRemove) {
      onFileRemove(fileUrl);
      toast({
        title: "🗑️ Documento rimosso",
        description: "Il documento è stato rimosso dalla lista."
      });
    }
  };

  // 📊 Rate Limit Display Component
  const RateLimitIndicator = () => {
    const { uploadsUsed, uploadsRemaining, resetTime } = rateLimitStatus;
    const isNearLimit = uploadsRemaining <= 2;
    const isAtLimit = uploadsRemaining <= 0;

    return (
      <div className={`text-xs p-2 rounded border ${
        isAtLimit ? 'bg-red-50 border-red-200 text-red-700' :
        isNearLimit ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
        'bg-green-50 border-green-200 text-green-700'
      }`}>
        <div className="flex items-center gap-1">
          {isAtLimit ? <AlertTriangle className="w-3 h-3" /> : 
           isNearLimit ? <Clock className="w-3 h-3" /> : 
           <Upload className="w-3 h-3" />}
          <span>
            Upload: {uploadsUsed}/10 utilizzati, {uploadsRemaining} rimanenti
          </span>
        </div>
        {isNearLimit && (
          <div className="text-xs mt-1">
            Reset: {resetTime.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 📊 Rate Limit Status */}
      <RateLimitIndicator />

      {/* 📤 Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || uploadedFiles.length >= maxFiles || rateLimitStatus.uploadsRemaining <= 0}
        />
        
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">🔐 Carica documenti sicuri nell'archivio</p>
            <p className="text-xs text-muted-foreground">
              Tipi supportati: {acceptedTypes.join(', ')} | Max {maxFileSize} MB per file
            </p>
            <p className="text-xs text-muted-foreground">
              Documenti caricati: {uploadedFiles.length}/{maxFiles}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              📁 Destinazione: files/archivio/ (autenticato)
            </p>
          </div>
          
          {/* 📈 Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                🔐 Caricamento sicuro... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          {/* 🎯 Upload Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              isUploading || 
              uploadedFiles.length >= maxFiles || 
              rateLimitStatus.uploadsRemaining <= 0
            }
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {rateLimitStatus.uploadsRemaining <= 0 ? "🚦 Limite raggiunto" :
             uploadedFiles.length >= maxFiles ? "📁 Limite file raggiunto" : 
             "🔐 Seleziona documento"}
          </Button>
        </div>
      </div>

      {/* 📋 Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">📄 Documenti caricati:</p>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      🔗 Visualizza documento
                    </a>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✅ Salvato in: files/archivio/ (sicuro)
                    </p>
                  </div>
                </div>
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.url)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;