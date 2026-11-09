import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { sidebarNavItems } from './navConfig'
import { useLiftLogger } from './hooks/useLiftLogger'
import { ExercisesPage } from './pages/ExercisesPage'
import { OneRepMaxPage } from './pages/OneRepMaxPage'
import { SetsPage } from './pages/SetsPage'
import styles from './App.module.css'

function App() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <main className={styles.loading}>Loading Lift Logger...</main>
  }

  if (!isSignedIn) {
    return (
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <p className={styles.eyebrow}>LIFT LOGGER</p>
          <h1 className={styles.pageTitle}>Track your lifts. See your strength grow.</h1>
          <p className={styles.description}>
            Log sets with weight, reps, and RPE, and track estimated one-rep max over time.
            Sign in to start tracking.
          </p>
          <div className={styles.authActions}>
            <SignInButton mode="modal">
              <button className={styles.primaryButton} type="button">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className={styles.secondaryButton} type="button">Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </main>
    )
  }

  return <AuthenticatedApp />
}

function AuthenticatedApp() {
  const {
    exercises,
    sets,
    oneRepMaxHistory,
    selectedExerciseId,
    setSelectedExerciseId,
    loading,
    error,
    success,
    addExercise,
    deleteExercise,
    addSet,
    deleteSet,
  } = useLiftLogger()

  return (
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <strong>Lift Logger</strong>
          <span>Training log</span>
        </div>
        <nav className={styles.navigation} aria-label="Main navigation">
          {sidebarNavItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                className={({ isActive }) =>
                  `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`
                }
                key={item.path}
                to={item.path}
                end
              >
                <Icon className={styles.navIcon} aria-hidden="true" />
                <span>{item.title}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className={styles.userButton}>
          <UserButton />
        </div>
      </aside>

      <main className={styles.mainContent}>
        {error && <p className={styles.errorMessage} role="alert">{error}</p>}
        {success && <p className={styles.successMessage} role="status">{success}</p>}
        <Routes>
          <Route path="/" element={<Navigate to="/exercises" replace />} />
          <Route
            path="/exercises"
            element={
              <ExercisesPage
                exercises={exercises}
                loading={loading}
                onAdd={addExercise}
                onDelete={event => { void deleteExercise(event) }}
              />
            }
          />
          <Route
            path="/sets"
            element={
              <SetsPage
                exercises={exercises}
                sets={sets}
                selectedExerciseId={selectedExerciseId}
                loading={loading}
                onExerciseChange={setSelectedExerciseId}
                onAdd={addSet}
                onDelete={event => { void deleteSet(event) }}
              />
            }
          />
          <Route
            path="/epley"
            element={<OneRepMaxPage exercises={exercises} estimates={oneRepMaxHistory} />}
          />
          <Route path="*" element={<Navigate to="/exercises" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
