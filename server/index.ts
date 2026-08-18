/// <reference types="node" />

import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const app = express()
const port = 3001

// handling database communication
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({adapter})

app.use(cors())
app.use(express.json())

app.get('/', (req, res) =>{
    res.json({
        message: "Lift Logger API is running!",
        endpoints: {
            GET: '/exercises',
            POST: '/exercises'
        }
    })
})

// Endpoint to create an exercise
app.post('/exercises', async (req, res) =>{
    try {
        const { name, userId } = req.body
        const exercise = await prisma.exercise.create({
            data: { name, userId },
        })
        res.json(exercise)
    } catch (error) {
        console.log('Post error:', error)
        res.status(500).json({ error: 'Failed to create exercise' })
    }
})

// Endpoint to get all the exercises
app.get('/exercises', async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany()
        res.json(exercises)
    } catch (error) {
        console.log('GET error:', error)
        res.status(500).json({ error: 'Failed to fetch exersices'})
    }
})

// Endpoint to create a set
app.post('/sets', async (req, res) => {
    try {
        const { exerciseId, weight, reps, rpe } = req.body

        const exercise = await prisma.exercise.findUnique({
            where: { id: exerciseId }
        })

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' })
        }
        
        const set = await prisma.set.create({
            data: { exerciseId, weight, reps, rpe },
        })
        res.json(set)
    } catch (error) {
        console.log('Post error:', error)
        res.status(500).json({error: 'Failed to create set'})
    }
})

// endpoint to get all the sets
app.get('/sets', async (req, res) => {
    try {
        const sets = await prisma.set.findMany({
            orderBy: { loggedAt: 'desc' },
            take: 50,
        })
        res.json(sets)
    } catch (error) {
        console.log("GET error:", error)
        res.status(500).json({error: 'Failed to get all sets'})
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
