import { useState, type SyntheticEvent } from 'react'
import styles from '../App.module.css'

interface ExerciseFormProps {
  disabled: boolean
  onSubmit: (name: string) => Promise<boolean>
}

export function ExerciseForm({ disabled, onSubmit }: ExerciseFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (await onSubmit(trimmedName)) setName('')
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
    >
      <label className={styles.field}>
        <span className={styles.label}>Exercise name</span>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
          placeholder="e.g. Bench Press"
          maxLength={60}
          required
        />
      </label>
      <button
        className={styles.primaryButton}
        type="submit"
        disabled={disabled || !name.trim()}
      >
        {disabled ? 'Adding...' : 'Add exercise'}
      </button>
    </form>
  )
}
