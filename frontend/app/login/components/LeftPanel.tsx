import Logo from '../../components/Logo'

export default function LeftPanel() {
  return (
    <div className="relative isolate text-white flex flex-col
      px-6 pt-8 pb-12 flex-1
      md:px-12 md:py-10 md:min-h-0
      overflow-hidden"
    >
      {/* Ken Burns background */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center animate-[ken-burns_25s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: "url('/uabc.png')" }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70 -z-10" />

      <header className="mb-auto animate-fade-in animate-duration-800">
        <Logo white />
      </header>

      <div className="mb-auto md:mb-0 md:flex md:flex-1 md:items-center">
        <div className="flex flex-col gap-2 md:gap-3">
          <h1 className="txt-1 font-bold leading-tight">
            <span className="inline-block animate-fade-in-up animate-duration-700 animate-delay-200">
              El marketplace de los{' '}
            </span>
            <span className="inline-block animate-fade-in-up animate-duration-700 animate-delay-400">
              <span className="text-shimmer decoration-green-400/50 underline underline-offset-8 decoration-2">
                Cimarrones
              </span>
            </span>
          </h1>
          <p className="txt-base text-white/70 max-w-sm animate-fade-in-up animate-duration-700 animate-delay-600">
            Compra y vende entre estudiantes UABC.
          </p>
        </div>
      </div>

      {/* Stats — desktop only */}
      <footer className="hidden md:flex items-center gap-8 animate-fade-in-up animate-duration-700 animate-delay-800">
        <div className="flex-1 text-center">
          <p className="txt-2 font-extrabold tracking-tight leading-none">6+</p>
          <p className="txt-6 text-white/60 mt-1">categorías</p>
        </div>
        <div className="h-8 w-px bg-white/15 shrink-0" />
        <div className="flex-1 text-center">
          <p className="txt-2 font-extrabold tracking-tight leading-none">12</p>
          <p className="txt-6 text-white/60 mt-1">campus</p>
        </div>
        <div className="h-8 w-px bg-white/15 shrink-0" />
        <div className="flex-1 text-center">
          <p className="txt-2 font-extrabold tracking-tight leading-none">100%</p>
          <p className="txt-6 text-white/60 mt-1">verificado UABC</p>
        </div>
      </footer>
    </div>
  )
}
