# Quote candidate contract

The chatbot may return an optional `quote_candidate` object containing only normalized visitor-provided fields:

- customer name;
- email;
- phone;
- location;
- requested service;
- quote type;
- bandwidth requirement.

This object is not evidence of submission. The response must include `quote_persisted: false` until a separate browser interaction completes Turnstile and receives a successful response from `submit-public-form`.

The UI must not state or imply that the database was updated solely because a candidate object was returned.
