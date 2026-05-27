import { cn } from '@/app/lib/utils'
import { cva } from 'class-variance-authority'
import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  hasError?: boolean
}

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input'
  }

type TextAreaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea'
  }

type Props = InputProps | TextAreaProps

const inputVariants = cva(
  'w-full rounded-xl text-slate-900 placeholder:text-gray-600 input outline-none focus-visible:outline-1.5',
  {
    variants: {
      variant: {
        default: 'focus-visible:bg-white',
        outline: 'bg-transparent border border-slate-300',
      },
      size: {
        sm: 'px-3 py-1.5 txt-6',
        md: 'px-4 py-2.5 txt-base',
        lg: 'px-6 py-3 txt-5',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(function Input(
  { variant, size, as = 'input', className, hasError = false, ...props },
  ref,
) {
  const inputClasses = cn(
    inputVariants({ variant, size, className }),
    hasError
      ? 'focus-visible:outline-red-500 focus-visible:outline-offset-2'
      : 'focus-visible:outline-green-800 focus-visible:-outline-offset-1',
  )

  if (as === 'textarea') {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={inputClasses}
        {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    )
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={inputClasses}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  )
})

export default Input
