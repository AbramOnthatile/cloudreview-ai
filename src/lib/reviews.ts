import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  reviewerName: string
}

export function calculateReviewStats(reviews: Pick<Review, 'rating'>[]) {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((review) => { distribution[review.rating] = (distribution[review.rating] ?? 0) + 1 })
  return { average: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, count: reviews.length, distribution }
}

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: reviewError } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
      if (reviewError) throw reviewError
      const userIds = [...new Set((data ?? []).map((review) => review.user_id))]
      const { data: profiles, error: profileError } = userIds.length ? await supabase.from('profiles').select('id, username, full_name').in('id', userIds) : { data: [], error: null }
      if (profileError) throw profileError
      const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name || profile.username || 'Community member']))
      setReviews((data ?? []).map((review) => ({ ...review, reviewerName: names.get(review.user_id) ?? 'Community member' })))
    } catch {
      setError('Reviews are unavailable right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { void reload() }, [reload])
  return { reviews, loading, error, reload }
}

export async function saveReview({ id, productId, userId, rating, title, content }: { id?: string; productId: string; userId: string; rating: number; title: string; content: string }) {
  const payload = { product_id: productId, user_id: userId, rating, title: title.trim(), content: content.trim() }
  return id ? supabase.from('reviews').update(payload).eq('id', id).eq('user_id', userId) : supabase.from('reviews').insert(payload)
}

export async function deleteReview(id: string, userId: string) {
  return supabase.from('reviews').delete().eq('id', id).eq('user_id', userId)
}