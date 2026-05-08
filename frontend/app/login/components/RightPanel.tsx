import { HiOutlineExclamationCircle } from 'react-icons/hi'
import LoginButton from './LoginButton'

export default function RightPanel() {
  return (
    <div className="place-self-center max-w-sm mx-auto space-y-10">
      <div className="text-green-800 place-self-start flex items-center gap-2  bg-green-50 tracking-wider leading-none border border-green-200 rounded-full txt-6 px-3 py-1.5 uppercase font-bold ">
        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
        <p>Acesso insitucional</p>
      </div>
      <header>
        <h2 className="txt-2 mt-4 text-slate-900 font-black">Bienvenido de vuelta</h2>
        <p className="text-slate-700 txt-base mt-2 leading-normal">
          Accede con tun cuenta institucional para ingresar a tu marketplace universitario
        </p>
      </header>
      <div className="space-y-6">
        <LoginButton />
        <div className="flex bg-slate-50 rounded-2xl p-3 border border-slate-200 font-medium items-center gap-2 txt-5 w-full justify-center text-gray-500">
          <HiOutlineExclamationCircle size={18} strokeWidth={2} className="" />
          <p>
            Solo disponible para cuentas{' '}
            <span className="font-bold text-green-800">@uabc.edu.mx</span>
          </p>
        </div>
      </div>
      <footer className="txt-6 text-slate-400 text-center">
        Al continuar, aceptas nuestros{' '}
        <span className="text-green-800 font-medium hover:underline">
          Términos de servicio
        </span>{' '}
        y{' '}
        <span className="text-green-800 font-medium hover:underline">
          Política de privacidad
        </span>
      </footer>
    </div>
  )
}
