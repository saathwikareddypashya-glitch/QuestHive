import SmartImage from './SmartImage';

export default function Avatar({ src, fallback, name, size = 40 }: { src?: string; fallback?: string; name: string; size?: number }) {
  return (
    <SmartImage
      className="avatar"
      src={src}
      fallback={fallback}
      name={name}
      alt=""
      style={{ width: size, height: size }}
    />
  );
}
