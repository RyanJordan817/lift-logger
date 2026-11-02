# Lift Logger

A workout tracking app that calculate progressive overload using the Epley formula and RPE (Rate of Perceived Exertion).

## Live Demo

**Try it yourself!:** [https://lift-logger-three.vercel.app/](https://lift-logger-three.vercel.app/)

## Tech Stack
- React + TypeScript (Vite)
- Express.js backend
- PostgreSQL (Neon)
- Prisma ORM

## Features
- Create and Track exercises
- Log sets with weight, reps, and RPE (Rate of Percieved Exertion)
- Automatic 1RM (One Rep Max) calculation using the Epley Formula
- View your exercise history and track progress over time
- Delete sets with a trash can icon (with confirmation)

## Set up
1. Clone the repo (git clone https://github.com/RyanJordan817/lift-logger.git)
2. cd lift-logger
3. Run `npm install`
4. Add your `DATABASE_URL` to `.env` (e.g. DATABASE_URL=postgressql://...)
5. For a new database, run `npx prisma migrate deploy`
6. Run `npm run dev:all`

The 1RM history is derived from logged sets using the Epley formula. Each history entry is the best estimate for an exercise on a UTC calendar day; deleting a set or exercise updates the derived history.

Existing databases created with `db push` have no migration baseline. Before using migrations on one, verify its schema matches the initial migration and mark that baseline as applied with `npx prisma migrate resolve --applied 20261102160000_init`. Then `npx prisma migrate deploy` applies the follow-up migration, which removes the old `Epley` snapshots and table; logged sets are retained.

## Deployment 
- Frontend: Deployed on Vercel
- Backend: Deploy on Render
- Database: Hosted on Neon

## Status
**Working Features:** Exercise tracking, set logging, 1RM calculations, RPE Tracking, User Authentication

**Comming Soon:** progress charts, search/filters for exercises/sets/1RM