import { useState, type SyntheticEvent } from 'react'
import type { Exercise } from '../types'
import styles from '../App.module.css'

interface SetFormProps {
  exercises: Exercise[]
  selectedExerciseId: string
  disabled: boolean
  onExerciseChange: (exerciseId: string) => void
  onSubmit: (set: {
    exerciseId: string
    weight: number
    reps: number
    rpe: number
  }) => Promise<boolean>
}

export function SetForm({
  exercises,
  selectedExerciseId,
  disabled,
  onExerciseChange,
  onSubmit,
}: SetFormProps) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rpe, setRpe] = useState('')

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedExerciseId) return

    const saved = await onSubmit({
      exerciseId: selectedExerciseId,
      weight: Number(weight),
      reps: Number(reps),
      rpe: Number(rpe),
    })
    if (saved) {
      setWeight('')
      setReps('')
      setRpe('')
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
    >
      <label className={styles.field}>
        <span className={styles.label}>Exercise</span>
        <select
          className={styles.input}
          value={selectedExerciseId}
          onChange={(event) => {
            onExerciseChange(event.target.value)
          }}
          required
        >
          <option value="">Select an exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Weight (lb)</span>
        <input
          className={styles.input}
          type="number"
          min="0.1"
          max="2000"
          step="any"
          value={weight}
          onChange={(event) => {
            setWeight(event.target.value)
          }}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Reps</span>
        <input
          className={styles.input}
          type="number"
          min="1"
          max="100"
          step="1"
          value={reps}
          onChange={(event) => {
            setReps(event.target.value)
          }}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>RPE (1–10)</span>
        <input
          className={styles.input}
          type="number"
          min="1"
          max="10"
          step="1"
          value={rpe}
          onChange={(event) => {
            setRpe(event.target.value)
          }}
          required
        />
      </label>
      <button
        className={styles.primaryButton}
        type="submit"
        disabled={disabled || !selectedExerciseId}
      >
        {disabled ? 'Logging...' : 'Log set'}
      </button>
    </form>
  )
}
