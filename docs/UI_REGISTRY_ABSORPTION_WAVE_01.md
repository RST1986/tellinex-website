# Tellinex Website UI Registry Absorption — Wave 01

Status: CONTROLLED NORMALISATION

Authority order:

`TXS / Quiet Instrument -> Tellinex UI Registry -> Website implementation`

GitHub is the source of truth. 21st.dev is candidate discovery/private distribution only. Direct 21st.dev -> Website source is prohibited.

## Existing Website advantage

The Website already contains a substantial local UI primitive library under `src/app/components/ui/`, including button, card, badge, alert, dialog and navigation-class primitives. Wave 01 therefore does not add another component layer blindly.

The first task is **normalisation**: map the existing primitives against the approved Tellinex UI Registry and TXS rules, retain technically sound Radix/shadcn-class foundations, remove visual drift, and only introduce a new primitive when a real capability gap exists.

## Wave 01 mapping

| Existing Website primitive | Registry/TXS target | Wave 01 action |
|---|---|---|
| `ui/button.tsx` | `tlx-button` | REVIEW + NORMALISE variants/tokens; do not duplicate |
| `ui/card.tsx` | `tlx-surface-card` | REVIEW + NORMALISE surface/radius/spacing |
| `ui/badge.tsx` | `tlx-status-badge` | REVIEW; public marketing/status semantics must not imply operational authority |
| `ui/alert.tsx` | `tlx-alert-banner` | REVIEW + NORMALISE semantic tones |
| `ui/alert-dialog.tsx` | governed dialog pattern | KEEP foundation if accessible; normalise TXS styling |
| navigation primitives | `tlx-navigation` pattern | REVIEW responsive behaviour and TXS hierarchy |
| `AIChatWidget.tsx` | future approved AI interaction pattern | HOLD for dedicated AI UX review; do not source directly from marketplace |

## Candidate intake

A component discovered on 21st.dev remains CANDIDATE until the central Tellinex UI Registry records:

- source URL/name and provenance;
- licence/attribution;
- dependency delta;
- accessibility review;
- responsive review;
- security review;
- TXS / Quiet Instrument normalisation;
- owner and approval decision.

Unknown required evidence is fail-closed: HOLD/REJECT.

## Product safety

Wave 01 changes no public route, no commercial facts, no forms, no security boundary and no Cloudflare deployment configuration. Public production remains unchanged until a later reviewed product PR deliberately consumes normalised components.

## Next implementation slice

1. Normalise `button.tsx`, `card.tsx`, `badge.tsx` and `alert.tsx` against approved TXS tokens.
2. Add visual/a11y regression fixtures for those four primitives.
3. Review `Layout.tsx` navigation against `tlx-navigation` interaction rules.
4. Review `AIChatWidget.tsx` separately so AI advice cannot be confused with operational or commercial authority.
5. Promote only after existing commercial/security release checks remain green.
