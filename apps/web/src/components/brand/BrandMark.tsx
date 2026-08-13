import Image from "next/image";
import Link from "next/link";

/** Cute 3D chef avatar for app bar / profile entry */
export function BrandMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/avatars/chef-cute-3d.png"
      alt="سرآشپز هوشمند"
      width={size}
      height={size}
      className={`rounded-full object-cover object-top ${className}`}
      priority
      unoptimized
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
