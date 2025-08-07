import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Upload, File, X, FileText, FileImage } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (url: string, fileName: string) => void;
  onFileRemove?: (url: string) => void;
  uploadedFiles?: Array<{ url: string; name: string }>;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

const FileUploader = ({
  onFileUpload,
  onFileRemove,
  uploadedFiles = [],
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  maxFileSize = 10
}: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const isValidFileType = (fileName: string) => {
    const extension = '.' + fileName.toLowerCase().split('.').pop();
    return acceptedTypes.includes(extension);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedFiles.length >= maxFiles) {
      toast({
        title: "Limite raggiunto",
        description: `Puoi caricare massimo ${maxFiles} file.`,
        variant: "destructive"
      });
      return;
    }

    const file = files[0];

    // Validate file type
    if (!isValidFileType(file.name)) {
      toast({
        title: "Tipo di file non supportato",
        description: `Sono accettati solo file: ${acceptedTypes.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      toast({
        title: "File troppo grande",
        description: `Il file deve essere inferiore a ${maxFileSize} MB. Dimensione attuale: ${formatFileSize(file.size)}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      
      // Upload to Supabase Storage in the allegati folder
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`allegati/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (error) {
        console.error('Errore upload file:', JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          error: error.error,
          statusCode: error.statusCode,
          details: error
        });

        let errorMessage = "Si è verificato un errore durante il caricamento del file.";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        toast({
          title: "Errore nel caricamento",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(`allegati/${fileName}`);

      if (urlData?.publicUrl) {
        onFileUpload(urlData.publicUrl, file.name);
        toast({
          title: "File caricato!",
          description: `${file.name} è stato caricato con successo.`
        });
      }

    } catch (error) {
      console.error('Errore generico upload:', error);
      console.error('Catch error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });

      const errorMessage = error instanceof Error ? error.message : "Si è verificato un errore durante il caricamento del file.";

      toast({
        title: "Errore nel caricamento",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileUrl: string) => {
    if (onFileRemove) {
      onFileRemove(fileUrl);
      toast({
        title: "File rimosso",
        description: "Il file è stato rimosso dalla lista."
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || uploadedFiles.length >= maxFiles}
        />
        
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Carica allegati</p>
            <p className="text-xs text-muted-foreground">
              Tipi supportati: {acceptedTypes.join(', ')} | Max {maxFileSize} MB per file
            </p>
            <p className="text-xs text-muted-foreground">
              File caricati: {uploadedFiles.length}/{maxFiles}
            </p>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Caricamento... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || uploadedFiles.length >= maxFiles}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadedFiles.length >= maxFiles ? "Limite raggiunto" : "Seleziona file"}
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">File caricati:</p>
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
                      Visualizza file
                    </a>
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

export default FileUploader;
