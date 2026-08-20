import React, { useEffect, useState } from 'react'

// Can't use PrismaClient directly in the browser
// This is a placeholder a proof of concept

interface Exercises {
  id: string
  name: string
  userId: string
  createdAt: string
}

interface Sets {
  id: string
  exerciseId: string
  weight: number
  reps: number
  rpe: number
  loggedAt: string
}

interface Epley {
  id: string
  execiseId: string
  oneRM: number
  asOf: string
}

// Main App functionality
function App() {
  const [exercises, setExercises] = useState<Exercises[]>([])
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [sets, setSets] = useState<Sets[]>([])
  const [weight, setWeight] = useState<string>('')
  const [reps, setReps] = useState<string>('')
  const [rpe, setRpe] = useState<string>('')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')
  const [epleys, setEpleys] = useState<Epley[]>([])
 
  const API_BASE = 'http://localhost:3001'

  useEffect(() => {
    fetchExercises()
    fetchSets()
  }, [])

  // Featching all exercises in db
  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_BASE}/exercises`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

      const data = await res.json()
      setExercises(data)
      setError('')

      /*if (data.length > 0) {
        setSelectedExerciseId(data.id)
      }*/
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load exercises. Ensure the backend is running!')
    }
  } 

// adding an exercise to the db
const addExercise = async (e: React.FormEvent) => {
  e.preventDefault()
  const trimmedName = name.trim()
  if (!trimmedName) {
    setError("Please enter an exercise name")
    return
  }

  setLoading(true)
  setError('')
  setSuccessMsg('')

  try {
    const res = await fetch(`${API_BASE}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: trimmedName,
        userId: 'test-user'
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create exercise. status: ${res.status}`)
    }

    const newExercise = await res.json()

    console.log(`newExerciseI.id is : ${newExercise.id}`) 
    setSelectedExerciseId(newExercise.id)

    setExercises([newExercise, ...exercises])
    setName('')
    setSuccessMsg(`Added ${trimmedName} sucessfully!`)
    console.log(`Exercise created`)
    setTimeout(() => setSuccessMsg(''), 3000)
  } catch (error) {
    console.error('Add exercis error', error)
    setError(error instanceof Error ? error.message : 'Failed to add exercise')
  } finally {
    setLoading(false)
  }
}

const fetchSets = async () => {
  try {
    const res = await fetch(`${API_BASE}/sets`)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const data = await res.json()
    setSets(data)
    setError('')
  } catch (error) {
    console.log('Failed to get sets:', error)
    setError(error instanceof Error ? error.message : 'Failed to get sets')
  }
}

const addSet = async (e: React.FormEvent) => {
  e.preventDefault()
  
  setLoading(true)
  setError('')
  setSuccessMsg('')

  if (!selectedExerciseId) {
    setError('Please select an exercise to track sets')
    return
  }

  const weightNum = parseFloat(weight)
  const repNum = parseInt(reps)
  const rpeNum = parseInt(rpe)

  try {
    const res = await fetch(`${API_BASE}/sets`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        exerciseId: selectedExerciseId,
        weight: weightNum,
        reps: repNum,
        rpe: rpeNum
      }),
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create set. status: ${res.status}`)
    }

    const newSet = await res.json()
    setSets([newSet, ...sets])
    setWeight('')
    setReps('')
    setRpe('')
    setSuccessMsg(`Set created`)
    console.log(`Set created`)
    setTimeout(() => setSuccessMsg(''), 3000)

    if (newSet) {
      const oneRM = calcOneRepMax(newSet.exerciseId, newSet)

      if (oneRM !== null){
        await addEpley(newSet.exerciseId, oneRM)
      }
    }
  } catch (error){
    console.error('Add set error', error)
    setError(error instanceof Error ? error.message : 'Failed to add set')
  } finally {
    setLoading(false)
  }
}

