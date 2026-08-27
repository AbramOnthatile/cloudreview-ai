import { useCallback, useEffect, useState } from 'react'
import { addStats, type ProductWithStats } from './products'
import { supabase } from './supabase'

export function useFavorite(productId: string, userId?: string) {
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    if (!userId) { setFavorited(false); return }
    const { data, error: queryError } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle()
    if (queryError) throw queryError
    setFavorited(Boolean(data))
  }, [productId, userId])
  useEffect(() => { void refresh().catch(() => setError('Favorite status is unavailable right now.')) }, [refresh])
  const toggle = async () => {
    if (!userId) return false
    setLoading(true); setError('')
    const result = favorited
      ? await supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId)
      : await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
    setLoading(false)
    if (result.error) { setError('Unable to update favorites. Please try again.'); return false }
    setFavorited(!favorited)
    return true
  }
  return { favorited, loading, error, toggle }
}

export async function getFavoriteProducts(userId: string): Promise<ProductWithStats[]> {
  const { data: favoriteRows, error: favoriteError } = await supabase.from('favorites').select('product_id, created_at').eq('user_id', userId).order('created_at', { ascending: false })
  if (favoriteError) throw favoriteError
  const ids = (favoriteRows ?? []).map((favorite) => favorite.product_id)
  if (!ids.length) return []
  const [{ data: products, error: productError }, { data: reviews, error: reviewError }] = await Promise.all([
    supabase.from('products').select('*').in('id', ids),
    supabase.from('reviews').select('product_id, rating').in('product_id', ids),
  ])
  if (productError || reviewError) throw productError ?? reviewError
  const ordered = new Map(ids.map((id, index) => [id, index]))
  return addStats(products ?? [], reviews ?? []).sort((a, b) => (ordered.get(a.id) ?? 0) - (ordered.get(b.id) ?? 0))
}

export async function removeFavorite(userId: string, productId: string) {
  return supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId)
}