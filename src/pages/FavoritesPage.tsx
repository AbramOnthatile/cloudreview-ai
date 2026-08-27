import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { getFavoriteProducts, removeFavorite } from '../lib/favorites'
import type { ProductWithStats } from '../lib/products'
import { ProductCard } from '../components/ProductCard'

export function FavoritesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { if (!user) return; let active = true; void getFavoriteProducts(user.id).then((data) => { if (active) setProducts(data) }).catch(() => { if (active) setError('Your favorites are unavailable right now. Please try again.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [user])
  const remove = async (productId: string) => { if (!user) return; const { error: removeError } = await removeFavorite(user.id, productId); if (removeError) { setError('Unable to remove that favorite. Please try again.'); return } setProducts((current) => current.filter((product) => product.id !== productId)) }
  return <main className="account-page favorites-page"><div className="page-heading"><div><p className="section-kicker">Saved for later</p><h1>Favorites</h1><p>Keep the products you want to come back to.</p></div><span className="result-count">{products.length} saved</span></div>{loading ? <p className="state-message">Loading favorites...</p> : error ? <p className="state-message form-error">{error}</p> : products.length ? <div className="product-grid">{products.map((product, index) => <div className="favorite-item" key={product.id}><ProductCard product={product} index={index} /><div className="favorite-item-actions"><button className="clear-filters" type="button" onClick={() => onNavigate(`#product/${product.id}`)}>View product</button><button className="remove-button" type="button" onClick={() => void remove(product.id)}>Remove favorite</button></div></div>)}</div> : <div className="empty-state"><h2>No favorites yet.</h2><p>Save products you are considering and find them here later.</p><button className="clear-filters" type="button" onClick={() => onNavigate('#products')}>Browse Products</button></div>}</main>
}