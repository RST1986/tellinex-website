# Future cutover contract — tellinex-website → tellinex.com

DO NOT EXECUTE THIS DOCUMENT.

This is the future canonical commercial website. The temporary/legacy public interest-registration property is `RST1986/Tellinex-landing` until a later, separately authorised cutover.

There are not two competing future canonicals.

## Non-negotiables

- Do not deploy `tellinex-website` to tellinex.com from this batch.
- Do not mutate Cloudflare production, DNS, Netlify, or Supabase remote.
- Do not change production RLS or grants.
- Do not send real customer, WhatsApp, or payment traffic as a test.
- Do not cut over until Claude independent assurance is complete and a named operator approves.

## Preconditions (future)

1. Claude independent assurance of this branch and of P0 `4d34e159`.
2. PR #16 public-form callers composed on this R2 branch without restoring fake success or browser inserts.
3. Legal review of `/privacy` and `/terms`.
4. Approved `PUBLIC_LAUNCH_DATE` or an explicit decision to stay `BUILDING_NETWORK`.
5. Approved pricing/SLA classes before any figure is shown as an offer.
6. Landing-page retirement plan that does not drop interest-registration.
7. TCC remains the only control plane.

## Cutover is a later, separately authorised change

`CUTOVER_PERFORMED` must remain `NO` until that later change is explicitly authorised.
