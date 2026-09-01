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
  exerciseId: string
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
    fetchEpley()
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
        name: trimmedName.toLowerCase(),
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
      //const oneRM = calcOneRepMax(newSet.exerciseId, newSet)
      const result = await fetch(`${API_BASE}/sets/getMax?exerciseId=${encodeURIComponent(selectedExerciseId)}`)

      if (!result.ok) throw new Error(`Failed to fetch: ${result.status}`)
      
      const { oneRM } = await result.json()

      if (oneRM !== null){
        const newEpley = await addEpley(newSet.exerciseId, oneRM)

        if (newEpley) {
          setEpleys(prevEpleys => [newEpley, ...prevEpleys])
        }
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

const fetchEpley = async () => {
  try {
    const res = await fetch(`${API_BASE}/epley`)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const data = await res.json()
    setEpleys(data)
    setError('')
  } catch (error) {
    console.log('Failed to get sets:', error)
    setError(error instanceof Error ? error.message : 'Failed to get sets')
  }
}

const deleteSet = async (setId: string) => {
  if (!window.confirm('Delete this set?')) return
  try {
    const res = await fetch(`${API_BASE}/sets/${setId}`, {
      method: 'DELETE',
    })

    if (!res.ok) throw new Error('Failed to delete set.')

    setSets(sets.filter(s => s.id !== setId))
    setSuccessMsg('Set deleted successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
  } catch (error) {
    console.log('Delete error:', error)
    setError(error instanceof Error ? error.message : 'Failed to delete set')
  }
}

/*const calcOneRepMax = (exerciseId: string, lastestSet?: any) => {

  if (lastestSet) {
    const { weight, reps } = lastestSet
    if (weight > 0 && reps > 0){
      const oneRM = weight * (1 + reps / 30)
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
  
}*/

const getExerciseName = (exerciseId: string) => {
  const exercise = exercises.find(e => e.id === exerciseId)
  return exercise ? exercise.name : 'Unknown'
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

          {/* Exersices List */}
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
      
        {/* Sets List*/}
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.05rem' }}> 
                    {getExerciseName(sets.exerciseId)} - {sets.reps}x{sets.weight} - {sets.rpe}/10
                    <i 
                      className="mdi-alpha-x" 
                      onClick = {() => deleteSet(sets.id)}
                      style = {{
                        cursor: 'pointer',
                        fontSize: '1.3rem',
                        color: '#d32f2f',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffebee'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation() //Prevent event bubbling
                      }
                      }
                    />
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

        {/*Epley list*/}
        <div> 
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem'}}> 
            1 Rep Max ({epleys.length})
          </h2>

          {epleys.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#999'
            }}>
              1RM not logged yet. Add this will populate with sets!
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {epleys.map((epleys, idx) => (
                <li key={epleys.id || idx} 
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
                    {getExerciseName(epleys.exerciseId)} - 1RM: {epleys.oneRM}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#555', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {sets.map((sets, idx) => (
                      sets.exerciseId === epleys.exerciseId && (
                      <span key={sets.id || idx}>
                        Set: {sets.reps}x{sets.weight}
                      </span>
                    )))}
                  </span>  
                  <span style={{ fontSize: '0.85rem', color: "#888" }}>
                    {new Date(epleys.asOf).toLocaleDateString('en-US', {
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
