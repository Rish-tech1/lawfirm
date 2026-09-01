interface JsonLdProps {
  /** One schema object, or several to emit as a graph of separate tags. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders JSON-LD structured data.
 *
 * `</script>` inside a string value would otherwise close this tag early and
 * open an XSS hole, so `<` is escaped. All content here is authored in-repo, but
 * the escape costs nothing and removes the footgun for future edits.
 */
export function JsonLd({ data }: JsonLdProps) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
