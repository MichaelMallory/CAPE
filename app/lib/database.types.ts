export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'HERO' | 'SUPPORT' | 'ADMIN'
          codename: string | null
          real_name: string | null
          clearance_level: number
          team_affiliations: string[]
          equipment_inventory: string[]
          status: 'ACTIVE' | 'INACTIVE' | 'MIA'
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id: string
          role: 'HERO' | 'SUPPORT' | 'ADMIN'
          codename?: string | null
          real_name?: string | null
          clearance_level?: number
          team_affiliations?: string[]
          equipment_inventory?: string[]
          status?: 'ACTIVE' | 'INACTIVE' | 'MIA'
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          role?: 'HERO' | 'SUPPORT' | 'ADMIN'
          codename?: string | null
          real_name?: string | null
          clearance_level?: number
          team_affiliations?: string[]
          equipment_inventory?: string[]
          status?: 'ACTIVE' | 'INACTIVE' | 'MIA'
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      heroes: {
        Row: {
          id: string
          codename: string
          real_name: string | null
          powers: string[]
          clearance_level: number
          team_affiliations: string[]
          equipment_inventory: string[]
          status: 'ACTIVE' | 'INACTIVE' | 'MIA'
          role: 'HERO' | 'SUPPORT' | 'ADMIN'
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id: string
          codename: string
          real_name?: string | null
          powers: string[]
          clearance_level: number
          team_affiliations: string[]
          equipment_inventory: string[]
          status: 'ACTIVE' | 'INACTIVE' | 'MIA'
          role: 'HERO' | 'SUPPORT' | 'ADMIN'
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          codename?: string
          real_name?: string | null
          powers?: string[]
          clearance_level?: number
          team_affiliations?: string[]
          equipment_inventory?: string[]
          status?: 'ACTIVE' | 'INACTIVE' | 'MIA'
          role?: 'HERO' | 'SUPPORT' | 'ADMIN'
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      alerts: {
        Row: {
          id: string
          title: string
          message: string
          severity: string
          acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          target_role: 'HERO' | 'SUPPORT' | 'ADMIN' | null
          target_hero: string | null
          related_mission_id: string | null
          related_ticket_id: string | null
          timestamp: string
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          message: string
          severity: string
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          target_role?: 'HERO' | 'SUPPORT' | 'ADMIN' | null
          target_hero?: string | null
          related_mission_id?: string | null
          related_ticket_id?: string | null
          timestamp?: string
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          message?: string
          severity?: string
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          target_role?: 'HERO' | 'SUPPORT' | 'ADMIN' | null
          target_hero?: string | null
          related_mission_id?: string | null
          related_ticket_id?: string | null
          timestamp?: string
          metadata?: Json
        }
      }
      hero_timeline: {
        Row: {
          id: string
          hero_id: string
          action: string
          details: string
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          hero_id: string
          action: string
          details: string
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          hero_id?: string
          action?: string
          details?: string
          created_at?: string
          metadata?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 