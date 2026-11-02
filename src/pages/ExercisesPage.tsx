import { ExerciseForm } from '../components/ExerciseForm'
import { ExerciseList } from '../components/ExerciseList'
import type { Exercise } from '../types'
import styles from '../App.module.css'

interface ExercisesPageProps {
  exercises: Exercise[]
  loading: boolean
  onAdd: (name: string) => Promise<boolean>
  onDelete: (exerciseId: string) => void
}

export function ExercisesPage({ exercises, loading, onAdd, onDelete }: ExercisesPageProps) {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>YOUR TRAINING SPACE</p>
        <h1 className={styles.pageTitle}>Exercises</h1>
        <p className={styles.description}>Manage the exercises you use to track your training.</p>
      </header>
      <ExerciseForm disabled={loading} onSubmit={onAdd} />
      <ExerciseList exercises={exercises} onDelete={onDelete} />
    </section>
  )
}
