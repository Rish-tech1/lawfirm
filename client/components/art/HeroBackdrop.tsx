/**
 * Hero backdrop — a colonnade with the scales of justice.
 *
 * Inlined as JSX rather than loaded through `next/image` from `/public`.
 * As a fetched asset it was the Largest Contentful Paint element and cost an
 * extra network round trip after HTML and CSS; inline it paints with the
 * document. At ~3 kB it costs less in markup than the request cost in latency.
 *
 * `preserveAspectRatio="xMidYMid slice"` reproduces `object-fit: cover`.
 *
 * Replace this component with a `next/image` when real photography is
 * available — at that point the asset is worth a request and should be
 * `priority` + `fetchPriority="high"`.
 */
export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 h-full w-full transform-gpu motion-safe:animate-slow-zoom pointer-events-none">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.55]"
        aria-hidden="true"
        focusable="false"
      >
      <defs>
        <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1c1c" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="hb-col" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2e2b25" />
          <stop offset="0.45" stopColor="#4a4438" />
          <stop offset="1" stopColor="#241f19" />
        </linearGradient>
        <linearGradient id="hb-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#211d17" />
          <stop offset="1" stopColor="#0c0b09" />
        </linearGradient>
        <radialGradient id="hb-glow" cx="0.5" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#C8A75B" stopOpacity="0.3" />
          <stop offset="1" stopColor="#C8A75B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#hb-sky)" />

      {/* Light spilling from the far end of the colonnade */}
      <ellipse cx="800" cy="380" rx="520" ry="360" fill="url(#hb-glow)" />

      {/* Rear wall with a tall arched opening */}
      <rect x="560" y="180" width="480" height="500" fill="#171512" />
      <path d="M640 680V360a160 160 0 0 1 320 0v320z" fill="#100f0d" />
      <path
        d="M640 680V360a160 160 0 0 1 320 0v320"
        fill="none"
        stroke="#C8A75B"
        strokeOpacity="0.22"
        strokeWidth="3"
      />

      {/* Colonnade, receding in symmetrical pairs */}
      <g fill="url(#hb-col)">
        <rect x="60" y="120" width="118" height="560" />
        <rect x="1422" y="120" width="118" height="560" />
        <rect x="248" y="160" width="96" height="520" />
        <rect x="1256" y="160" width="96" height="520" />
        <rect x="406" y="196" width="76" height="484" />
        <rect x="1118" y="196" width="76" height="484" />
      </g>
      <g fill="#3d3729">
        <rect x="52" y="96" width="134" height="26" />
        <rect x="1414" y="96" width="134" height="26" />
        <rect x="240" y="140" width="112" height="22" />
        <rect x="1248" y="140" width="112" height="22" />
        <rect x="400" y="178" width="88" height="20" />
        <rect x="1112" y="178" width="88" height="20" />
        <rect x="52" y="680" width="134" height="22" />
        <rect x="1414" y="680" width="134" height="22" />
        <rect x="240" y="680" width="112" height="20" />
        <rect x="1248" y="680" width="112" height="20" />
        <rect x="400" y="680" width="88" height="18" />
        <rect x="1112" y="680" width="88" height="18" />
      </g>

      {/* Coffered ceiling */}
      <rect y="60" width="1600" height="38" fill="#191713" />
      <rect width="1600" height="44" fill="#121110" />
      <g stroke="#C8A75B" strokeOpacity="0.1" strokeWidth="2">
        <path d="M0 98h1600" />
        <path d="M0 44h1600" />
      </g>

      {/* Floor with reflected column bases */}
      <rect y="680" width="1600" height="220" fill="url(#hb-floor)" />
      <g fill="#C8A75B" fillOpacity="0.05">
        <rect x="60" y="702" width="118" height="120" />
        <rect x="248" y="700" width="96" height="96" />
        <rect x="406" y="698" width="76" height="76" />
        <rect x="1118" y="698" width="76" height="76" />
        <rect x="1256" y="700" width="96" height="96" />
        <rect x="1422" y="702" width="118" height="120" />
      </g>
      <path d="M0 690h1600" stroke="#C8A75B" strokeOpacity="0.16" strokeWidth="2" />

      {/* Scales of justice, silhouetted in the arch */}
      <g
        transform="translate(800 400) scale(1.9)"
        fill="none"
        stroke="#C8A75B"
        strokeOpacity="0.5"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M0-52V52" />
        <path d="M-40-38h80" />
        <path d="M-40-38l-17 31h34z" />
        <path d="M40-38l-17 31h34z" />
        <path d="M-22 52h44" />
      </g>

      {/* Vignette, so overlaid text keeps contrast at the edges */}
      <rect width="1600" height="240" fill="#0a0a0a" opacity="0.55" />
      <rect y="660" width="1600" height="240" fill="#0a0a0a" opacity="0.45" />
    </svg>
    </div>
  );
}
