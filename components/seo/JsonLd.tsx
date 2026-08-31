import { jsonLdScript } from "@/lib/seo/schema";

/** Server Component only -- dangerouslySetInnerHTML here renders build-time/
 * request-time JSON we constructed ourselves (jsonLdScript escapes `<`), not
 * arbitrary user input, so this is the standard, safe way to emit JSON-LD. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />
  );
}
