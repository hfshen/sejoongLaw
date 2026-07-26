# StayCare Sri Lanka 2,000 Operations

## Product definition

StayCare is the roster-controlled workforce lifecycle operating system for Sri Lankan shipbuilding workers moving to Korea. It starts after an authorized roster is confirmed and continues through pre-departure preparation, arrival waves, placement, the first 90 days, employment and stay management, incidents, long-term preparation and return.

StayCare does not replace SLBFE, EPS, HRD Korea, the employer, immigration authorities, banks, telecom providers, remittance providers, medical providers or qualified legal and labor professionals. It orchestrates assignments, deadlines, documents, consent, evidence, status and escalation across them.

## Operating hierarchy

```text
Tenant
└─ Cohort / contract unit
   ├─ Arrival batch / flight wave
   │  ├─ worker roster
   │  ├─ bus and handover
   │  └─ accommodation and placement
   └─ worker lifecycle
      ├─ identities and contact continuity
      ├─ documents and consents
      ├─ applications and official cases
      ├─ tickets and incidents
      ├─ 7/30/60/90-day check-ins
      └─ return plan
```

## Controlled onboarding

1. An authorized manager imports a verified roster.
2. StayCare creates or updates the canonical worker record.
3. A single-use invitation code is generated and stored only as an HMAC hash.
4. The worker verifies an email or +94/+82 mobile number with Supabase OTP.
5. The authenticated account claims the roster entry using invitation code, passport English name and date of birth.
6. The claim is rate-limited, locked after repeated failures and written to the immutable audit log.
7. StayCare generates the worker journey and registers the authenticated contact identity.
8. After arrival, the worker verifies a Korean +82 number and supersedes the previous primary phone without changing the StayCare worker ID.

## Scale gates

### Closed beta: 20–30 workers

- manual provider mode
- real roster and real phone numbers
- one or two arrival waves
- daily operations review
- no identity, authorization or critical deadline incident

### Expansion: 200 workers

- multiple arrival waves
- bus, dormitory and site placement
- measured SLA and staffing load
- verified 90-day retention and ticket volume

### Rollout: 2,000 workers

- wave-based release, never one uncontrolled launch
- load and soak test for OTP, notifications and document uploads
- 24-hour P0 incident response
- multilingual operations and field coordinators
- backup, recovery and incident-response drill

## Key performance indicators

- roster claim success ≥ 98%
- duplicate account rate ≤ 0.5%
- OTP delivery success ≥ 95%
- +94 to +82 contact continuity ≥ 95%
- airport and accommodation handover = 100%
- foreigner-registration initiation = 100%
- insurance omission = 0
- critical deadline omission = 0
- 90-day retention ≥ 90%
- cross-tenant or unauthorized private-data access = 0

## Migration and routes

Apply after migrations 012–017:

```text
supabase/migrations/018_staycare_sri_lanka_operations.sql
```

New routes:

```text
/{locale}/staycare/claim
/{locale}/staycare/account
/{locale}/staycare/notes
/{locale}/staycare/admin/control-tower
/{locale}/staycare/admin/roster
POST /api/staycare/claim
POST /api/staycare/identity/sync
POST /api/staycare/admin/roster/import
```

## Production prerequisites

- verified legal and operating roles for Sejoong, operator, employer, sending/training institutions and providers
- approved Korean, English, Sinhala and Tamil consent documents
- real +94 SMS delivery testing by carrier and fallback policy
- staging migration replay and RLS test
- manager MFA and account recovery procedure
- malware scanning for uploaded files
- provider manual SOP before any API launch
- privacy impact assessment, retention and overseas-transfer review
- backup and recovery drill
