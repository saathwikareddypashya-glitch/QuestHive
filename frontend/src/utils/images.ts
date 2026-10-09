import { initials } from './formatters';

const palette = [
  ['#E3EDE4', '#3F5A43'],
  ['#FBE7DA', '#9A5B3C'],
  ['#ECE8F6', '#5A4C8C'],
  ['#E3EDF5', '#45627F'],
  ['#F6EBD9', '#87652A'],
];

/** Initials avatar as an SVG data URL — the final fallback when photos can't load. */
export function initialsAvatar(name: string) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  const [bg, fg] = palette[idx];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="140" font-weight="600" fill="${fg}">${initials(name)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** A simple generated certificate image used as demo verification proof. */
export function demoCertificate(name: string, title: string, issuer: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560"><rect width="800" height="560" fill="#FFFDF8"/><rect x="24" y="24" width="752" height="512" fill="none" stroke="#A8C3A8" stroke-width="6"/><rect x="40" y="40" width="720" height="480" fill="none" stroke="#E8E1D6" stroke-width="2"/><text x="400" y="130" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#2B2A28">Certificate of Completion</text><text x="400" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#7A756C">This certifies that</text><text x="400" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#5E7F62">${name}</text><text x="400" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#7A756C">has successfully completed</text><text x="400" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#2B2A28">${title}</text><text x="400" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#7A756C">${issuer}</text><circle cx="680" cy="440" r="40" fill="#E3EDE4" stroke="#5E7F62" stroke-width="3"/><text x="680" y="447" text-anchor="middle" font-family="Arial" font-size="18" fill="#5E7F62">✓</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Read an uploaded file. Images are downscaled so they fit in localStorage. */
export function fileToDataUrl(file: File, maxSize = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const result = reader.result as string;
      if (!file.type.startsWith('image/')) return resolve(result.length < 900_000 ? result : '');
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
