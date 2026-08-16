import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const app = express()
const port = 3001

// handling database communication
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({adapter})

app.use(cors())
app.use(express.json())

// Test endpoint to create an exercise
app.post('/exercises', async (req, res) =>{
    try {
        const { name, userId } = req.body
        const exercise = await prisma.exercise.create({
            data: { name, userId },
        })
        res.json(exercise)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create exercise' })
    }
})

// Test endpoint to get all the exercises
app.get('/exercises', async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany()
        res.json(exercises)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exersices'})
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
