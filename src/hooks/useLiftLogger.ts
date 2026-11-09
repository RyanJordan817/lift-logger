import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import type { Exercise, LoggedSet, OneRepMaxEstimate } from '../types'

interface SetInput {
  exerciseId: string
  weight: number
  reps: number
  rpe: number
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function useLiftLogger() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sets, setSets] = useState<LoggedSet[]>([])
  const [oneRepMaxHistory, setOneRepMaxHistory] = useState<OneRepMaxEstimate[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const apiFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getToken()
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)

    return fetch(`${API_BASE}${path}`, { ...init, headers })
  }, [getToken])

  const request = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await apiFetch(path, init)
    const data: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
          ? data.error
          : `Request failed with status ${String(response.status)}`
      throw new Error(message)
    }

    return data as T
  }, [apiFetch])

  const refreshOneRepMaxHistory = useCallback(async () => {
    const history = await request<OneRepMaxEstimate[]>('/epley')
    setOneRepMaxHistory(history)
  }, [request])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    let cancelled = false
    const loadData = async () => {
      try {
        const [exerciseData, setData, history] = await Promise.all([
          request<Exercise[]>('/exercises'),
          request<LoggedSet[]>('/sets'),
          request<OneRepMaxEstimate[]>('/epley'),
        ])
        if (cancelled) return

        setExercises(exerciseData)
        setSets(setData)
        setOneRepMaxHistory(history)
        setSelectedExerciseId(current =>
          exerciseData.some(exercise => exercise.id === current)
            ? current
            : exerciseData[0]?.id ?? ''
        )
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load your training data')
        }
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, request])

  const addExercise = async (name: string): Promise<boolean> => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const exercise = await request<Exercise>('/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim().toLowerCase() }),
      })
      setExercises(current => [exercise, ...current])
      setSelectedExerciseId(exercise.id)
      setSuccess(`Added ${name.trim()} successfully.`)
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to create exercise')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteExercise = async (exerciseId: string) => {
    setError('')
    setSuccess('')
    try {
      await request<{ success: boolean }>(`/exercises/${encodeURIComponent(exerciseId)}`, {
        method: 'DELETE',
      })
      setExercises(current => current.filter(exercise => exercise.id !== exerciseId))
      setSets(current => current.filter(set => set.exerciseId !== exerciseId))
      setSelectedExerciseId(current => current === exerciseId ? '' : current)
      setSuccess('Exercise deleted successfully.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to delete exercise')
      return
    }

    try {
      await refreshOneRepMaxHistory()
    } catch {
      setError('Exercise deleted, but 1RM history could not be refreshed.')
    }
  }

  const addSet = async (setInput: SetInput): Promise<boolean> => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const newSet = await request<LoggedSet>('/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setInput),
      })
      setSets(current => [newSet, ...current])
      setSuccess('Set logged successfully.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to log set')
      return false
    } finally {
      setLoading(false)
    }

    try {
      await refreshOneRepMaxHistory()
    } catch {
      setError('Set logged, but 1RM history could not be refreshed.')
    }
    return true
  }

  const deleteSet = async (setId: string) => {
    setError('')
    setSuccess('')
    try {
      await request<{ success: boolean }>(`/sets/${encodeURIComponent(setId)}`, {
        method: 'DELETE',
      })
      setSets(current => current.filter(set => set.id !== setId))
      setSuccess('Set deleted successfully.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to delete set')
      return
    }

    try {
      await refreshOneRepMaxHistory()
    } catch {
      setError('Set deleted, but 1RM history could not be refreshed.')
    }
  }

  return {
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
  }
}
