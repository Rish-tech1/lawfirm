import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

/**
 * Dynamic Open Graph / Twitter card image, generated at build time.
 *
 * Building the card here rather than shipping a static PNG keeps it in sync
 * with the firm's name and tagline automatically, and avoids committing a large
 * binary. Inherited by every route that does not define its own.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  /**
   * The card is drawn on ink, so it takes the light-ink variant of the emblem.
   * Inlined as a data URI because the renderer has no origin to resolve a
   * site-relative path against at build time.
   */
  const emblem = await readFile(join(process.cwd(), 'public/images/logo-mark-light.png'));
  const emblemSrc = `data:image/png;base64,${emblem.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#111111',
          padding: '72px',
          position: 'relative',
        }}
      >
        {/* Gold hairline frame */}
        <div
          style={{
            position: 'absolute',
            inset: '28px',
            border: '1px solid rgba(200,167,91,0.35)',
          }}
        />

        {/* Top-left corner accent */}
        <div
          style={{
            position: 'absolute',
            left: '28px',
            top: '28px',
            width: '120px',
            height: '120px',
            borderLeft: '3px solid #C8A75B',
            borderTop: '3px solid #C8A75B',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={emblemSrc} width={66} height={76} alt="" />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#ffffff', fontSize: '30px', letterSpacing: '-0.5px' }}>
              Singla &amp; Singla
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '15px',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}
            >
              Law Firm
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: '82px',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Justice. Integrity.</span>
            <span style={{ color: '#C8A75B' }}>Excellence.</span>
          </div>

          <div
            style={{
              width: '90px',
              height: '3px',
              background: '#C8A75B',
              marginTop: '36px',
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '20px',
          }}
        >
          <span>
            {site.address.city} · Est. {site.foundingYear}
          </span>
          <span style={{ color: '#C8A75B' }}>{site.phone.primary}</span>
        </div>
      </div>
    ),
    size,
  );
}
