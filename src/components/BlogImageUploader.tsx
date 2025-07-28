import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import imageCompression from 'browser-image-compression';

interface BlogImageUploaderProps {
  onUpload: (url: string) => void;
}

const BlogImageUploader = ({ onUpload }: BlogImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionStatus, setCompressionStatus] = useState<string>("");

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.8, // Massimo 800KB
      maxWidthOrHeight: 1920, // Massimo 1920px
      useWebWorker: true,
      fileType: 'image/jpeg', // Converte tutto in JPEG per migliore compressione
      quality: 0.85 // Qualità 85%
    };

    try {
      setCompressionStatus("Compressione in corso...");
      const compressedFile = await imageCompression(file, options);

      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

      setCompressionStatus(`Compressa: ${originalSize}MB → ${compressedSize}MB (${savings}% riduzione)`);

      return compressedFile;
    } catch (error) {
      console.error('Errore compressione:', error);
      setCompressionStatus("Errore compressione, uso file originale");
      return file;
    }
  };

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
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span className="text-xs text-muted-foreground">Caricamento...</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

export default BlogImageUploader;
