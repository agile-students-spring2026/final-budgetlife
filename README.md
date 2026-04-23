# BudgetLife (working title)

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

## Building and Testing

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (bundled with Node.js)

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

## Additional Documentation

1. [App Map & Wireframes](instructions-0a-app-map-wireframes.md)
2. [Prototyping](instructions-0b-prototyping.md)
3. [Project Setup](instructions-0c-project-setup.md)
4. [Sprint Planning](instructions-0d-sprint-planning.md)
5. [Front-End Development](instructions-1-front-end.md)
6. [Back-End Development](instructions-2-back-end.md)
7. [Database Integration](instructions-3-database.md)
8. [Deployment](instructions-4-deployment.md)
