'use client'

import { HiPlus } from 'react-icons/hi2'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Modal from '@/app/login/components/Modal'
import { NewProductForm } from '@/app/(app)/productos/components/NewProductForm'
import { Button } from './ui/button'

type TriggerOptions = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

type Props = {
  trigger?: TriggerOptions
}

export default function NewProductModal({ trigger }: Props) {
  const { size = 'md', className, label = 'Publicar' } = trigger ?? {}
  const router = useRouter()

  function requireSession(event: React.MouseEvent) {
    if (localStorage.getItem('token')) return

    event.preventDefault()
    toast.error('Inicia sesión para publicar un producto')
    router.push('/login')
  }

  return (
    <Modal>
      <Modal.Trigger opens="post-product">
        <Button
          size={size}
          icon={<HiPlus className="h-4 w-4" />}
          className={className}
          onClick={requireSession}
        >
          {label}
        </Button>
      </Modal.Trigger>
      <Modal.Content width="lg" height="xl">
        <NewProductForm />
      </Modal.Content>
    </Modal>
  )
}
