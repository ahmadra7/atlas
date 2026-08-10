import Image from "next/image";

const FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

export function RecipeImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-zinc-200 ${className}`}>
      <Image
        src={src || FALLBACK}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
    </div>
  );
}
