/// <reference types="node" />

import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client' //'../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { clerkMiddleware, getAuth } from '@clerk/express'

import { z } from 'zod'
import 'dotenv/config'

const app = express()
const port = Number(process.env.PORT) || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'https://lift-logger-three.vercel.app',
]

// handling database communication
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

const prisma = new PrismaClient({ adapter })

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(express.json())

// Clerk middleware for authentication
app.use(clerkMiddleware())

//------ Auth ---------
const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  res.locals.userId = userId
  next()
}

// -------- Validation ---------------
const id = z.string().min(1, 'is required')

const createExerciseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'is required')
    .max(60, 'must be 60 characters or fewer'),
})

const createSetSchema = z.object({
  exerciseId: id,
  weight: z
    .number()
    .positive('must be greater than 0')
    .max(2000, 'must be 2000 or less'),
  reps: z
    .number()
    .int('must be a whole number')
    .min(1, 'must be at least 1')
    .max(100, 'must be 100 or less'),
  rpe: z
    .number()
    .int('must be a whole number')
    .min(1, 'must be at least 1')
    .max(10, 'must be between 1 and 10'),
})

const exerciseQuerySchema = z.object({
  exerciseId: id,
})

const optionalExerciseQuerySchema = z.object({
  exerciseId: z.string().min(1).optional(),
})

// ----------- helpers --------------

// ensure zod parse into readable messages
const formatZodError = (error: z.ZodError) =>
  error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join('.')}: ${issue.message}`
        : issue.message
    )
    .join('.')

const hasPrismaCode = (error: unknown, code: string) =>
  error instanceof Error &&
  'code' in error &&
  (error as { code?: unknown }).code === code

// eplay formula
const epley1RM = (weight: number, reps: number) => weight * (1 + reps / 30)

// Finds an exercise owned by suigned in user
const findOwnedExercise = (exerciseId: string, userId: string) =>
  prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
  })

// ----------- Endpoints --------------

app.get('/', (req, res) => {
  res.json({
    message: 'Lift Logger API is running!',
    endpoints: {
      GET: '/exercises',
      POST: '/exercises',
    },
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

//Everything following requires a signed-in user
app.use(['/exercises', '/sets', '/epley'], requireUser)

// ------ Exercises -------------
// Create
app.post('/exercises', async (req, res) => {
  const parsed = createExerciseSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }

  try {
    const exercise = await prisma.exercise.create({
      data: {
        name: parsed.data.name,
        userId: res.locals.userId,
      },
    })
    res.status(200).json(exercise)
  } catch (error) {
    if (hasPrismaCode(error, 'P2002')) {
      return res
        .status(409)
        .json({ error: 'An exercise with this name already exists' })
    }
    console.log('Post error:', error)
    res.status(500).json({ error: 'Failed to create exercise' })
  }
})

// Get all
app.get('/exercises', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { userId: res.locals.userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(exercises)
  } catch (error) {
    console.log('GET error:', error)
    res.status(500).json({ error: 'Failed to fetch exersices' })
  }
})

// Delete
app.delete('/exercises/:id', async (req, res) => {
  try {
    const result = await prisma.exercise.deleteMany({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
    })
    if (result.count === 0) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.log('Delete error:', error)
    res.status(500).json({ error: 'Failed to delete exercise' })
  }
})

// --------- Sets -----------------

// Create
app.post('/sets', async (req, res) => {
  const parsed = createSetSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: parsed.data.exerciseId, userId: res.locals.userId },
    })

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    const set = await prisma.set.create({
      data: parsed.data,
    })
    res.status(201).json(set)
  } catch (error) {
    console.log('Post error:', error)
    res.status(500).json({ error: 'Failed to create set' })
  }
})

// Get lastest (optiionally for 1 exercise)
app.get('/sets', async (req, res) => {
  const parsed = optionalExerciseQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }

  try {
    const sets = await prisma.set.findMany({
      where: {
        exercise: { userId: res.locals.userId },
        ...(parsed.data.exerciseId
          ? { exerciseId: parsed.data.exerciseId }
          : {}),
      },
      orderBy: { loggedAt: 'desc' },
      take: 50,
    })
    res.json(sets)
  } catch (error) {
    console.log('GET error:', error)
    res.status(500).json({ error: 'Failed to get all sets' })
  }
})

app.get('/sets/getMax', async (req, res) => {
  const parsed = exerciseQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }

  try {
    const exercise = await findOwnedExercise(
      parsed.data.exerciseId,
      res.locals.userId
    )
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    const sets = await prisma.set.findMany({
      where: { exerciseId: parsed.data.exerciseId },
      select: {
        id: true,
        exerciseId: true,
        weight: true,
        reps: true,
        rpe: true,
        loggedAt: true,
      },
    })

    const bestSet = sets.reduce<(typeof sets)[number] | null>(
      (best, current) => {
        if (current.weight <= 0 || current.reps <= 0) return best

        const currentOneRM = epley1RM(current.weight, current.reps)
        const bestOneRM = best ? epley1RM(best.weight, best.reps) : 0

        return currentOneRM > bestOneRM ? current : best
      },
      null
    )
    const oneRM = bestSet ? epley1RM(bestSet.weight, bestSet.reps) : null

    res.json({ set: bestSet, oneRM })
  } catch (error) {
    console.log('GET error:', error)
    res.status(500).json({ error: 'Failed to get max set' })
  }
})

app.delete('/sets/:id', async (req, res) => {
  try {
    const result = await prisma.set.deleteMany({
      where: { id: req.params.id, exercise: { userId: res.locals.userId } },
    })

    if (result.count === 0) {
      return res.status(404).json({ error: 'Set not found' })
    }

    res.json({ success: true, deleted: true })
  } catch (error) {
    console.log('Delete error:', error)
    res.status(500).json({ error: 'Failed to delete set' })
  }
})

// Derive the best Epley estimate for each exercise and UTC calendar day from its sets.
app.get('/epley', async (req, res) => {
  const parsed = optionalExerciseQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }

  try {
    const sets = await prisma.set.findMany({
      where: {
        exercise: { userId: res.locals.userId },
        ...(parsed.data.exerciseId
          ? { exerciseId: parsed.data.exerciseId }
          : {}),
      },
      select: {
        exerciseId: true,
        weight: true,
        reps: true,
        loggedAt: true,
      },
    })

    const estimatesByDay = new Map<
      string,
      {
        exerciseId: string
        oneRM: number
        asOf: string
        weight: number
        reps: number
      }
    >()

    for (const set of sets) {
      const asOf = set.loggedAt.toISOString().slice(0, 10)
      const key = `${set.exerciseId}:${asOf}`
      const oneRM = epley1RM(set.weight, set.reps)
      const currentBest = estimatesByDay.get(key)

      if (!currentBest || oneRM > currentBest.oneRM) {
        estimatesByDay.set(key, {
          exerciseId: set.exerciseId,
          oneRM,
          asOf,
          weight: set.weight,
          reps: set.reps,
        })
      }
    }

    const estimates = [...estimatesByDay.values()].sort(
      (a, b) => b.asOf.localeCompare(a.asOf) || b.oneRM - a.oneRM
    )

    res.json(estimates)
  } catch (error) {
    console.log('GET error:', error)
    res.status(500).json({ error: 'Failed to calculate 1RM history' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${String(port)}`)
})
