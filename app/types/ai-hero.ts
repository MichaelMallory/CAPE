import type { Json } from '@/lib/database.types'

export type Priority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA'
export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED'
export type TicketType = 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE'
export type HeroStatus = 'ACTIVE' | 'INACTIVE' | 'MIA'
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED'

export interface GeoLocation {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
  properties?: Record<string, any>
}

export interface Ticket {
  id: string
  title: string
  description: string
  priority: Priority
  status: TicketStatus
  type: TicketType
  location?: GeoLocation
  assignedTo?: string
  hero: string
  created_at: Date
  updated_at: Date
  metadata: Json
  aiAnalysis?: AIAnalysis
}

export interface Hero {
  id: string
  codename: string
  real_name: string
  powers: string[]
  clearance_level: number
  team_affiliations: string[]
  equipment_inventory: string[]
  status: HeroStatus
  metadata: Json
}

export interface Mission {
  id: string
  name: string
  status: MissionStatus
  threat_level: number
  location: GeoLocation
  assigned_heroes: string[]
  support_staff: string[]
  objectives: MissionObjective[]
  casualties: number
  collateral_damage: number
  after_action_report?: string
  ticket_id: string
}

export interface MissionObjective {
  id: string
  description: string
  required_powers: string[]
  success_criteria: string[]
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  mission_id: string
}

export interface AIAnalysis {
  id: string
  ticket_id: string
  priority_assessment: {
    level: Priority
    confidence: number
    reasoning: string
  }
  threat_analysis: {
    summary: string
    required_powers: string[]
    estimated_threat_level: number
  }
  generated_objectives: MissionObjective[]
  hero_matches: HeroMatch[]
  created_at: Date
}

export interface HeroMatch {
  hero_id: string
  match_score: number
  match_reasoning: string
  required_powers_coverage: string[]
} 