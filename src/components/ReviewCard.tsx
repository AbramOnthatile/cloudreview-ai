import type { Review } from '../lib/reviews'
import { StarRating } from './StarRating'

export function ReviewCard({ review, canManage, onEdit, onDelete }: { review: Review; canManage: boolean; onEdit: () => void; onDelete: () => void }) {
  return <article className="review-card">
    <div className="review-card-top"><div><strong>{review.reviewerName}</strong><span>{new Date(review.created_at).toLocaleDateString()}</span></div><StarRating value={review.rating} /></div>
    <h3>{review.title}</h3><p>{review.content}</p>
    {review.image_url && <img className="review-image" src={review.image_url} alt="Review attachment" />}
    {canManage && <div className="review-actions"><button type="button" onClick={onEdit}>Edit</button><button type="button" onClick={onDelete}>Delete</button></div>}
  </article>
}