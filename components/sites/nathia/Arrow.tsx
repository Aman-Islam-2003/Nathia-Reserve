/** The arrow in live's buttons and links [Arrow: 18 × 10 path; `dir="down"` rotates it 90°]. Size per use. */
export function Arrow({ className, dir = "right" }: { className: string; dir?: "right" | "down" }) {
  return (
    <svg aria-hidden viewBox="0 0 18 10" fill="none" className={className} style={dir === "down" ? { transform: "rotate(90deg)" } : undefined}>
      <path d="M0 5h16.5M12.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
