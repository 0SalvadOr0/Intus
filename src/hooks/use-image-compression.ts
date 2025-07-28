import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  fileType?: string;
}

interface CompressionResult {
  compressedFile: File;
  originalSize: string;
  compressedSize: string;
  savings: string;
}

export const useImageCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string>("");

  const compressImage = async (
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    const defaultOptions = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      quality: 0.85,
      ...options
    };

    setIsCompressing(true);
    setCompressionProgress("Analisi immagine...");

    try {
      const compressedFile = await imageCompression(file, {
        ...defaultOptions,
        onProgress: (progress) => {
          setCompressionProgress(`Compressione: ${Math.round(progress)}%`);
        }
      });

      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

      setCompressionProgress(`Completata: ${originalSize}MB → ${compressedSize}MB`);

      return {
        compressedFile,
        originalSize,
        compressedSize,
        savings
      };
    } catch (error) {
      setCompressionProgress("Errore durante la compressione");
      throw error;
    } finally {
      setIsCompressing(false);
    }
  };

  const getOptimalSettings = (file: File) => {
    const fileSizeMB = file.size / 1024 / 1024;
    
    // Impostazioni adattive basate sulla dimensione
    if (fileSizeMB > 10) {
      return {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        quality: 0.8
      };
    } else if (fileSizeMB > 5) {
      return {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        quality: 0.85
      };
    } else {
      return {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 2048,
        quality: 0.9
      };
    }
  };

  return {
    compressImage,
    getOptimalSettings,
    isCompressing,
    compressionProgress
  };
};
