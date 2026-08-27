import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type AIReviewAnalysis = { id: string; product_id: string; summary: string; pros: string[]; cons: string[]; themes: string[]; sentiment: 'positive' | 'mixed' | 'negative'; mode: 'demo' | 'openai'; generated_at: string }
export type AIReviewResponse = { analysis: AIReviewAnalysis }

export function useReviewAnalysis(productId: string, reviewCount: number) {
  const [analysis, setAnalysis] = useState<AIReviewAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!reviewCount) {
      setLoading(false)
      return
    }

    let active = true
    const load = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('review_analysis')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle()

        if (!active) return
        if (queryError) setError('Analysis is unavailable right now.')
        else if (data?.summary && data.sentiment && ['positive', 'mixed', 'negative'].includes(data.sentiment)) {
          setAnalysis({
            ...data,
            summary: data.summary,
            sentiment: data.sentiment as AIReviewAnalysis['sentiment'],
            mode: data.mode === 'openai' ? 'openai' : 'demo',
          })
        }
      } catch {
        if (active) setError('Analysis is unavailable right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [productId, reviewCount])
  const generate = async () => { setGenerating(true); setError(''); try { const { data, error: invokeError } = await supabase.functions.invoke<AIReviewResponse>('analyze-reviews', { body: { productId } }); if (invokeError || !data?.analysis) throw new Error(); setAnalysis(data.analysis) } catch { setError('Unable to analyze these reviews right now. Please try again.') } finally { setGenerating(false) } }
  return { analysis, loading, generating, error, generate }
}