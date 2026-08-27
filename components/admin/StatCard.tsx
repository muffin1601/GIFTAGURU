export default function StatCard({ label, value, tone = "light" }: { label: string; value: string | number; tone?: "light" | "dark" }) {
  return (
    <div className={`rounded-lg p-5 ring-1 ring-navy-950/5 ${tone === "dark" ? "bg-navy-950 text-cream-100" : "bg-white text-navy-950"}`}>
      <p className={`text-sm ${tone === "dark" ? "text-cream-100/70" : "text-ink-600"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
