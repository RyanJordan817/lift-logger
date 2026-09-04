/// <reference types="node" />

import express from 'express'
import cors from 'cors'
import { PrismaClient } from  '@prisma/client' //'../generated/prisma/client.js'
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
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
            console.log('Unique constraint error', error)
            res.status(404).json({ error: 'An exercise for this name already exists for user'})
        } else {
            res.status(500).json({ error: 'Failed to create exercise' })
        }
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

// add to Epley DB
app.post('/epley', async (req, res) => {
    try {
        const { exerciseId, oneRM, asOf } = req.body

        const exercise = await prisma.exercise.findUnique({
            where: {id: exerciseId }
        })

        if (!exercise) {
            return res.status(404).json({error: `Failed to find exercise`})
        }

        const epley = await prisma.epley.create({
            data: { 
                exerciseId, 
                oneRM: parseFloat(oneRM), 
                asOf: asOf ? new Date(asOf) : new Date()
            },
        })

        res.json(epley)
    } catch (error) {
        console.log(`Post error: `, error)
        res.status(500).json({error: `Failed to add epley`})
    }
})

app.get('/epley', async (req, res) => {
    try {
        const epleys = await prisma.epley.findMany({
            orderBy: { asOf: 'desc' },
            take: 50,
        })
        
        res.json(epleys)
    } catch (error) {
        console.log("GET error:", error)
        res.status(500).json({error: 'Failed to get all sets'})
    }
})

app.get('/sets/getMax', async (req, res) => {
    try {
        const exerciseId = String(req.query.exerciseId ?? '')

        if (!exerciseId) {
            return res.status(400).json({error: 'exerciseId not specified for Fetch'})
        }

        const sets = await prisma.set.findMany({
            where: { exerciseId },
            select: {
                id: true,
                exerciseId: true,
                weight: true,
                reps: true,
                rpe: true,
                loggedAt: true,
            },
        })

        const bestSet = sets.reduce<typeof sets[number] | null>((best, current) => {
            if (current.weight <= 0 || current.reps <= 0) return best

            const currentOneRM = current.weight * (1 + current.reps / 30)
            const bestOneRM = best ? best.weight * (1 + best.reps / 30) : 0

            return currentOneRM > bestOneRM ? current : best
        }, null)

        const oneRM = bestSet ? bestSet.weight * (1 + bestSet.reps / 30) : null

        res.json({ set: bestSet, oneRM})
    } catch (error) {
        console.log("GET error:", error)
        res.status(500).json({error: 'Failed to get max set'})
    }
})

app.delete('/sets/:id', async (req, res) => {
    try{
        const result = await prisma.set.deleteMany({
            where: { id: req.params.id },
        })

        res.json({ success: true, deleted: result.count > 0 })
    } catch(error) {
        console.log('Delete error:', error)
        res.status(500).json({ error: 'Failed to delete set' })
    }
})

app.delete('/exercises/:id', async (req, res) => {
    try {
        await prisma.exercise.delete({ 
            where: { id: req.params.id } 
        })
        res.json({ success: true})
    } catch (error) {
        console.log('Delete error:', error)
        res.status(500).json({ error: 'Failed to delete exercise'})
    }
})

app.delete('/epley/:id', async (req, res) => {
    try {
        await prisma.epley.delete({ 
            where: { id: req.params.id } 
        })

        res.json({ success: true })
    } catch (error) {
        console.log('Delete error:', error)
        res.status(500).json({ error: 'Failed to delete epley records' })
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
