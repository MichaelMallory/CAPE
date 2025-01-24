'use client';

import { useState, useEffect } from 'react';
import { ComicDialog } from '@/components/ui/comic-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { MissionMetadata } from '@/types';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
  ACKNOWLEDGED: 'bg-gray-500',
} as const;

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

interface MissionDetailsModalProps {
  mission: {
    id: string;
    name: string;
    status: keyof typeof STATUS_COLORS;
    threat_level: number;
    location: string;
    objectives: string[];
    casualties: number;
    collateral_damage: number;
    completed_objectives_count: number;
    metadata?: MissionMetadata & {
      ticket_priority?: keyof typeof PRIORITY_COLORS;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Profile {
  codename: string | null;
  real_name: string | null;
  role: string;
}

interface TicketComment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
  profiles: Profile;
}

type DatabaseTicketComment = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    codename: string | null;
    real_name: string | null;
    role: string;
  };
};

export function MissionDetailsModal({ mission, open, onOpenChange }: MissionDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Update local state when mission changes or modal opens
  useEffect(() => {
    if (mission && open) {
      console.log('Initializing mission modal with data:', {
        missionId: mission.id,
        completedObjectivesCount: mission.completed_objectives_count,
        completedObjectives: mission.metadata?.completed_objectives,
        metadata: mission.metadata
      });
      
      setCompletedObjectives(mission.metadata?.completed_objectives || []);
    }
  }, [mission, open]);

  // Fetch comments when mission changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!mission?.metadata?.ticket_id) return;

      const { data: commentsData, error: commentsError } = await supabase
        .from('ticket_comments')
        .select(`
          id,
          content,
          author_id,
          created_at,
          profiles!inner (
            codename,
            real_name,
            role
          )
        `)
        .eq('ticket_id', mission.metadata.ticket_id)
        .order('created_at', { ascending: true });

      if (!commentsError && commentsData) {
        const typedComments = commentsData as unknown as DatabaseTicketComment[];
        setComments(typedComments.map(comment => ({
          ...comment,
          author_name: comment.profiles.codename || comment.profiles.real_name || 'Unknown User'
        })));
      }
    };

    fetchComments();
  }, [mission?.metadata?.ticket_id]);

  const handleAddComment = async () => {
    if (!mission?.metadata?.ticket_id || !newComment.trim()) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: commentData, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: mission.metadata.ticket_id,
          author_id: session.user.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          author_id,
          created_at,
          profiles!inner (
            codename,
            real_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      if (commentData) {
        const comment = commentData as unknown as DatabaseTicketComment;
        setComments(prev => [...prev, {
          ...comment,
          author_name: comment.profiles.codename || comment.profiles.real_name || 'Unknown User'
        }]);
        setNewComment('');
        toast({
          title: "Comment added",
          description: "Your comment has been added to the mission.",
          className: "font-comic"
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!mission) return null;

  const progress = mission.objectives.length > 0
    ? (mission.completed_objectives_count / mission.objectives.length) * 100
    : 0;

  const isAllObjectivesCompleted = progress === 100;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleMissionComplete = async () => {
    try {
      setIsSubmittingCompletion(true);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the mission status and metadata
      const { error: missionError } = await supabase
        .from('missions')
        .update({
          status: 'COMPLETED',
          metadata: {
            ...mission.metadata,
            completed_objectives: mission.objectives,
            completed_at: new Date().toISOString(),
            final_notes: comments.map(c => c.content).join('\n')
          }
        })
        .eq('id', mission.id);

      if (missionError) throw missionError;

      // If this mission was created from a ticket, update the ticket status
      if (mission.metadata?.ticket_id) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            status: 'COMPLETED',
            metadata: {
              completed_at: new Date().toISOString(),
              completed_by: user.id,
              mission_id: mission.id
            }
          })
          .eq('id', mission.metadata.ticket_id);

        if (ticketError) throw ticketError;
      }

      // Add to activity feed
      const { error: activityError } = await supabase
        .from('hero_activity')
        .insert({
          hero_id: user.id,
          activity_type: 'MISSION_COMPLETED',
          metadata: {
            mission_id: mission.id,
            mission_name: mission.name,
            completed_at: new Date().toISOString(),
            objectives_completed: mission.objectives.length
          }
        });

      if (activityError) throw activityError;

      // Update local state
      setCompletedObjectives(mission.objectives);

      toast({
        title: 'Mission completed',
        description: 'Mission has been marked as completed and is awaiting support acknowledgment.'
      });

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: 'Error completing mission',
        description: 'Failed to complete mission. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  const handleObjectiveToggle = async (objective: string) => {
    try {
      console.log('Toggling objective:', {
        missionId: mission.id,
        objective,
        currentCompleted: completedObjectives,
        isCompleting: !completedObjectives.includes(objective)
      });
      
      setIsUpdating(true);
      
      // Calculate new completed objectives
      const isCompleting = !completedObjectives.includes(objective);
      const newCompletedObjectives = isCompleting
        ? [...completedObjectives, objective]
        : completedObjectives.filter(obj => obj !== objective);
      
      // Update the count
      const newCount = newCompletedObjectives.length;
      const isAllCompleted = newCount === mission.objectives.length;
      
      console.log('New objective state:', {
        newCompletedCount: newCount,
        totalObjectives: mission.objectives.length,
        isAllCompleted,
        newCompletedObjectives
      });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Update mission first
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .update({
          status: isAllCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          completed_objectives_count: newCount,
          metadata: {
            ...mission.metadata,
            completed_objectives: newCompletedObjectives,
            progress_notes: comments.map(c => c.content).join('\n'),
            ...(isAllCompleted ? {
              completed_at: new Date().toISOString()
            } : {})
          }
        })
        .eq('id', mission.id)
        .select();

      if (missionError) {
        console.error('Mission update error:', missionError);
        throw missionError;
      }

      // Update local state immediately after successful mission update
      setCompletedObjectives(newCompletedObjectives);
      
      // If all objectives are completed, update the ticket
      if (isAllCompleted && mission.metadata?.ticket_id) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            status: 'RESOLVED',
            metadata: {
              completed_at: new Date().toISOString(),
              completed_by: user.id,
              mission_id: mission.id
            }
          })
          .eq('id', mission.metadata.ticket_id);

        if (ticketError) {
          console.error('Ticket update error:', ticketError);
          throw ticketError;
        }

        // Add to activity feed
        const { error: activityError } = await supabase
          .from('hero_activity')
          .insert({
            hero_id: user.id,
            activity_type: 'MISSION_COMPLETED',
            metadata: {
              mission_id: mission.id,
              mission_name: mission.name,
              completed_at: new Date().toISOString(),
              objectives_completed: mission.objectives.length
            }
          });

        if (activityError) {
          console.error('Activity feed update error:', activityError);
          throw activityError;
        }
      }
      
      // Update the mission object to reflect new values
      if (mission) {
        mission.status = isAllCompleted ? 'COMPLETED' : 'IN_PROGRESS';
        mission.completed_objectives_count = newCount;
        mission.metadata = {
          ...mission.metadata,
          completed_objectives: newCompletedObjectives,
          progress_notes: comments.map(c => c.content).join('\n'),
          ...(isAllCompleted ? {
            completed_at: new Date().toISOString()
          } : {})
        };
      }

      toast({
        title: 'Progress updated',
        description: isAllCompleted ? 
          'Mission completed! All objectives have been achieved.' :
          'Mission objectives have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating objective:', error);
      // Revert local state on error
      setCompletedObjectives(mission.metadata?.completed_objectives || []);
      toast({
        title: 'Error updating progress',
        description: error.message || 'Failed to update mission objectives. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressNotesUpdate = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('missions')
        .update({
          metadata: {
            ...mission.metadata,
            progress_notes: comments.map(c => c.content).join('\n')
          }
        })
        .eq('id', mission.id);

      if (error) throw error;

      toast({
        title: 'Notes updated',
        description: 'Mission progress notes have been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Error updating notes',
        description: 'Failed to update progress notes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ComicDialog 
      onClose={() => onOpenChange(false)}
      className="w-full max-w-4xl"
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{mission.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={STATUS_COLORS[mission.status]}>
                {mission.status.replace('_', ' ')}
              </Badge>
              <Badge className={cn(
                PRIORITY_COLORS[mission.metadata?.ticket_priority || 'GAMMA'],
                "text-white font-medium"
              )}>
                {mission.metadata?.ticket_priority || 'GAMMA'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Location:</span> {mission.location}
          </div>
          <div>
            <span className="font-medium">Priority:</span>{' '}
            <span className="font-medium text-foreground">
              {mission.metadata?.ticket_priority || 'GAMMA'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            max={100}
            className="h-2"
            indicatorClassName={getProgressColor(progress)}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Mission Objectives</Label>
            <div className="space-y-2">
              {mission.objectives.map((objective) => (
                <div key={objective} className="flex items-center space-x-2">
                  <Checkbox
                    id={objective}
                    checked={completedObjectives.includes(objective)}
                    onCheckedChange={() => handleObjectiveToggle(objective)}
                    disabled={isUpdating}
                  />
                  <Label
                    htmlFor={objective}
                    className={cn(
                      "text-sm font-normal",
                      completedObjectives.includes(objective) && "line-through text-muted-foreground"
                    )}
                  >
                    {objective}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Mission Notes</Label>
              <span className="text-xs text-muted-foreground">{comments.length} comments</span>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-comic text-sm">{comment.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No mission notes yet. Be the first to add a note!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a note about the mission..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleAddComment}
                className="w-full font-comic"
                disabled={!newComment.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {progress === 100 && mission.status !== 'COMPLETED' && (
            <Button
              onClick={handleMissionComplete}
              disabled={isSubmittingCompletion}
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmittingCompletion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Mission
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </ComicDialog>
  );
} 