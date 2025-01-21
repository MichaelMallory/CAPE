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
          codename: string
          real_name: string | null
          powers: string[]
          clearance_level: number
          team_affiliations: string[]
          status: 'ACTIVE' | 'INACTIVE' | 'MIA'
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id: string
          codename: string
          real_name?: string | null
          powers?: string[]
          clearance_level?: number
          team_affiliations?: string[]
          status?: 'ACTIVE' | 'INACTIVE' | 'MIA'
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
          status?: 'ACTIVE' | 'INACTIVE' | 'MIA'
          created_at?: string
          updated_at?: string
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