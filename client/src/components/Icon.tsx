import Image from "next/image";

export default function Icon({
  src,
  alt,
  color,
}: {
  src: any;
  alt: string;
  color?: string;
}) {
  return (
    <Image
      src={src}
      width={24}
      height={24}
      style={{ fill: color }}
      className="dark:invert"
      alt={alt}
    />
  );
}
