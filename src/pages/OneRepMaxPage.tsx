import { OneRepMaxList } from '../components/OneRepMaxList'
import type { Exercise, OneRepMaxEstimate } from '../types'
import styles from '../App.module.css'

interface OneRepMaxPageProps {
  exercises: Exercise[]
  estimates: OneRepMaxEstimate[]
}

export function OneRepMaxPage({ exercises, estimates }: OneRepMaxPageProps) {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>YOUR TRAINING SPACE</p>
        <h1 className={styles.pageTitle}>1RM history</h1>
        <p className={styles.description}>Track your estimated one-rep max over time.</p>
      </header>
      <OneRepMaxList exercises={exercises} estimates={estimates} />
    </section>
  )
}
