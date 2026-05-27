import LoginButton from './LoginButton'

export default function RightPanel() {
  return (
    <div
      className="
      relative z-10 bg-white
      rounded-t-[2rem] -mt-8 px-6 py-8 shadow-2xl shadow-black/10
      md:flex-1 md:rounded-none md:mt-0 md:shadow-none md:px-0 md:py-0 md:flex md:items-center md:justify-center
    "
    >
      <div className="w-full max-w-sm mx-auto space-y-8">
        <header className="space-y-2 animate-fade-in-up animate-duration-600 animate-delay-300">
          <h2 className="txt-2 text-slate-900 font-black">Inicia sesión</h2>
          <p className="txt-base text-slate-500">
            Usa tu cuenta <span className="font-semibold text-green-800">@uabc.edu.mx</span>
          </p>
        </header>

        <div className="animate-fade-in-up animate-duration-600 animate-delay-500">
          <LoginButton />
        </div>

        <footer className="txt-6 text-slate-400 text-center animate-fade-in animate-duration-700 animate-delay-700">
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
