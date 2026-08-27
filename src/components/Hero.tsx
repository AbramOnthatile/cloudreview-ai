import { useState } from 'react'
import type { FormEvent } from 'react'

type HeroProps = { onSearch: (term: string) => void; searchSubmitted: boolean }

export function Hero({ onSearch, searchSubmitted }: HeroProps) {
  const [term, setTerm] = useState('')
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSearch(term) }

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> A clearer way to choose</p><h1>Find the product<br /><span>that fits your life.</span></h1><p className="hero-description">Real opinions, distilled by AI. Compare products with confidence and spend less time scrolling.</p>
        <form className="search-form" onSubmit={submitSearch}><label className="sr-only" htmlFor="product-search">Search for a product</label><span className="search-icon" aria-hidden="true">⌕</span><input id="product-search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search a product or category..." /><button type="submit">Search <span aria-hidden="true">↗</span></button></form>
        {searchSubmitted && <p className="search-feedback">Showing insights for “{term}”</p>}
      </div>
      <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-card art-card-back">TRUSTED<br /><strong>CHOICES</strong></div><div className="art-card art-card-front"><span className="card-label">TODAY'S SIGNAL</span><strong>4.8</strong><span className="stars">★★★★★</span><span className="card-rule" /><span className="card-note">From 2,431 reviews</span></div><span className="floating-tag tag-top">98% useful</span><span className="floating-tag tag-bottom">AI distilled</span></div>
    </section>
  )
}