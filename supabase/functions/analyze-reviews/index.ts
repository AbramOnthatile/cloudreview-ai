import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const analysisSchema = { type: 'object', additionalProperties: false, required: ['summary', 'sentiment', 'pros', 'cons', 'themes'], properties: { summary: { type: 'string' }, sentiment: { type: 'string', enum: ['positive', 'mixed', 'negative'] }, pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } }, themes: { type: 'array', items: { type: 'string' } } } }
const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Only POST requests are supported.' }, 405)
  let productId: unknown
  try { ({ productId } = await request.json()) } catch { return jsonResponse({ error: 'Request body must be valid JSON.' }, 400) }
  if (typeof productId !== 'string' || !/^[0-9a-f-]{36}$/i.test(productId)) return jsonResponse({ error: 'A valid product ID is required.' }, 400)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const openAiKey = Deno.env.get('OPENAI_API_KEY')
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Supabase server configuration is incomplete.' }, 500)
  const admin = createClient(supabaseUrl, serviceRoleKey)
  const [{ data: product, error: productError }, { data: reviews, error: reviewsError }] = await Promise.all([admin.from('products').select('id, name').eq('id', productId).maybeSingle(), admin.from('reviews').select('rating, title, content').eq('product_id', productId).order('created_at', { ascending: true })])
  if (productError || reviewsError) return jsonResponse({ error: 'Unable to load product reviews.' }, 502)
  if (!product) return jsonResponse({ error: 'Product not found.' }, 404)
  if (!reviews?.length) return jsonResponse({ error: 'Add some customer reviews before analyzing this product.' }, 422)
  if (!openAiKey) {
    const demoAnalysis = createDemoAnalysis(reviews)
    const { data: saved, error: saveError } = await admin.from('review_analysis').upsert({ product_id: productId, ...demoAnalysis, mode: 'demo', generated_at: new Date().toISOString() }, { onConflict: 'product_id' }).select().single()
    if (saveError) return jsonResponse({ error: 'Unable to save the demo review analysis.' }, 502)
    return jsonResponse({ analysis: saved })
  }
  const reviewText = reviews.map((review, index) => `Review ${index + 1}\nRating: ${review.rating}/5\nTitle: ${review.title}\nContent: ${review.content}`).join('\n\n')
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_schema', json_schema: { name: 'review_analysis', strict: true, schema: analysisSchema } }, messages: [{ role: 'system', content: 'You analyze customer reviews fairly. Return only JSON matching the requested schema. Use only information in the reviews. Never invent product features or opinions. Identify repeated opinions, mention disagreements when reviews differ, keep the summary concise, and do not use markdown in JSON values.' }, { role: 'user', content: `Product: ${product.name}\n\nCustomer reviews:\n${reviewText}` }] }) })
  if (!aiResponse.ok) return jsonResponse({ error: 'The AI service is temporarily unavailable.' }, 502)
  let aiBody: { choices?: Array<{ message?: { content?: string } }> }
  try { aiBody = await aiResponse.json() } catch { return jsonResponse({ error: 'The AI service returned an invalid response.' }, 502) }
  let analysis: unknown
  try { analysis = JSON.parse(aiBody.choices?.[0]?.message?.content ?? '') } catch { return jsonResponse({ error: 'The AI service returned invalid analysis data.' }, 502) }
  if (!isValidAnalysis(analysis)) return jsonResponse({ error: 'The AI service returned incomplete analysis data.' }, 502)
  const { data: saved, error: saveError } = await admin.from('review_analysis').upsert({ product_id: productId, ...analysis, mode: 'openai', generated_at: new Date().toISOString() }, { onConflict: 'product_id' }).select().single()
  if (saveError) return jsonResponse({ error: 'Unable to save the review analysis.' }, 502)
  return jsonResponse({ analysis: saved })
})

function isValidAnalysis(value: unknown): value is { summary: string; sentiment: 'positive' | 'mixed' | 'negative'; pros: string[]; cons: string[]; themes: string[] } {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.summary === 'string' && ['positive', 'mixed', 'negative'].includes(String(candidate.sentiment)) && ['pros', 'cons', 'themes'].every((key) => Array.isArray(candidate[key]) && (candidate[key] as unknown[]).every((item) => typeof item === 'string'))
}

function createDemoAnalysis(reviews: Array<{ rating: number; title: string; content: string }>) {
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const positiveReviews = reviews.filter((review) => review.rating >= 4)
  const negativeReviews = reviews.filter((review) => review.rating <= 2)
  const sentiment = average >= 4 ? 'positive' : average <= 2.5 ? 'negative' : 'mixed'
  const positiveTerms = extractRepeatedTerms(positiveReviews)
  const negativeTerms = extractRepeatedTerms(negativeReviews)
  const pros = positiveTerms.length ? positiveTerms.slice(0, 3).map((term) => `Positive mentions of ${term}.`) : positiveReviews.length ? ['Customers generally describe the experience positively.'] : []
  const cons = negativeTerms.length ? negativeTerms.slice(0, 3).map((term) => `Some customers mention ${term} as a drawback.`) : negativeReviews.length ? ['Some customers describe areas for improvement.'] : []
  const themes = [...new Set([...positiveTerms, ...negativeTerms, ...extractRepeatedTerms(reviews)])].slice(0, 4)
  const balance = positiveReviews.length && negativeReviews.length ? 'Reviews include both positive experiences and areas for improvement.' : positiveReviews.length ? 'Reviews are consistently positive overall.' : 'Reviews lean negative overall.'
  return { summary: `Based on ${reviews.length} customer review${reviews.length === 1 ? '' : 's'}, the average rating is ${average.toFixed(1)} out of 5. ${balance}`, sentiment, pros, cons, themes }
}

function extractRepeatedTerms(reviews: Array<{ title: string; content: string }>) {
  const stopWords = new Set(['about', 'after', 'again', 'also', 'because', 'being', 'could', 'customer', 'from', 'have', 'into', 'just', 'more', 'that', 'their', 'there', 'these', 'they', 'this', 'very', 'what', 'when', 'with', 'would', 'your'])
  const counts = new Map<string, number>()
  reviews.forEach((review) => review.title.concat(' ', review.content).toLowerCase().match(/[a-z]{4,}/g)?.forEach((word) => { if (!stopWords.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1) }))
  return [...counts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([word]) => word)
}