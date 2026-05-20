export default function NoImagePlaceholder() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 text-slate-300">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="txt-6 text-slate-300">Sin foto</span>
    </div>
  )
}
