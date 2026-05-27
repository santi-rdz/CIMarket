import type { Metadata } from 'next'
import { fetchApi } from '@/app/lib/fetchApi'
import type { PublicProfile } from '@/app/types/profile'
import UserProfileClient from './components/UserProfileClient'

async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  try {
    return await fetchApi<PublicProfile>(`/users/${id}`)
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const profile = await getPublicProfile(id)

  if (!profile) {
    return { title: 'Usuario no encontrado' }
  }

  return {
    title: `${profile.name} — Vendedor`,
    description: `Perfil de ${profile.name} en CIMarket. ${profile._count.products} publicaciones${profile.campus ? `, campus ${profile.campus.name}` : ''}.`,
    robots: { index: true, follow: true },
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <UserProfileClient id={id} />
}
