type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  size?: 'small' | 'large'
}

export function StarRating({ value, onChange, size = 'small' }: StarRatingProps) {
  return <span className={`star-rating star-rating-${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => onChange ? <button type="button" key={star} className={star <= value ? 'active' : ''} onClick={() => onChange(star)} role="radio" aria-checked={star === value} aria-label={`${star} star${star === 1 ? '' : 's'}`}>★</button> : <span aria-hidden="true" key={star} className={star <= value ? 'active' : ''}>★</span>)}
  </span>
}