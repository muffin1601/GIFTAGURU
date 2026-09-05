import { jsonLdScript } from "@/lib/seo/schema";

/** Server Component only -- dangerouslySetInnerHTML here renders build-time/
 * request-time JSON we constructed ourselves (jsonLdScript escapes `<`), not
 * arbitrary user input, so this is the standard, safe way to emit JSON-LD. */
export default function JsonLd({
  data,
}: {
  /** Nulls are allowed and dropped, so callers can pass a builder that
   * declines to emit a node (e.g. faqPageSchema with no FAQs) without each
   * page having to filter the array itself. */
  data: Record<string, unknown> | null | (Record<string, unknown> | null)[];
}) {
  if (data === null) return null;

  const graph = Array.isArray(data)
    ? data.filter((node): node is Record<string, unknown> => node !== null)
    : data;

  if (Array.isArray(graph) && graph.length === 0) return null;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
  );
}
