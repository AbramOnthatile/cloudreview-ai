import type { ProductWithStats } from '../lib/products'

export function ProductCard({ product, index = 0 }: { product: ProductWithStats; index?: number }) {
  return <article className="product-card">
    <a className="product-visual" href={`#product/${product.id}`}>
      <span className="product-number">{String(index + 1).padStart(2, '0')}</span>
      {product.image_url ? <img src={product.image_url} alt="" /> : <span className="visual-shape" />}
    </a>
    <div className="product-info">
      <p className="product-type">{product.category ?? 'Other'}</p>
      <h3><a href={`#product/${product.id}`}>{product.name}</a></h3>
      <p className="product-brand">{product.brand ?? 'Independent brand'}</p>
      <p className="product-detail">{product.description ?? 'A product worth exploring.'}</p>
      <div className="product-meta"><strong>{product.price === null ? 'Price unavailable' : `$${product.price.toFixed(2)}`}</strong><span className="product-score"><span className="stars">★★★★★</span>{product.averageRating ? product.averageRating.toFixed(1) : 'New'} <span className="review-count">({product.reviewCount})</span></span></div>
    </div>
  </article>
}