/** Simple cooking-pot mark for cook CTA */
export function PotIcon({
  size = 20,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10.5h16v6.2c0 1.8-1.5 3.3-3.3 3.3H7.3C5.5 20 4 18.5 4 16.7v-6.2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 10.5h19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 10.5V8.2c0-.9.7-1.7 1.7-1.7h4.6c.9 0 1.7.8 1.7 1.7v2.3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.2 4.8v1.2M12 4.2v1.8M14.8 4.8v1.2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
