export type Priority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
export type Status = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
export type TicketType = 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';

export interface Hero {
  id: string;
  codename: string;
  realName: string;
  powers: string[];
  clearanceLevel: number;
  teamAffiliations: string[];
  equipmentInventory: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MIA';
  metadata: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  type: TicketType;
  location?: GeoLocation;
  assignedTo?: string;
  hero: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DAMAGED';
  assignedTo?: string;
  maintenanceHistory: MaintenanceRecord[];
  specifications: Record<string, unknown>;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'ROUTINE' | 'REPAIR' | 'UPGRADE';
  description: string;
  technician: string;
  date: Date;
  cost?: number;
  notes?: string;
} 