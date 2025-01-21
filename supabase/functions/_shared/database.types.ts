export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      heroes: {
        Row: {
          id: string;
          codename: string;
          real_name: string | null;
          powers: string[];
          clearance_level: number;
          team_affiliations: string[];
          equipment_inventory: string[];
          status: 'ACTIVE' | 'INACTIVE' | 'MIA';
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          type: string;
          status: 'OPERATIONAL' | 'MAINTENANCE' | 'DAMAGED';
          assigned_to: string | null;
          maintenance_history: Json[];
          specifications: Json;
          created_at: string;
          updated_at: string;
        };
      };
      missions: {
        Row: {
          id: string;
          name: string;
          status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
          threat_level: number;
          location: Json;
          assigned_heroes: string[];
          support_staff: string[];
          objectives: string[];
          casualties: number;
          collateral_damage: number;
          after_action_report: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string;
          priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
          status: 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
          type: 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';
          location: Json | null;
          assigned_to: string | null;
          hero: string;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          metadata: Json;
        };
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          description: string;
          severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
          status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
          source: string;
          affected_heroes: string[];
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          metadata: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 