import Link from 'next/link'
import { cva } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ReactNode
  href?: string
}

export const buttonVariants = cva(
  'flex items-center text-nowrap justify-center focus-visible:outline-1.5 focus-visible:outline-green-800 focus-visible:outline-offset-2 gap-2 rounded-full transition-colors duration-300',
  {
    variants: {
      variant: {
        primary:
          'bg-green-800 shadow-[0_4px_16px_rgba(22,101,52,0.22)] text-white font-bold hover:bg-green-800 hover:brightness-110 focus-visible:bg-green-800 focus-visible:brightness-110',
        secondary:
          'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:ring-1 hover:ring-slate-500  focus-visible:ring-1 focus-visible:ring-slate-500',
        outline:
          'border border-gray-300 text-gray-700 hover:ring-1 hover:ring-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500',
        ghost: 'text-gray-700 hover:bg-gray-300 hover:[svg]:text-green-800',
      },
      size: {
        sm: 'txt-6 px-3.5 py-2 font-semibold',
        md: 'txt-5 px-4 py-2.5 font-bold',
        lg: 'txt-5 px-6 py-3.5 font-medium',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  type = 'button',
  icon,
  href,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  const classes = cn(buttonVariants({ variant, size, disabled: isDisabled }), className)

  const content = (
    <>
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </>
  )

  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      {...props}
      disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      type={type}
    >
      {content}
    </button>
  )
}
