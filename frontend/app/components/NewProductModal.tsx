'use client'

import { HiPlus } from 'react-icons/hi2'
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
  return (
    <Modal>
      <Modal.Trigger opens="post-product">
        <Button size={size} icon={<HiPlus className="h-4 w-4" />} className={className}>
          {label}
        </Button>
      </Modal.Trigger>
      <Modal.Content width="lg" height="xl">
        <NewProductForm />
      </Modal.Content>
    </Modal>
  )
}
