import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { initialsAvatar } from '../../utils/images';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  fallback?: string;
  name: string;
}

/** Tries the local image, then the remote fallback, then an initials avatar. */
export default function SmartImage({ src, fallback, name, alt, ...rest }: Props) {
  const sources = [src, fallback, initialsAvatar(name)].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [src, fallback]);
  return (
    <img
      {...rest}
      src={sources[Math.min(idx, sources.length - 1)]}
      alt={alt ?? name}
      onError={() => setIdx((i) => Math.min(i + 1, sources.length - 1))}
      loading={rest.loading ?? 'lazy'}
    />
  );
}
