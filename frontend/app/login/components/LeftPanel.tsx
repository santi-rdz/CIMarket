import { HiOutlineHeart, HiOutlineLockClosed, HiOutlineStar } from 'react-icons/hi'
import { HiOutlineShieldCheck } from 'react-icons/hi2'
import Logo from '../../components/Logo'
import FeatureItem from './FeatureItem'

const highlights = [
  'Pagos seguros entre estudiantes',
  'Verificación con correo institucional UABC',
  'Sistema de reputación y valoración entre usuarios',
  'Comunidad de confianza UABC',
]

const badges = [
  { Icon: HiOutlineHeart, description: 'CONFIANZA' },
  { Icon: HiOutlineShieldCheck, description: 'SEGURIDAD' },
  { Icon: HiOutlineLockClosed, description: 'PRIVACIDAD' },
]

export default function LeftPanel() {
  return (
    <div
      className="relative isolate text-white flex flex-col border-r border-white/10
        justify-start gap-12
        md:justify-between md:gap-0
        px-6 py-8 min-h-[58vh]
        md:px-12 md:py-6 md:min-h-0
        bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/uabc.png')" }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/85 via-black/70 to-black/85 -z-10" />

      <header>
        <Logo white />
      </header>

      <section className="flex flex-col gap-5 md:gap-8">
        <div className="flex flex-col gap-3 md:gap-5">
          <p className="flex items-center gap-1.5 text-green-400 tracking-widest leading-none uppercase txt-6 font-bold">
            <HiOutlineStar strokeWidth={2.5} size={14} />
            marketplace universitario
          </p>
          <h1 className="txt-1 font-bold leading-tight">
            El marketplace de los{' '}
            <span className="text-shimmer decoration-green-400/50 underline underline-offset-8 decoration-2">
              Cimarrones
            </span>
          </h1>
          <p className="hidden md:block txt-base text-white/85 max-w-md">
            Compra, vende e intercambia productos de forma segura dentro de la comunidad
            universitaria UABC.
          </p>
        </div>

        <ul className="flex flex-col gap-2 md:gap-3">
          {highlights.map((text) => (
            <FeatureItem key={text} description={text} />
          ))}
        </ul>
      </section>

      {/* Footer badges — desktop only */}
      <footer className="hidden md:block w-full">
        <ul className="flex glass divide-x divide-white/10 rounded-xl py-5 px-2">
          {badges.map((badge) => (
            <FeatureItem key={badge.description} variant="card" {...badge} />
          ))}
        </ul>
      </footer>
    </div>
  )
}
