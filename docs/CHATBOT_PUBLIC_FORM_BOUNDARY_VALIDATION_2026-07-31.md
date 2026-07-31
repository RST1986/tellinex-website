# Validation — chatbot public-form boundary

Expected protected-branch gates:

1. `npm run check:public-form-gateway`
2. `npm run check:chatbot-public-form-boundary`
3. `npm run typecheck`
4. `npm run build`
5. Cloudflare Pages preview deployment

Static negative assertions:

- `/rest/v1/quote_requests` absent from chatbot function;
- `SUPABASE_ANON_KEY` absent from chatbot function;
- direct Supabase client writes to `quote_requests` absent;
- response declares `quote_persisted: false`;
- bounded request validation and origin allowlist present.

The branch must remain production-database neutral. Merging may deploy website code through the repository's Cloudflare integration, but it must not alter Supabase data, grants or secrets.