const addEpley = async (exerciseId: string, oneRM: number) => {
  try {
    const res = await fetch(`${API_BASE}/epley`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          exerciseId: exerciseId,
          oneRM: Math.round(oneRM * 10) / 10,
          asOf: new Date().toISOString()
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create epley. status: ${res.status}`)
    }

    const newEpley = await res.json()
    console.log(`Epley added:`, newEpley)
    return newEpley
  } catch (error){
    console.error('Add elpey error', error)
    setError(error instanceof Error ? error.message : 'Failed to add epley')
    return null
  } 
}

const calcOneRepMax = (exerciseId: string, lastestSet?: any) => {

  if (lastestSet) {
    const { weight, reps } = lastestSet
    if (weight > 0 && reps > 0){
      const oneRM = weight * ((1 + reps) / 30)
      console.log(`1RM for lastest set: ${oneRM.toFixed(1)}`)
      return oneRM
    }
  }

  const setsForExercise = sets.filter(s => s.exerciseId === exerciseId)

  if (setsForExercise.length === 0) {
    console.error(`No sets foundfor exercise ${exerciseId}`)
    return null
  }

  const latest = setsForExercise[setsForExercise.length - 1]

  const { weight, reps } = latest

  if (weight > 0 && reps > 0) {
    const oneRM = weight * ((1 + reps) / 30)
    console.log(`One rep max for ${exerciseId} is ${oneRM.toFixed(1)}`)
    return oneRM
  } 

  return null
  
}

const getExerciseName = (exerciseId: string) => {
  const exercise = exercises.find(e => e.id === exerciseId)
  return exercise ? exercise.name : 'Unknown'
}

const handleClick = (exerciseName: string) => {
  console.log(`Click on ${exerciseName}`)
}

const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
  event.preventDefault()

  await addExercise(event)
  addSet(event)
}

  return (
    <div style={{ 
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Lift Logger</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your workouts and calculate progressive overlaod.
      </p>

     {/* Exercise form*/}
      <form onSubmit={addExercise} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter exercise name (e.g., Bench Press)'
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              transition: 'border-color 0.2s'
            }}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: loading ? '#aaa' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'default' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Adding...' : 'Add Exercise'}
          </button>
        </div>
        {error && (
          <div style= {{ 
            padding: '0.75rem', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '6px',
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.75rem', 
            backgroundColor: '#e8f5e9', 
            color: '#2e7d32', 
            borderRadius: '6px',
            marginBottom: '1rem' 
          }}>
            {successMsg}
          </div>
        )}
      </form>

      {/* Set form */}
      <form onSubmit={addSet} style={{ marginBottom: '2rem'}}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            style={{ 
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          >
            <option value="">Select an exercise</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder='Enter Weight (lbs)'
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              transition: 'border-color 0.2s'
            }}
          />
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder='Enter rep amount'
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              transition: 'border-color 0.2s'
            }}
          />
          <input
            type="text"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder='Enter RPE (Rate of Percieved Effort) from 1-10'
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              transition: 'border-color 0.2s'
            }}
          />
          <button
            type='submit'
            disabled={loading || !selectedExerciseId}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: loading || !selectedExerciseId ? '#aaa' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !selectedExerciseId ? 'defualt' : 'pointer'
            }}
          >
            {loading ? 'Logging...' : 'Log Set'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: '20px'}}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem'}}> 
            Your Exercises ({exercises.length})
          </h2>

          {exercises.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#999'
            }}>
              No exercises logged yet. Add one above!
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {exercises.map((exercises, idx) => (
                <li key={exercises.id || idx} 
                  onClick={() => handleClick(getExerciseName(exercises.id))}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}> 
                    {exercises.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: "#888" }}>
                    {new Date(exercises.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      
        <div> 
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem'}}> 
            Your Sets ({sets.length})
          </h2>

          {sets.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#999'
            }}>
              No sets logged yet. Add one above!
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sets.map((sets, idx) => (
                <li key={sets.id || idx} 
                  style={{
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}> 
                    {getExerciseName(sets.exerciseId)} - {sets.reps}x{sets.weight} - {sets.rpe}/10
                  </span>
                  <span style={{ fontSize: '0.85rem', color: "#888" }}>
                    {new Date(sets.loggedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
