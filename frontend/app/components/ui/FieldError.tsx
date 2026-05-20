export default function FieldError({ error }: { error?: { message?: string } }) {
  if (!error?.message) return null
  return <p className="mt-1 text-xs text-red-500">{error.message}</p>
}
