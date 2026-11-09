import { Trash2 } from 'lucide-react'
import type { Exercise } from '../types'
import styles from '../App.module.css'

interface ExerciseListProps {
  exercises: Exercise[]
  onDelete: (exerciseId: string) => void
}

export function ExerciseList({ exercises, onDelete }: ExerciseListProps) {
  const handleDelete = (exercise: Exercise) => {
    if (window.confirm(`Delete ${exercise.name}? Its logged sets will also be deleted.`)) {
      onDelete(exercise.id)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="exercise-list-heading">
      <h2 className={styles.sectionTitle} id="exercise-list-heading">
        Your exercises <span className={styles.count}>{exercises.length}</span>
      </h2>
      {exercises.length === 0 ? (
        <p className={styles.emptyState}>No exercises yet. Add one above to get started.</p>
      ) : (
        <ul className={styles.itemList}>
          {exercises.map(exercise => (
            <li className={styles.listItem} key={exercise.id}>
              <span className={styles.itemTitle}>{exercise.name}</span>
              <time className={styles.itemMeta} dateTime={exercise.createdAt}>
                {new Date(exercise.createdAt).toLocaleDateString()}
              </time>
              <button
                className={styles.deleteButton}
                type="button"
                aria-label={`Delete ${exercise.name}`}
                onClick={() => { handleDelete(exercise) }}
              >
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
