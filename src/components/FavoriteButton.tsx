import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { useFavorite } from '../lib/favorites'

export function FavoriteButton({ productId, onLogin }: { productId: string; onLogin: () => void }) {
  const { user } = useAuth()
  const { favorited, loading, error, toggle } = useFavorite(productId, user?.id)
  const [message, setMessage] = useState('')
  const click = async () => {
    if (!user) { setMessage('Log in to save this product.'); return }
    setMessage(''); await toggle()
  }
  return <div className="favorite-control"><button className={`favorite-button ${favorited ? 'is-favorited' : ''}`} type="button" disabled={loading} onClick={click}>{loading ? 'Saving...' : favorited ? '♥ Saved' : '♡ Add to Favorites'}</button>{(error || message) && <p className="favorite-message" role="status">{error || message} {!user && <button type="button" onClick={onLogin}>Log in</button>}</p>}</div>
}