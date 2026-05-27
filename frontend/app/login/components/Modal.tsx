import useClickOutside from '@/app/hooks/useClickOutside'
import { cva } from 'class-variance-authority'
import { cloneElement, createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'

// ─── Context ─────────────────────────────────────────────────────────────────

type ModalContextValue = {
  openName: string
  open: (name: string) => void
  close: () => void
}
type HeadingContextValue = {
  title: string
  description?: string
  setTitle?: (title: string) => void
  setDescription?: (description: string) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)
const HeadingContext = createContext<HeadingContextValue | null>({
  title: 'Title',
  description: '',
  setTitle: () => {},
  setDescription: () => {},
})

function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('Modal components must be used inside <Modal>')
  return ctx
}
export function useHeading() {
  const ctx = useContext(HeadingContext)
  if (!ctx)
    throw new Error('Modal.Heading components must be used inside <Modal.Heading>')
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Modal({ children }: { children: React.ReactNode }) {
  const [openName, setOpenName] = useState('')

  return (
    <ModalContext value={{ openName, open: setOpenName, close: () => setOpenName('') }}>
      <HeadingContext
        value={{
          title: 'Title',
          description: 'Description',
          setTitle: () => {},
          setDescription: () => {},
        }}
      >
        {children}
      </HeadingContext>
    </ModalContext>
  )
}

// ─── Heading ─────────────────────────────────────────────────────────────────

Modal.Heading = function ModalHeading({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return <header className="w-full space-y-1 text-center">{children}</header>
}

Modal.Title = function ModalTitle() {
  const { title } = useHeading()
  return <h2 className="txt-3 font-bold text-slate-900">{title}</h2>
}

Modal.Description = function ModalDescription() {
  const { description } = useHeading()
  return <p className="txt-6 text-slate-400">{description}</p>
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

Modal.Trigger = function ModalTrigger({
  children,
  opens,
}: {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>
  opens: string
}) {
  const { open } = useModal()
  return cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      if (!e.defaultPrevented) open(opens)
    },
  })
}

// ─── Auto (opens programmatically on mount) ─────────────────────────────────

Modal.Auto = function ModalAuto({ name }: { name: string }) {
  const { open } = useModal()
  useEffect(() => {
    open(name)
  }, [name, open])
  return null
}

// ─── Content ─────────────────────────────────────────────────────────────────

const contentVariants = cva(
  'relative grid overflow-hidden max-sm:h-[95dvh] max-sm:w-full max-sm:rounded-b-none max-sm:p-4 lace-items-center rounded-3xl bg-white p-12 animate-[modal-in_200ms_ease-out]',
  {
    variants: {
      width: {
        sm: 'w-75',
        md: 'w-100',
        lg: 'w-140',
      },
      height: {
        auto: '',
        xs: 'h-75 ',
        sm: 'h-100 ',
        md: 'h-125 ',
        lg: 'h-150 ',
        xl: 'h-175',
      },
    },
    defaultVariants: { width: 'md', height: 'sm' },
  },
)

type ModalContentProps = {
  children: React.ReactElement<{ onCloseModal?: (...args: unknown[]) => void }>
  name?: string
  width?: 'sm' | 'md' | 'lg'
  height?: 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

Modal.Content = function ModalContent({
  children,
  name,
  width,
  height,
}: ModalContentProps) {
  const { openName, close } = useModal()

  if (!openName) return null
  if (name && openName !== name) return null

  return createPortal(
    <div
      role="dialog"
      onClick={close}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 max-sm:place-items-end max-sm:p-0 animate-blurred-fade-in animate-duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={contentVariants({ width, height })}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          className="absolute right-5 top-4 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 dura max-sm:right-3 max-sm:top-3"
        >
          <HiXMark className="size-4" />
        </button>

        {cloneElement(children, {
          onCloseModal: (...args: unknown[]) => {
            children.props.onCloseModal?.(...args)
            close()
          },
        })}
      </div>
    </div>,
    document.body,
  )
}
