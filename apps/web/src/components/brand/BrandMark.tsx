import Image from "next/image";
import Link from "next/link";

/** Official app mark — 3D chef hat asset */
export function BrandMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand-chef.png"
      alt="سرآشپز هوشمند"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}

export function BrandLockup({
  href = "/home",
  subtitle,
}: {
  href?: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <BrandMark size={44} />
      <div className="leading-tight">
        <p className="text-body font-bold text-atlas-ink">سرآشپز هوشمند</p>
        {subtitle ? (
          <p className="text-caption text-atlas-ink-muted">{subtitle}</p>
        ) : (
          <p className="text-caption text-atlas-ink-faint">با آنچه دارید بپزید</p>
        )}
      </div>
    </Link>
  );
}
