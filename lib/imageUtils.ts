export const getOptimizedImageUrl = (url: string, width?: number) => {
  if (!url || !url.includes('cloudinary')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transformations = ['f_auto', 'q_auto'];
  if (width) transformations.push(`w_${width}`);
  
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

export const getBlurDataUrl = (url: string) => {
  if (!url || !url.includes('cloudinary')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  // Very small, blurry version
  return `${parts[0]}/upload/f_auto,q_auto,w_40,e_blur:1000/${parts[1]}`;
};
