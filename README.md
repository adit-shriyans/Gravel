# Travel Planner

A full-stack travel planning app built with Next.js. Create trips, add stops, view them on an interactive map, and manage your itinerary with drag-and-drop. Includes authentication (email/password and Google OAuth), trip status tracking, and route visualization.

---

## Features

- **Authentication** — Sign up, sign in (email/password or Google), and secure session handling with JWT
- **Trips** — Create trips, set status (pending, confirmed, completed, cancelled), and filter your list
- **Stops** — Add and manage stops for each trip
- **Map** — Interactive map (Leaflet) with geosearch and routing between stops
- **Startup validation** — Required environment variables are checked at startup so missing config fails fast with a clear error

---

## Tech Stack

| Layer        | Technology                    |
|-------------|--------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Language   | TypeScript                    |
| Database   | MongoDB (Mongoose)            |
| Auth       | NextAuth, JWT, bcrypt         |
| Map        | Leaflet, react-leaflet, OSM   |
| UI         | React, MUI, Tailwind, SASS    |
| Testing    | Jest, ts-jest                 |

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd Gravel
npm install
```

### 2. Environment variables

Create a `.env` or `.env.local` in the project root. The app validates these at startup and will not start if they are missing:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. `mongodb://localhost:27017/map_project`) |
| `JWT_SECRET`  | Yes | Secret for signing JWTs (use a long, random string) |
| `GOOGLE_ID`   | No  | Google OAuth client ID (for “Sign in with Google”) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Same as `GOOGLE_ID` for client-side redirect |

Example:

```env
MONGODB_URI=mongodb://localhost:27017/map_project
JWT_SECRET=your-secret-at-least-32-characters-long
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or log in, then create and manage trips and stops.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Project structure (overview)

```
├── app/
│   ├── api/           # API routes (auth, trip, stop)
│   ├── login/         # Login / sign-up page
│   ├── trip/[id]/     # Trip detail + map
│   └── page.tsx       # Home (trip list)
├── components/        # React components
├── models/            # Mongoose models (User, Trip, etc.)
├── utils/             # Helpers (DB, env validation)
└── next.config.js     # Next config + startup env validation
```

---

## Testing

Unit tests cover the auth API routes (login and register). Required env vars are not validated when `NODE_ENV=test` or under Jest, so tests run without a real `.env`.

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

Test files:

- `app/api/auth/login/__tests__/route.test.ts`
- `app/api/auth/register/__tests__/route.test.ts`

---

## Deployment

1. Set the required environment variables in your hosting provider (Vercel, Railway, etc.).
2. Build and start:

   ```bash
   npm run build
   npm run start
   ```

For [Vercel](https://vercel.com), connect the repo and add `MONGODB_URI` and `JWT_SECRET` in the project’s Environment Variables.

---

## License

Private / educational use.
