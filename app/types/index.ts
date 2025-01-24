export enum Priority {
  ALPHA = 'ALPHA',
  BETA = 'BETA',
  GAMMA = 'GAMMA',
  OMEGA = 'OMEGA'
}

export enum Status {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TicketType {
  MISSION = 'MISSION',
  EQUIPMENT = 'EQUIPMENT',
  SUPPORT = 'SUPPORT',
  OTHER = 'OTHER'
}

export type MissionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ACKNOWLEDGED';

export interface MissionMetadata {
  ticket_id?: string;
  created_by?: string;
  created_from_ticket?: boolean;
  assigned_hero_id?: string;
  assigned_hero_name?: string;
  assigned_hero_team?: string;
  completed_objectives?: string[];
  progress_notes?: string;
  completed_at?: string;
  final_casualties?: number;
  final_collateral_damage?: number;
  final_notes?: string;
  last_stats_update?: string;
}

export interface Mission {
  id: string;
  name: string;
  status: MissionStatus;
  threat_level: number;
  location: string | null;
  objectives: string[];
  casualties: number;
  collateral_damage: number;
  completed_objectives_count: number;
  metadata?: MissionMetadata;
  created_at: string;
  updated_at: string;
} 