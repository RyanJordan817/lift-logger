import { SetForm } from '../components/SetForm'
import { SetList } from '../components/SetList'
import type { Exercise, LoggedSet } from '../types'
import styles from '../App.module.css'

interface SetsPageProps {
  exercises: Exercise[]
  sets: LoggedSet[]
  selectedExerciseId: string
  loading: boolean
  onExerciseChange: (exerciseId: string) => void
  onAdd: (set: { exerciseId: string; weight: number; reps: number; rpe: number }) => Promise<boolean>
  onDelete: (setId: string) => void
}

export function SetsPage({
  exercises,
  sets,
  selectedExerciseId,
  loading,
  onExerciseChange,
  onAdd,
  onDelete,
}: SetsPageProps) {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>YOUR TRAINING SPACE</p>
        <h1 className={styles.pageTitle}>Sets</h1>
        <p className={styles.description}>Log your workouts and review recent training sets.</p>
      </header>
      {exercises.length === 0 ? (
        <p className={styles.notice}>Add an exercise before logging a set.</p>
      ) : (
        <SetForm
          exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          disabled={loading}
          onExerciseChange={onExerciseChange}
          onSubmit={onAdd}
        />
      )}
      <SetList exercises={exercises} sets={sets} onDelete={onDelete} />
    </section>
  )
}
