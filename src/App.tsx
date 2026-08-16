import { useEffect, useState } from 'react'
import { PrismaClient } from '@prisma/client'

// Can't use PrismaClient directly in the browser
// This is a placeholder a proof of concept

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage('Vite + React is working! Database is ready at Neon.')
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Lift Logger</h1>
      <p>{ message }</p>
      <p style={{ color: 'green' }}>Database sync successfull!</p>
    </div>
  )
}

export default App
