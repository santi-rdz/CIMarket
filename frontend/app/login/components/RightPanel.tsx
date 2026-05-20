import { HiOutlineExclamationCircle } from 'react-icons/hi'
import LoginButton from './LoginButton'

export default function RightPanel() {
  return (
    /* Mobile: card that slides up over the hero with rounded top corners
       Desktop: centered panel filling the right column */
    <div className="
      relative z-10 bg-white flex-1
      rounded-t-[2rem] -mt-8 px-6 py-8 shadow-2xl shadow-black/10
      md:rounded-none md:mt-0 md:shadow-none md:px-0 md:py-0 md:flex md:items-center md:justify-center
    ">
      <div className="w-full max-w-sm mx-auto space-y-8 md:space-y-10">
        <div className="text-green-800 flex items-center gap-2 bg-green-50 tracking-wider leading-none border border-green-200 rounded-full txt-6 px-3 py-1.5 uppercase font-bold w-fit">
          <span className="size-2 bg-green-500 rounded-full animate-pulse" />
          <p>Acceso institucional</p>
        </div>
        <header className="space-y-3">
          <h2 className="txt-2 text-slate-900 font-black">Bienvenido de vuelta</h2>
          <p className="text-slate-700 txt-base leading-relaxed">
            Accede con tu cuenta institucional para ingresar a tu marketplace universitario.
          </p>
        </header>
        <div className="space-y-6">
          <LoginButton />
          <div className="flex bg-slate-50 rounded-2xl p-3 border border-slate-200 font-medium items-center gap-2 txt-5 w-full justify-center text-gray-500">
            <HiOutlineExclamationCircle size={18} strokeWidth={2} />
            <p>
              Solo disponible para cuentas{' '}
              <span className="font-bold text-green-800">@uabc.edu.mx</span>
            </p>
          </div>
        </div>
        <footer className="txt-6 text-slate-400 text-center">
          Al continuar, aceptas nuestros{' '}
          <span className="text-green-800 font-medium hover:underline cursor-pointer">
            Términos de servicio
          </span>{' '}
          y{' '}
          <span className="text-green-800 font-medium hover:underline cursor-pointer">
            Política de privacidad
          </span>
        </footer>
      </div>
    </div>
  )
}
