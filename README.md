# BudgetLife 

## Product Vision Statement

**BudgetLife** helps people build healthier spending habits by transforming personal budgeting into a city-building experience, where responsible real-world financial decisions directly shape the growth, success, and visual identity of a virtual city.

## Core Team Members

| Role                 | Name        | GitHub                           |
| -------------------- | ----------- | -------------------------------- |
| Developer & Designer | Arnav Arora | https://github.com/arroarnav     |
| Developer            | Samuel Tang | https://github.com/stango1234556 |
| Developer & Designer | Zoe Chow    | https://github.com/pancakeru     |
| Developer            | Meili Liang | https://github.com/ml8397        |

## Description

BudgetLife is a gamified budgeting application designed for users who want a fun, low-pressure way to manage their money. Inspired by city builder games such as Cities: Skylines and Clash of Clans, and budgeting tools like Rocket Money, the app reframes money management as city management.

Users act as the mayor of a digital city. Each budget category—such as food, housing, or health—is represented as a building within the city. How responsibly users spend their real-world money determines whether these buildings upgrade, stagnate, or decay. Monthly budget outcomes drive city progression, giving users a clear and engaging visual reflection of their financial behavior.

BudgetLife emphasizes non-predatory design, requires no paid currency, and avoids invasive data collection. Its goal is to encourage long-term financial mindfulness through playful, meaningful feedback rather than punishment or pressure.

## Deployed Website

BudgetLife is deployed and available here: [Link](http://159.89.235.75/)

## Building and Testing

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (bundled with Node.js)
- A MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- Optional: [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you want to run everything via `docker compose`

### Clone the repository

```bash
git clone https://github.com/agile-students-spring2026/final-budgetlife.git
cd final-budgetlife
```

### Install dependencies

Install the back-end and front-end dependencies separately:

```bash
# Back-end
cd back-end
npm install

# Front-end
cd ../front-end
npm install
```

### Configure environment variables

The back-end reads its configuration from `back-end/.env`, which is **gitignored** and never copied into Docker images. Create your own copy from the template and fill in the values:

```bash
cp back-end/.env.example back-end/.env
# then edit back-end/.env and paste in your MongoDB connection string
```

The only required variable is `MONGODB_URI`. See [back-end/.env.example](back-end/.env.example) for the full list and defaults.

### Run the app (development mode)

Start the back-end and front-end in **two separate terminals**:

```bash
# Terminal 1 — back-end (http://localhost:3000)
cd back-end
npm run dev

# Terminal 2 — front-end (http://localhost:5173)
cd front-end
npm run dev
```

Open `http://localhost:5173` in your browser.

### Run the app with Docker (alternative)

If you'd rather not install Node locally, you can run the entire stack with Docker Compose. Both services are defined in [docker-compose.yml](docker-compose.yml).

Make sure `back-end/.env` exists first (see [Configure environment variables](#configure-environment-variables)). It is loaded into the back-end container at runtime via `env_file` and is **not** baked into the image.

```bash
docker compose up --build
```

This builds and starts:

- **backend** — Node.js / Express on `http://localhost:3000`
- **frontend** — Vite dev server on `http://localhost:5173`

The front-end container proxies `/api/*` to `http://backend:3000` over the Compose-managed Docker network (configured via the `VITE_API_PROXY` environment variable in [docker-compose.yml](docker-compose.yml)). The back-end continues to talk to your hosted MongoDB (e.g. Atlas) using `MONGODB_URI` from `.env`.

Open `http://localhost:5173` in your browser, the same as the local-dev flow.

To stop everything:

```bash
docker compose down
```

To run in the background:

```bash
docker compose up -d --build
```

To see logs from a running stack:

```bash
docker compose logs -f
```

#### Notes

- `back-end/.env` is excluded from the build context by [back-end/.dockerignore](back-end/.dockerignore), so secrets never end up inside a published image.
- `node_modules`, `.git`, and build artifacts are also excluded from the build context to keep images small and rebuilds fast.
- The Compose file uses two services only; MongoDB is expected to be hosted externally (Atlas or similar). If you ever want a fully containerized DB, add a `mongo` service and point `MONGODB_URI` at `mongodb://db:27017/budgetlife`.

### Seeded test accounts

The back-end ships with a few in-memory users you can log in as while developing. All of them use the password `password123`:

- `alexr`
- `jordy88`
- `caseybuilds`

Newly signed-up users are also stored in memory and will be lost when the back-end process restarts.

### Run the back-end tests

```bash
cd back-end
npm test          # runs all mocha tests
npm run coverage  # runs tests with c8 code-coverage report
```

### Build the front-end for production

```bash
cd front-end
npm run build     # output in front-end/dist
npm run preview   # serve the production build locally
```

## Project History & Contributing

BudgetLife began as an exploration into how game design principles can be applied to real-world behavioral change. The project evolved from a simple budgeting concept into a fully gamified city simulation focused on financial awareness, motivation, and accountability.The project builds on well-established budgeting app patterns while differentiating itself through interactive feedback and playful systems.

CONTRIBUTING.md contains the information about contributing.

## Extra credit

Our team completed all three extra credit deployment options:

- **Docker container deployment:** We set up Docker support for BudgetLife so the app can be run in a containerized environment using Docker Compose.
- **Continuous Integration:** We implemented a GitHub Actions workflow that automatically runs the project build and test process when code is pushed or when a pull request is opened.
- **Continuous Deployment:** We implemented a GitHub Actions Continuous Deployment workflow that deploys updates to our DigitalOcean Droplet after changes are pushed to the deployment branch.

## Additional Documentation

1. [App Map & Wireframes](instructions-0a-app-map-wireframes.md)
2. [Prototyping](instructions-0b-prototyping.md)
3. [Project Setup](instructions-0c-project-setup.md)
4. [Sprint Planning](instructions-0d-sprint-planning.md)
5. [Front-End Development](instructions-1-front-end.md)
6. [Back-End Development](instructions-2-back-end.md)
7. [Database Integration](instructions-3-database.md)
8. [Deployment](instructions-4-deployment.md)
