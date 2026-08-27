import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Product = {
  id: string
  name: string
  brand: string | null
  category: string | null
  description: string | null
  image_url: string | null
  price: number | null
  source: string | null
  created_at: string
  updated_at: string
}

export type ProductStats = {
  averageRating: number
  reviewCount: number
  distribution: Record<number, number>
}

export type ProductWithStats = Product & ProductStats

export const categories = ['Electronics', 'Phones', 'Laptops', 'Home', 'Gaming', 'Appliances', 'Fashion', 'Other'] as const

type ReviewRating = { product_id: string; rating: number }

export function getProductStats(reviews: ReviewRating[], productId: string): ProductStats {
  const matching = reviews.filter((review) => review.product_id === productId)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  matching.forEach((review) => { distribution[review.rating] = (distribution[review.rating] ?? 0) + 1 })
  return {
    averageRating: matching.length ? matching.reduce((total, review) => total + review.rating, 0) / matching.length : 0,
    reviewCount: matching.length,
    distribution,
  }
}

export function addStats(products: Product[], reviews: ReviewRating[]) {
  return products.map((product) => ({ ...product, ...getProductStats(reviews, product.id) }))
}

export function useProducts() {
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const [{ data: productRows, error: productError }, { data: reviewRows, error: reviewError }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('product_id, rating'),
      ])
      if (!active) return
      if (productError || reviewError) {
        setError('Products are unavailable right now. Please try again.')
      } else {
        setProducts(addStats(productRows ?? [], reviewRows ?? []))
      }
      setLoading(false)
    }
    void load().catch(() => { if (active) { setError('Unable to reach Supabase. Check your connection and try again.'); setLoading(false) } })
    return () => { active = false }
  }, [])

  return { products, loading, error }
}

export async function getProduct(id: string) {
  const [{ data: product, error: productError }, { data: reviews, error: reviewError }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('reviews').select('product_id, rating').eq('product_id', id),
  ])
  if (productError || reviewError) throw new Error('Product details are unavailable right now.')
  return product ? { ...product, ...getProductStats(reviews ?? [], id) } : null
}