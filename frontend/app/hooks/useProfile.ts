'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserProducts,
  getUserFavorites,
  getUserReviews,
  getUserPreferences,
  updateUserPreferences,
} from '@/app/services/profileApi'
import { toastApiError } from '@/app/lib/fetchApi'
import { toast } from 'sonner'
import { useMe } from './useMe'

/** Perfil propio — usa el id del usuario autenticado */
export function useMyProfile() {
  const { data: me } = useMe()
  const userId = me?.id

  const query = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return { ...query, isLoading: !userId || query.isPending }
}

/** Perfil de cualquier usuario por id */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { data: me } = useMe()
  return useMutation({
    mutationFn: (data: { name?: string }) => updateUserProfile(me!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile', me?.id] })
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Perfil actualizado')
    },
    onError: toastApiError,
  })
}

export function useSetupCampus(userId: string, onDone: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (campusIds: number[]) => updateUserPreferences(userId, { campusIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-preferences', userId] })
      onDone()
    },
    onError: toastApiError,
  })
}

export function useDeleteAccount() {
  const { data: me } = useMe()
  return useMutation({
    mutationFn: () => deleteUserAccount(me!.id),
    onError: toastApiError,
  })
}

export function useUserProducts(userId: string | undefined, page = 1, status?: string) {
  return useQuery({
    queryKey: ['user-products', userId, page, status],
    queryFn: () => getUserProducts(userId!, page, status),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUserFavorites(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['user-favorites', userId, page],
    queryFn: () => getUserFavorites(userId!, page),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUserReviews(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => getUserReviews(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMyPreferences() {
  const { data: me } = useMe()
  return useQuery({
    queryKey: ['user-preferences', me?.id],
    queryFn: () => getUserPreferences(me!.id),
    enabled: !!me?.id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  const { data: me } = useMe()
  return useMutation({
    mutationFn: (data: {
      emailNotifications?: boolean
      showContactInfo?: boolean
      campusIds?: number[]
    }) => updateUserPreferences(me!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-preferences', me?.id] })
      toast.success('Preferencias guardadas')
    },
    onError: toastApiError,
  })
}
