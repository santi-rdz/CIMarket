import { FcGoogle } from 'react-icons/fc'

export default function LoginButton() {
  return (
    <div
      role="button"
      className="relative rounded-full p-1 overflow-hidden bg-[#B4B4B426] cursor-pointer shadow-[0_2px_16px_rgba(22,101,52,0.10)]"
    >
      <div className="block absolute z-0 size-12 bg-green-800/65 filter-blur animate-blob pointer-events-none"></div>
      <button className="flex font-bold cursor-pointer txt-base leading-none hover:shadow-[inset_0_0_0_1px_rgba(22,101,52,0.10)] duration-200 bg-white rounded-full relative z-2 items-center gap-2 justify-center w-full py-4">
        <FcGoogle size={24} />
        <span>Continuar con Google</span>
      </button>
    </div>
  )
}
