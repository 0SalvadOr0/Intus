import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface BlogImageUploaderProps {
  onUpload: (url: string) => void;
}

const BlogImageUploader = ({ onUpload }: BlogImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const filePath = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);
    if (uploadError) {
      setError("Errore upload: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(filePath);
    if (data?.publicUrl) {
      onUpload(data.publicUrl);
    } else {
      setError("Errore nel recupero URL pubblico");
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
