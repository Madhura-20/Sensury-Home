export async function compressImageFile(file: File, maxBytes = 280000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.78;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > maxBytes && quality > 0.3) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > maxBytes) {
          reject(new Error('Compressed image still exceeds storage limit. Please choose a smaller photo.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function readSmallDocumentFile(file: File, maxBytes = 380000): Promise<string> {
  if (file.type.startsWith('image/')) {
    return compressImageFile(file, maxBytes);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read document file.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (dataUrl.length > maxBytes) {
        reject(new Error('File attachment exceeds 380 KB storage limit. Store large PDFs externally and attach a summary or compressed scan here.'));
        return;
      }
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}
