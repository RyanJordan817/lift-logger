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

// Test endpoint to create an exercise
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

// Test endpoint to get all the exercises
app.get('/exercises', async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany()
        res.json(exercises)
    } catch (error) {
        console.log('GET error:', error)
        res.status(500).json({ error: 'Failed to fetch exersices'})
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
