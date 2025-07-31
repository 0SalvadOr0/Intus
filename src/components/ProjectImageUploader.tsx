import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useImageCompression } from "@/hooks/use-image-compression";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ProjectImageUploaderProps {
  onUpload: (url: string) => void;
  onRemove?: (url: string) => void;
  uploadedImages?: string[];
  maxImages?: number;
  className?: string;
}

const ProjectImageUploader = ({ 
  onUpload, 
  onRemove, 
  uploadedImages = [], 
  maxImages = 5,
  className 
}: ProjectImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const { compressImage, getOptimalSettings, isCompressing, compressionProgress } = useImageCompression();

  const canUploadMore = uploadedImages.length < maxImages;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Controlla il limite
    const remainingSlots = maxImages - uploadedImages.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(`Puoi caricare solo ${remainingSlots} immagini aggiuntive`);
      setTimeout(() => setError(null), 3000);
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of filesToUpload) {
        setUploadStatus(`Elaborando ${file.name}...`);
        
        // Ottieni impostazioni ottimali per il file
        const settings = getOptimalSettings(file);

        // Comprimi l'immagine
        const result = await compressImage(file, settings);

        // Crea nome file con timestamp e estensione corretta
        const fileExtension = result.compressedFile.type === 'image/jpeg' ? 'jpg' :
                             result.compressedFile.type === 'image/png' ? 'png' :
                             result.compressedFile.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = file.name.split('.')[0];
        const filePath = `${Date.now()}-${fileName}.${fileExtension}`;

        setUploadStatus(`Upload di ${file.name}...`);

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, result.compressedFile, {
            contentType: result.compressedFile.type,
            cacheControl: '3600'
          });

        if (uploadError) {
          setError(`Errore upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data } = supabase.storage.from("project-images").getPublicUrl(filePath);
        if (data?.publicUrl) {
          onUpload(data.publicUrl);
          setUploadStatus(`✅ ${file.name} caricato! Risparmio: ${result.savings}%`);
        } else {
          setError(`Errore nel recupero URL per ${file.name}`);
        }
      }
    } catch (error) {
      setError("Errore durante l'elaborazione: " + (error as Error).message);
    }

    setUploading(false);
    // Reset dell'input per permettere il ricaricamento dello stesso file
    e.target.value = '';
  };

  const handleRemove = (url: string) => {
    if (onRemove) {
      onRemove(url);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      {canUploadMore && (
        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading || isCompressing}
              className="hidden"
            />
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm">
                  <span className="text-primary font-medium">Clicca per caricare</span> o trascina le immagini qui
                </div>
                <div className="text-xs text-muted-foreground">
                  ✨ Compressione automatica (max 800KB per immagine)
                </div>
                <div className="text-xs text-muted-foreground">
                  {uploadedImages.length}/{maxImages} immagini caricate
                </div>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Progress indicators */}
      {(isCompressing || compressionProgress) && (
        <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          {compressionProgress}
        </div>
      )}

      {uploadStatus && (
        <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
          {uploadStatus}
        </div>
      )}

      {(uploading && !isCompressing) && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Upload in corso...
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-red-50 dark:bg-red-950 p-2 rounded">
          ❌ {error}
        </div>
      )}

      {/* Uploaded images preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Immagini caricate ({uploadedImages.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedImages.map((url, index) => (
              <div key={url} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`Immagine progetto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {onRemove && (
                  <button
                    onClick={() => handleRemove(url)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectImageUploader;
