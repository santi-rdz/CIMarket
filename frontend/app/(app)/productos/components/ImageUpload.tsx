'use client'

import { useRef } from 'react'
import { HiOutlinePhotograph, HiPlus } from 'react-icons/hi'
import { HiXMark } from 'react-icons/hi2'

const MAX_FILES = 5
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPT = 'image/jpeg,image/png'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  existingUrls?: string[]
  onRemoveExisting?: (index: number) => void
}

export default function ImageUpload({ files, onChange, existingUrls = [], onRemoveExisting }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const totalCount = existingUrls.length + files.length

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid = Array.from(incoming)
      .filter((f) => f.size <= MAX_SIZE)
      .slice(0, MAX_FILES - totalCount)
    if (valid.length) onChange([...files, ...valid])
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  if (totalCount === 0) {
    return (
      <label className="group flex w-full bg-gray-50 hover:bg-green-50 cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-8 transition-colors hover:border-green-600">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="rounded-xl bg-green-50 p-3">
          <HiOutlinePhotograph className="size-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-slate-700">Agregar foto del producto</p>
        <p className="text-xs text-slate-400">JPG, PNG · Máx. 5 MB</p>
      </label>
    )
  }

  return (
    <div className="grid w-full grid-cols-4 gap-2">
      {existingUrls.map((url, i) => (
        <div key={`existing-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          <img src={url} alt={`Imagen ${i + 1}`} className="size-full object-cover" />
          {onRemoveExisting && (
            <button
              type="button"
              onClick={() => onRemoveExisting(i)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <HiXMark className="size-3" />
            </button>
          )}
        </div>
      ))}

      {files.map((file, i) => (
        <div key={`new-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          <img
            src={URL.createObjectURL(file)}
            alt={`Nueva imagen ${i + 1}`}
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={() => removeFile(i)}
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <HiXMark className="size-3" />
          </button>
        </div>
      ))}

      {totalCount < MAX_FILES && (
        <label className="flex cursor-pointer items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 transition-colors hover:border-green-600">
          <HiPlus className="size-5 text-slate-400" />
          <input
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  )
}
