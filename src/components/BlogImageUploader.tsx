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
    setCompressionStatus("");

    try {
      // Comprimi l'immagine
      const compressedFile = await compressImage(file);

      // Crea nome file con timestamp
      const fileExtension = compressedFile.type === 'image/jpeg' ? 'jpg' : 'png';
      const fileName = file.name.split('.')[0];
      const filePath = `${Date.now()}-${fileName}.${fileExtension}`;

      setCompressionStatus("Upload in corso...");

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type,
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
        setCompressionStatus("Upload completato!");
      } else {
        setError("Errore nel recupero URL pubblico");
      }
    } catch (error) {
      setError("Errore durante l'elaborazione: " + (error as Error).message);
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm"
        />
        <div className="text-xs text-muted-foreground">
          Le immagini saranno automaticamente compresse per ottimizzare lo spazio di storage
        </div>
      </div>

      {compressionStatus && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          {compressionStatus}
        </div>
      )}

      {uploading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Elaborazione in corso...
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default BlogImageUploader;
