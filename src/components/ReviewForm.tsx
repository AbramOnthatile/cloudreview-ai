import { useState } from 'react'
import type { FormEvent } from 'react'
import { saveReview } from '../lib/reviews'
import { StarRating } from './StarRating'

export function ReviewForm({ productId, userId, existing, onSaved, onCancel }: { productId: string; userId: string; existing?: { id: string; rating: number; title: string; content: string }; onSaved: (message: string) => void; onCancel: () => void }) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    if (!rating || rating < 1 || rating > 5) return setError('Choose a rating from 1 to 5 stars.')
    if (!title.trim() || title.length > 120) return setError('Add a title no longer than 120 characters.')
    if (content.trim().length < 20 || content.length > 3000) return setError('Your review must be between 20 and 3,000 characters.')
    setSubmitting(true)
    const { error: saveError } = await saveReview({ id: existing?.id, productId, userId, rating, title, content })
    setSubmitting(false)
    if (saveError) return setError(saveError.code === '23505' ? 'You have already reviewed this product.' : 'Unable to save your review. Please try again.')
    onSaved(existing ? 'Review updated.' : 'Review posted successfully.')
  }
  return <form className="review-form" onSubmit={submit}><div className="review-form-heading"><h3>{existing ? 'Edit your review' : 'Write a review'}</h3><button type="button" onClick={onCancel} aria-label="Close review form">×</button></div><label>Rating <StarRating value={rating} onChange={setRating} size="large" /></label><label>Title<input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sum up your experience" /></label><label>Review<textarea maxLength={3000} minLength={20} value={content} onChange={(event) => setContent(event.target.value)} placeholder="What should other people know?" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="auth-submit" disabled={submitting} type="submit">{submitting ? 'Saving...' : existing ? 'Update review' : 'Post review'}</button></form>
}