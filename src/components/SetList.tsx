import { Trash2 } from 'lucide-react'
import type { Exercise, LoggedSet } from '../types'
import styles from '../App.module.css'

interface SetListProps {
  exercises: Exercise[]
  sets: LoggedSet[]
  onDelete: (setId: string) => void
}

export function SetList({ exercises, sets, onDelete }: SetListProps) {
  const exerciseNames = new Map(
    exercises.map((exercise) => [exercise.id, exercise.name])
  )

  const handleDelete = (set: LoggedSet) => {
    if (
      window.confirm(
        'Delete this logged set? The 1RM estimate for that day may change.'
      )
    ) {
      onDelete(set.id)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="set-list-heading">
      <h2 className={styles.sectionTitle} id="set-list-heading">
        Your sets <span className={styles.count}>{sets.length}</span>
      </h2>
      {sets.length === 0 ? (
        <p className={styles.emptyState}>
          No sets logged yet. Log your first set above.
        </p>
      ) : (
        <ul className={styles.itemList}>
          {sets.map((set) => (
            <li className={styles.listItem} key={set.id}>
              <span className={styles.itemTitle}>
                {exerciseNames.get(set.exerciseId) ?? 'Exercise'} ·{' '}
                {String(set.reps)} × {String(set.weight)} lb · RPE {set.rpe}
              </span>
              <time className={styles.itemMeta} dateTime={set.loggedAt}>
                {new Date(set.loggedAt).toLocaleString()}
              </time>
              <button
                className={styles.deleteButton}
                type="button"
                aria-label={`Delete set: ${String(set.reps)} reps at ${String(set.weight)} pounds`}
                onClick={() => {
                  handleDelete(set)
                }}
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
