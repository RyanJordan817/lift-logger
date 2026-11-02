import type { Exercise, OneRepMaxEstimate } from '../types'
import styles from '../App.module.css'

interface OneRepMaxListProps {
  exercises: Exercise[]
  estimates: OneRepMaxEstimate[]
}

export function OneRepMaxList({ exercises, estimates }: OneRepMaxListProps) {
  const exerciseNames = new Map(exercises.map(exercise => [exercise.id, exercise.name]))

  return (
    <section className={styles.panel} aria-labelledby="one-rep-max-heading">
      <h2 className={styles.sectionTitle} id="one-rep-max-heading">
        1RM history <span className={styles.count}>{estimates.length}</span>
      </h2>
      <p className={styles.helperText}>
        The best Epley estimate for each exercise on each UTC calendar day, calculated from logged sets.
      </p>
      {estimates.length === 0 ? (
        <p className={styles.emptyState}>No estimates yet. Log a set to calculate one.</p>
      ) : (
        <ul className={styles.itemList}>
          {estimates.map(estimate => (
            <li className={styles.listItem} key={`${estimate.exerciseId}-${estimate.asOf}`}>
              <span className={styles.itemTitle}>
                {exerciseNames.get(estimate.exerciseId) ?? 'Exercise'} · {estimate.oneRM.toFixed(1)} lb
              </span>
              <span className={styles.itemMeta}>
                Best set: {estimate.reps} × {estimate.weight} lb
              </span>
              <time className={styles.itemMeta} dateTime={estimate.asOf}>
                {new Date(`${estimate.asOf}T00:00:00Z`).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
