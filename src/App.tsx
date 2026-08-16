import React, { useEffect, useState } from 'react'

// Can't use PrismaClient directly in the browser
// This is a placeholder a proof of concept

interface Exercises {
  id: string
  name: string
  userId: string
  createdAt: string
}

// Main App functionality
function App() {
  const [exercises, setExercises] = useState<Exercises[]>([])
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  const API_BASE = 'http://localhost:3001'

  useEffect(() => {
    fetchExercises()
  }, [])

  // Featching all exercises in db
  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_BASE}/exercises`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      setExercises(data)
      setError('')
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
    setExercises([newExercise, ...exercises])
    setName('')
    setSuccessMsg(`Added ${trimmedName} sucessfully!`)

    setTimeout(() => setSuccessMsg(''), 3000)
  } catch (error) {
    console.error('Add exeercis error', error)
    setError(error instanceof Error ? error.message : 'Failed to add exercise')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ 
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Lift Logger</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your workouts and calculate progressive overlaod.
      </p>

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
              border: '1rem solid #ddd',
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
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-button',
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
  )
}

export default App
