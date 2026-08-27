import { ProductCard } from './ProductCard'
import { useProducts } from '../lib/products'

export function FeaturedProducts() {
  const { products, loading, error } = useProducts()
  const groups = [
    { id: 'featured', title: 'Featured products', kicker: 'Curated for you', items: products.slice(0, 3) },
    { id: 'highest-rated', title: 'Highest rated', kicker: 'The strongest signals', items: [...products].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3) },
    { id: 'recently-added', title: 'Recently added', kicker: 'Fresh to explore', items: products.slice(0, 3) },
  ]
  return <>{groups.map((group) => <section className="content-section home-products" id={group.id} key={group.id}><div className="section-heading"><div><p className="section-kicker">{group.kicker}</p><h2>{group.title}</h2></div><a className="text-link" href="#products">View all <span aria-hidden="true">↗</span></a></div>{loading ? <ProductSkeletons /> : error ? <p className="state-message form-error">{error}</p> : group.items.length ? <div className="product-grid">{group.items.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <p className="state-message">No products have been added yet.</p>}</section>)}</>
}

function ProductSkeletons() { return <div className="product-grid">{[1, 2, 3].map((item) => <div className="product-skeleton" key={item}><div /><span /><span /></div>)}</div> }