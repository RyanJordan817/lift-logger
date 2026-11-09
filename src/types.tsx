import type { ComponentType } from 'react'

export interface NavItem {
  title: string
  path: string
  icon: ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface SidebarProps {
  isInitiallyCollapsed?: boolean
}

export interface Exercise {
  id: string
  name: string
  userId: string
  createdAt: string
}

export interface LoggedSet {
  id: string
  exerciseId: string
  weight: number
  reps: number
  rpe: number
  loggedAt: string
}

export interface OneRepMaxEstimate {
  exerciseId: string
  oneRM: number
  weight: number
  reps: number
  asOf: string
}
