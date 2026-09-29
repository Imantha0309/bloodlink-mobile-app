# Bloodlink Backend

Express + Sequelize REST API for the Bloodlink emergency blood donation platform. Handles authentication, role-based access for four roles (recipient, donor, hospital, admin), donor-to-recipient matching by blood group compatibility and distance, donation verification, and in-app notifications.

## Requirements

- Node.js 18+
- MySQL 8 (or any Sequelize-supported dialect; set `DB_DIALECT` accordingly)

## Setup

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env with your DB credentials and a real JWT_SECRET
npm run db:reset          # drop + migrate + seed
npm run dev               # http://localhost:4000
```

Check it is alive:

```bash
curl http://localhost:4000/api/health
```

## Seeded accounts

| Role      | Email                    | Password        |
| --------- | ------------------------ | --------------- |
| admin     | admin@bloodlink.test     | `admin1234`     |
| hospital  | hospital@bloodlink.test  | `hospital1234`  |
| donor     | donor@bloodlink.test     | `donor1234`     |
| recipient | recipient@bloodlink.test | `recipient1234` |

## Scripts

| Script                  | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `npm start`             | Run the API                              |
| `npm run dev`           | Run with nodemon                         |
| `npm run db:migrate`    | Apply migrations                         |
| `npm run db:seed`       | Seed demo data                           |
| `npm run db:reset`      | Drop, migrate, seed                      |
| `npm test`              | Jest + supertest                         |

## Tests

`npm test` needs no database or setup — the suite runs against an in-memory SQLite database (`tests/setup.js`). To point the same tests at MySQL, set `DB_DIALECT=mysql` and the usual `DB_*` variables.

Covered:

- `tests/matching.test.js` — blood group compatibility matrix, haversine distance, pagination clamping
- `tests/api.test.js` — health, 404 handling, auth guard, request validation
- `tests/flow.test.js` — full lifecycle: recipient raises a request, donors are matched and notified, a donor accepts, a hospital fulfils the request and records the donation, admin reads stats, and cross-role access is rejected

## Layout

```
src/
├── config/      env, database connection, sequelize instance, constants
├── models/      User, DonorProfile, RecipientProfile, Hospital, BloodRequest,
│                DonorResponse, Verification, Notification, AppSetting
├── services/    auth, recipient, donor, hospital, admin, matching, notification
├── controllers/ thin HTTP layer per role
├── routes/      /api/auth, /api/recipient, /api/donor, /api/hospital, /api/admin
├── middleware/  auth (JWT), rate limits, error handling
├── validators/  body validation schemas
└── utils/       ApiError, response helpers, geo/pagination helpers
database/
├── migrations/  schema history
└── seeders/     demo data
tests/           health/routing/validation and matching unit tests
```

## API overview

All routes are prefixed with `/api`. Every route except `auth/register`, `auth/login` and `health` requires `Authorization: Bearer <token>`.

### Auth
- `POST /auth/register` — body: name, email, password (min 8), phone, role (`recipient|donor|hospital`), optional bloodGroup / hospitalName
- `POST /auth/login` — body: email, password
- `GET /auth/me` — current user + role profile

### Recipient
- `POST /recipient/requests` — create emergency request; runs matching and notifies donors
- `GET /recipient/requests?status=&page=&limit=`
- `GET /recipient/requests/:id` · `GET /recipient/requests/:id/status` · `GET /recipient/requests/:id/donors`
- `PATCH /recipient/requests/:id` · `POST /recipient/requests/:id/cancel`
- `GET /recipient/notifications` · `PATCH /recipient/notifications/:id/read` · `POST /recipient/notifications/read-all`

### Donor
- `GET|PATCH /donor/profile`
- `PUT /donor/availability` — body: `{ isAvailable: boolean }`
- `GET /donor/requests` — matched open requests
- `GET /donor/requests/:id`
- `POST /donor/requests/:id/respond` — body: `{ response: accepted|declined }`
- `GET /donor/notifications`

### Hospital
- `GET /hospital/dashboard`
- `GET /hospital/requests` · `GET /hospital/requests/:id`
- `PATCH /hospital/requests/:id/status` — body: `{ status, hospitalId?, unitsRequired? }`
- `POST /hospital/verifications` — body: `{ donationId, status?, remarks? }` (QR payload)
- `GET /hospital/verifications`

### Admin
- `GET /admin/stats`
- `GET /admin/users?role=&search=` · `PATCH /admin/users/:id/status` · `DELETE /admin/users/:id`
- `PATCH /admin/hospitals/:id/verify`
- `GET /admin/requests` · `PATCH /admin/requests/:id`
- `GET /admin/verifications`
- `GET /admin/settings` · `PUT /admin/settings/:key` · `DELETE /admin/settings/:key`

### Notifications (any role)
- `GET /notifications?unreadOnly=true` · `GET /notifications/unread-count`
- `PATCH /notifications/:id/read` · `POST /notifications/read-all`

## Matching rules

A donor is matched to a request when:

1. Blood groups are compatible (`services/matchingService.js` holds the full donor→recipient table).
2. The donor's `isAvailable` flag is true.
3. The donor is inside the search radius (default 50 km), when the request carries coordinates.

Ties break on longest time since last donation, then shortest distance. Matches create `donor_responses` rows, flip the request to `matching`, and push a notification to each donor.

## Statuses

- Request: `pending → matching → fulfilled`, plus `cancelled` and `expired`
- Donor response: `pending → accepted | declined`
- Verification: `pending → approved | rejected`
