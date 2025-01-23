'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useQueueSystem } from '@/hooks/use-queue-system';
import type { TicketPriority, TicketStatus } from '@/hooks/use-queue-system';

interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  last_escalated_at?: string;
  response_time?: string;
  resolution_time?: string;
  tags: string[];
  metadata: Record<string, any>;
}

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailsModal({ ticket, open, onOpenChange }: TicketDetailsModalProps) {
  const { updateTicket, assignTicket } = useQueueSystem();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [solution, setSolution] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');

  if (!ticket) return null;

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    try {
      setIsUpdating(true);
      await updateTicket(ticket.id, { status: newStatus });
      toast({ title: 'Status updated successfully' });
    } catch (error) {
      toast({ 
        title: 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityUpdate = async (newPriority: TicketPriority) => {
    try {
      setIsUpdating(true);
      await updateTicket(ticket.id, { priority: newPriority });
      toast({ title: 'Priority updated successfully' });
    } catch (error) {
      toast({ 
        title: 'Failed to update priority',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignment = async (staffId: string) => {
    try {
      setIsUpdating(true);
      await assignTicket(ticket.id, staffId);
      toast({ title: 'Ticket assigned successfully' });
    } catch (error) {
      toast({ 
        title: 'Failed to assign ticket',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEscalation = async () => {
    try {
      setIsUpdating(true);
      await updateTicket(ticket.id, {
        status: 'ESCALATED',
        last_escalated_at: new Date().toISOString(),
        metadata: {
          ...ticket.metadata,
          escalation_reason: escalationReason,
          escalated_to: selectedSpecialist
        }
      });
      toast({ title: 'Ticket escalated successfully' });
      setEscalationReason('');
      setSelectedSpecialist('');
    } catch (error) {
      toast({ 
        title: 'Failed to escalate ticket',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = async () => {
    try {
      setIsUpdating(true);
      await updateTicket(ticket.id, {
        status: 'CLOSED',
        closed_at: new Date().toISOString(),
        metadata: {
          ...ticket.metadata,
          solution,
          internal_notes: internalNotes
        }
      });
      toast({ title: 'Ticket closed successfully' });
      setSolution('');
      setInternalNotes('');
    } catch (error) {
      toast({ 
        title: 'Failed to close ticket',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground">ID: {ticket.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge>{ticket.priority}</Badge>
              <Badge>{ticket.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Update Status</Label>
              <Select
                onValueChange={handleStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Update Priority</Label>
              <Select
                onValueChange={handlePriorityUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Update Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OMEGA">Omega</SelectItem>
                  <SelectItem value="ALPHA">Alpha</SelectItem>
                  <SelectItem value="BETA">Beta</SelectItem>
                  <SelectItem value="GAMMA">Gamma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Assign Ticket</Label>
            <Select
              onValueChange={handleAssignment}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Staff Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support-team-a">Support Team A</SelectItem>
                <SelectItem value="support-team-b">Support Team B</SelectItem>
                <SelectItem value="specialist-team">Specialist Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Escalation</Label>
            <Textarea
              placeholder="Escalation Reason"
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
            />
            <Select
              value={selectedSpecialist}
              onValueChange={setSelectedSpecialist}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Specialist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment-specialist">Equipment Specialist</SelectItem>
                <SelectItem value="mission-specialist">Mission Specialist</SelectItem>
                <SelectItem value="security-specialist">Security Specialist</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleEscalation}
              disabled={!escalationReason || !selectedSpecialist || isUpdating}
            >
              Confirm Escalation
            </Button>
          </div>

          <div className="space-y-4">
            <Label>Solution Documentation</Label>
            <Textarea
              placeholder="Solution Details"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
            />
            <Textarea
              placeholder="Internal Notes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClose}
                disabled={!solution || !internalNotes || isUpdating}
              >
                Close Ticket
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 