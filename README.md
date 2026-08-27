# CloudReview AI

CloudReview AI is a product discovery MVP that turns customer reviews into
clearer buying signals. It lets people browse products, compare ratings, read
community reviews, save products, and request a review analysis. The analysis
works in Demo Mode without an external AI key and can switch to OpenAI in
production.

## Features

- Product browsing, search, category filtering, and product detail pages
- Review ratings, sorting, creation, editing, and deletion for the signed-in author
- Public review and rating statistics with reviewer profile names
- Email/password registration, login, logout, session persistence, and profiles
- Favorites with duplicate prevention, a favorites page, and profile counts
- Server-side review analysis with cached results in `review_analysis`
- Demo Mode based on the product's actual review ratings and text
- Optional structured OpenAI analysis through a Supabase Edge Function
- Loading, empty, and request-failure states throughout the main workflows

## Technology Stack

- React 19, TypeScript, and Vite
- Tailwind CSS through the Vite plugin, plus the project's focused CSS
- Supabase PostgreSQL, Row Level Security, and Authentication
- Supabase Edge Functions with Deno
- Oxlint for linting

## Run In GitHub Codespaces

This project is intended to run inside GitHub Codespaces. The Windows host does
not need Node.js or Python installed.

```bash
npm install
cp .env.example .env.local
npm run dev -- --host 0.0.0.0
```

Open the forwarded port shown by Codespaces. Useful scripts are:

```bash
npm run build   # TypeScript build and Vite production build
npm run lint    # Oxlint
npm run preview # Serve the production build locally
```

## Environment Variables

The frontend needs only the Supabase project URL and publishable anonymous key:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Put these values in `.env.local`, which is ignored by Git. Never put an OpenAI
key or the Supabase service-role key in a Vite environment file or frontend
source code. `.env.example` contains names only.

## Supabase Setup

1. Create a Supabase project.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
3. Apply the SQL files in `supabase/migrations/` in timestamp order. The
	migrations create the schema, profile trigger, review uniqueness rule,
	public profile-name policy, and analysis mode column. Do not reset a project
	that already contains data.
4. Optionally load `supabase/seed/demo_products.sql` for sample products.
5. Deploy the analysis function:

```bash
supabase functions deploy analyze-reviews
```

Authentication uses Supabase email/password auth. Configure the project's email
confirmation and redirect settings in the Supabase dashboard as appropriate.
The `handle_new_user` database trigger creates a profile from registration
metadata. The registration form also performs a non-destructive upsert when a
session is returned immediately.

## AI Review Analysis

The browser invokes the `analyze-reviews` Supabase Edge Function. The function
loads the selected product's real reviews, creates an analysis, and upserts one
cached result per product into `review_analysis`.

### Demo Mode

When `OPENAI_API_KEY` is absent from the Edge Function environment, the function
uses its server-side Demo Mode. It calculates sentiment from the ratings and
extracts repeated terms from the review titles and content. The UI labels this
result **Demo Mode** and does not claim that an external AI model produced it.
Different review sets produce different summaries, pros, cons, and themes.

### Production OpenAI Mode

To enable the optional production path, set the secret in Supabase, then deploy
the function again:

```bash
supabase secrets set OPENAI_API_KEY=your-key
supabase functions deploy analyze-reviews
```

The function also uses the standard server-provided `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` values. These are accessed only by the Edge
Function. The function validates the structured response before saving it.

## Database and Security

Row Level Security is enabled for application tables. Products and reviews are
publicly readable. Review and favorite inserts, updates, and deletes require
the authenticated user's ID, and favorites also have a database-level unique
constraint on `(user_id, product_id)`. Profile writes are restricted to the
owning user while display names are publicly readable for review cards.

Only the Supabase publishable/anonymous credential is used by the frontend.
OpenAI and service-role credentials must remain Supabase secrets. Before
deployment, inspect the repository and hosting environment for accidental
secret values and configure Vercel only with the two `VITE_` variables.

## Vercel Deployment

Import the repository into Vercel with the Vite defaults. Set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as production environment
variables, deploy, and verify the Supabase URL allowlist and authentication
redirect URLs. Deploy the Supabase Edge Function separately; Vercel does not
replace the Supabase function runtime.

Before release, run `npm run build` and `npm run lint`, then manually verify
registration, email confirmation behavior, authenticated review/favorite
mutations, and Demo Mode against the target Supabase project.
