# Rollback — chatbot public-form boundary

Rollback must never restore the direct anonymous `quote_requests` insert.

If the new chatbot endpoint causes a functional regression, disable the chatbot route or restore only the previous conversational UI/API behaviour while retaining these invariants:

- no `SUPABASE_ANON_KEY` in `functions/api/ai-chat.js`;
- no direct `/rest/v1/quote_requests` request;
- no claim that a quote was persisted without gateway confirmation;
- no public-form write without Turnstile verification and the `submit-public-form` gateway.
