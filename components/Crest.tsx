export default function Crest({ id = 'crest', className = 'brand-mark' }: { id?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="GDC Zaim crest">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#157954" />
          <stop offset="1" stopColor="#0a3b2a" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 57 12v22c0 14-11 24-25 27C18 58 7 48 7 34V12L32 3Z"
        fill={`url(#${id})`}
        stroke="#c8a24a"
        strokeWidth="2.5"
      />
      <path d="M20 40V27l12-7 12 7v13" fill="none" stroke="#c8a24a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 43h34" stroke="#c8a24a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 40V31h12v9" fill="none" stroke="#e6d19a" strokeWidth="2" />
      <circle cx="32" cy="17" r="2.6" fill="#c8a24a" />
    </svg>
  );
}
