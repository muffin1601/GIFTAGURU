import { cn } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("type-eyebrow", tone === "dark" && "text-gold-300")}>{eyebrow}</span>
      )}
      <h2 className={cn("type-h2", tone === "dark" && "text-cream-100")}>{title}</h2>
      {description && (
        <p className={cn("type-lead", tone === "dark" && "text-cream-100/70")}>{description}</p>
      )}
    </div>
  );
}
