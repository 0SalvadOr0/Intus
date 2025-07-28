import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useImageCompression } from "@/hooks/use-image-compression";

interface BlogImageUploaderProps {
  onUpload: (url: string) => void;
}

const BlogImageUploader = ({ onUpload }: BlogImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const { compressImage, getOptimalSettings, isCompressing, compressionProgress } = useImageCompression();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadStatus("");

    try {
      // Ottieni impostazioni ottimali per il file
      const settings = getOptimalSettings(file);

      // Comprimi l'immagine
      const result = await compressImage(file, settings);

      // Crea nome file con timestamp
      const fileExtension = result.compressedFile.type === 'image/jpeg' ? 'jpg' : 'png';
      const fileName = file.name.split('.')[0];
      const filePath = `${Date.now()}-${fileName}.${fileExtension}`;

      setUploadStatus("Upload in corso...");

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, result.compressedFile, {
          contentType: result.compressedFile.type,
          cacheControl: '3600'
        });

      if (uploadError) {
        setError("Errore upload: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("blog-images").getPublicUrl(filePath);
      if (data?.publicUrl) {
        onUpload(data.publicUrl);
        setUploadStatus(`✅ Upload completato! Risparmio: ${result.savings}%`);
      } else {
        setError("Errore nel recupero URL pubblico");
      }
    } catch (error) {
      setError("Errore durante l'elaborazione: " + (error as Error).message);
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || isCompressing}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
        <div className="text-xs text-muted-foreground">
          ✨ Compressione automatica per ottimizzare lo spazio storage (max 800KB)
        </div>
      </div>

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
    </div>
  );
};

export default BlogImageUploader;
