import { useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { categories, useProducts } from '../lib/products'

const ratingOptions = [{ label: 'All ratings', value: 0 }, { label: '5 stars', value: 5 }, { label: '4+ stars', value: 4 }, { label: '3+ stars', value: 3 }]

export function ProductsPage() {
  const { products, loading, error } = useProducts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState(0)
  const [sort, setSort] = useState('newest')
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...products].filter((product) => (!query || [product.name, product.brand, product.category].some((field) => field?.toLowerCase().includes(query))) && (!category || product.category === category) && (!rating || product.averageRating >= rating)).sort((a, b) => sort === 'highest' ? b.averageRating - a.averageRating : sort === 'lowest' ? a.averageRating - b.averageRating : sort === 'reviewed' ? b.reviewCount - a.reviewCount : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [category, products, rating, search, sort])
  const clearFilters = () => { setSearch(''); setCategory(''); setRating(0); setSort('newest') }

  return <main className="products-page"><div className="page-heading"><div><p className="section-kicker">The collection</p><h1>Products</h1><p>Find useful signals across the products people are considering.</p></div><span className="result-count">{loading ? 'Loading...' : `${filteredProducts.length} products`}</span></div><div className="product-controls"><label className="control-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, brand, or category" aria-label="Search products" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={rating} onChange={(event) => setRating(Number(event.target.value))} aria-label="Filter by rating">{ratingOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option><option value="reviewed">Most reviewed</option></select><button className="clear-filters" type="button" onClick={clearFilters}>Clear filters</button></div>{loading ? <div className="product-grid">{[1, 2, 3, 4, 5, 6].map((item) => <div className="product-skeleton" key={item}><div /><span /><span /></div>)}</div> : error ? <p className="state-message form-error">{error}</p> : filteredProducts.length ? <div className="product-grid">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-state"><h2>No products found</h2><p>Try another search or clear your filters.</p><button className="clear-filters" type="button" onClick={clearFilters}>Clear filters</button></div>}</main>
}