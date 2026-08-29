export default function StatCard({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string | number;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={
        tone === "dark"
          ? "border border-navy-950 bg-navy-950 p-5 text-cream-100"
          : "border border-line bg-surface p-5"
      }
    >
      <p
        className={`text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ${
          tone === "dark" ? "text-cream-100/60" : "text-ink-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-3 font-display text-2xl ${
          tone === "dark" ? "text-cream-100" : "text-navy-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
