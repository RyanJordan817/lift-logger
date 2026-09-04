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
5. Run `npm run dev:all`

## Deployment 
- Frontend: Deployed on Vercel
- Backend: Deploy on Render
- Database: Hosted on Neon

## Status
**Working Features:** Exercise tracking, set logging, 1RM calculations, RPE Tracking

**Comming Soon:** User authentication, progress charts, search/filters for exercises/sets/1RM