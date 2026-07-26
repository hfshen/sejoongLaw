# StayCare Front Page Notes

The frontend exposes a visible purpose note on high-risk or operational pages. The note is not decorative copy. It explains five things before a user acts:

1. who should use the page;
2. what operational problem it solves;
3. which information is entered;
4. what record or next action is created;
5. which government, legal, medical, employer or provider decision remains outside StayCare.

## Page map

| Route | Primary purpose | Main output |
|---|---|---|
| `/staycare/login` | verify ownership of email or phone | authenticated account |
| `/staycare/claim` | match the account to an authorized roster entry | canonical worker ID linkage |
| `/staycare/app` | manage the worker lifecycle | tasks, applications, documents, tickets and alerts |
| `/staycare/account` | maintain +94/+82 contact continuity | verified identity/contact history |
| `/staycare/admin` | process individual operational queues | reviewed and assigned work |
| `/staycare/admin/control-tower` | control 2,000 workers by cohort and arrival wave | aggregate funnel, risk and incident posture |
| `/staycare/admin/roster` | import verified workers and issue invitations | worker records and one-time codes |
| `/staycare/portal` | provide organization-scoped work | minimal assigned worker/application data |
| `/staycare/notes` | explain all pages and boundaries | shared product and operations understanding |

## Writing rules

- Never imply guaranteed recruitment, visa, entry, legal or medical outcomes.
- Separate official authority, StayCare support, employer duty and licensed-provider delivery.
- Explain why sensitive information is needed before collecting it.
- Do not request a full passport number merely to log in or claim an invitation.
- Use action language: current stage, next action, responsible party and due date.
- Sinhala and Tamil require native review before general production.
