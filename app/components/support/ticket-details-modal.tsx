'use client';

import { useState, useEffect } from 'react';
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
import { ComicDialog } from '@/components/ui/comic-dialog';
import { Search, User, X, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase/client';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AIAnalysisDialog } from './ai-analysis-dialog';
import ReactMarkdown from 'react-markdown';

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
  objectives?: string[];
}

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AssigneeOption {
  id: string;
  name: string;
  role?: string;
  team?: string;
  avatar_url?: string;
  match_score?: number;
  match_reasoning?: string;
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

interface Hero {
  id: string;
  codename: string;
  powers: string[];
  status: string;
}

interface AIHeroMatch {
  hero_id: string;
  match_score: number;
  match_reasoning: string;
}

interface AnalysisStep {
  message: string;
  action?: () => Promise<void>;
}

const getPriorityVariant = (priority: string): "default" | "destructive" | "secondary" | "outline" | "success" => {
  switch (priority) {
    case 'OMEGA':
      return 'destructive';
    case 'ALPHA':
      return 'destructive';
    case 'BETA':
      return 'secondary';
    case 'GAMMA':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" | "success" => {
  switch (status) {
    case 'NEW':
      return 'default';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'PENDING':
      return 'outline';
    case 'RESOLVED':
      return 'success';
    default:
      return 'secondary';
  }
};

export function TicketDetailsModal({ ticket, open, onOpenChange }: TicketDetailsModalProps) {
  const { updateTicket, assignTicket } = useQueueSystem();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeOptions, setAssigneeOptions] = useState<AssigneeOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assignedHeroDetails, setAssignedHeroDetails] = useState<{ name: string; team?: string } | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<AssigneeOption | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const supabase = createClientComponentClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisMessages, setAnalysisMessages] = useState<string[]>([]);

  // Fetch assigned hero details when ticket changes
  useEffect(() => {
    const fetchAssignedHero = async () => {
      if (ticket?.assigned_to) {
        const { data: hero, error } = await supabase
          .from('profiles')
          .select('codename, real_name, team_affiliations')
          .eq('id', ticket.assigned_to)
          .single();

        if (!error && hero) {
          setAssignedHeroDetails({
            name: hero.codename || hero.real_name || 'Unknown',
            team: Array.isArray(hero.team_affiliations) && hero.team_affiliations.length > 0 
              ? hero.team_affiliations[0] 
              : undefined
          });
        }
      } else {
        setAssignedHeroDetails(null);
      }
    };

    fetchAssignedHero();
  }, [ticket?.assigned_to]);

  // Fetch comments when a ticket is selected
  useEffect(() => {
    const fetchComments = async () => {
      if (!ticket) return;

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
        .eq('ticket_id', ticket.id)
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
  }, [ticket]);

  if (!ticket || !open) return null;

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    console.log('🎫 Updating ticket status:', { ticketId: ticket.id, oldStatus: ticket.status, newStatus });
    try {
      setIsUpdating(true);
      
      // Use updateTicket from useQueueSystem
      const updatedTicket = await updateTicket(ticket.id, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      console.log('🎫 Ticket status updated:', { ticketId: ticket.id, newStatus: updatedTicket.status });
      
      // Update local state immediately
      ticket.status = updatedTicket.status;
      
      toast({ title: 'Status updated successfully' });
    } catch (error) {
      console.error('🎫 Failed to update ticket status:', error);
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

      // Update the ticket priority
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (ticketError) throw ticketError;

      // If this ticket has an associated mission, update its threat level
      if (ticket.metadata?.mission_id) {
        const { error: missionError } = await supabase
          .from('missions')
          .update({ 
            threat_level: getPriorityThreatLevel(newPriority)
          })
          .eq('id', ticket.metadata.mission_id);

        if (missionError) throw missionError;
      }

      // Update local state immediately
      ticket.priority = newPriority;

      toast({ 
        title: 'Priority updated successfully',
        description: `Ticket priority changed to ${newPriority}`
      });
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({ 
        title: 'Failed to update priority',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssigneeSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setAssigneeOptions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in profiles table with basic matching
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, codename, real_name, team_affiliations')
        .or(`codename.ilike.%${query}%, real_name.ilike.%${query}%`)
        .eq('role', 'HERO')
        .eq('status', 'ACTIVE')
        .order('codename')
        .limit(5);

      if (error) throw error;

      // Transform the data to match AssigneeOption interface
      const options: AssigneeOption[] = users.map(user => ({
        id: user.id,
        name: user.codename || user.real_name || 'Unknown',
        role: 'HERO',
        team: Array.isArray(user.team_affiliations) && user.team_affiliations.length > 0 
          ? user.team_affiliations[0] 
          : undefined
      }));

      setAssigneeOptions(options);
    } catch (error) {
      console.error('Error searching assignees:', error);
      toast({
        title: 'Error searching assignees',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssigneeSelect = async (assignee: AssigneeOption) => {
    try {
      setIsUpdating(true);
      
      // Update ticket with assignment and status
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ 
          status: 'IN_PROGRESS',
          assigned_to: assignee.id,
          metadata: {
            ...ticket.metadata,
            assignee_name: assignee.name,
            assignee_team: assignee.team
          }
        })
        .eq('id', ticket.id);

      if (ticketError) throw ticketError;

      // Get the current user (support staff) making the assignment
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Then create a mission for this ticket
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          name: ticket.title,
          status: 'IN_PROGRESS',
          threat_level: getPriorityThreatLevel(ticket.priority),
          objectives: ticket.objectives?.length ? ticket.objectives : [ticket.title],
          casualties: 0,
          collateral_damage: 0,
          metadata: {
            ticket_id: ticket.id,
            created_from_ticket: true,
            created_by: user.id,
            assigned_hero_id: assignee.id,
            assigned_hero_name: assignee.name,
            assigned_hero_team: assignee.team
          }
        })
        .select()
        .single();

      if (missionError) throw missionError;

      // Update local state
      ticket.assigned_to = assignee.id;
      ticket.status = 'IN_PROGRESS';
      setAssignedHeroDetails({
        name: assignee.name,
        team: assignee.team
      });

      toast({ 
        title: 'Ticket assigned successfully',
        description: `Ticket assigned to ${assignee.name} and mission created`,
      });

      // Clear search
      setAssigneeSearch('');
      setAssigneeOptions([]);
      
    } catch (error) {
      console.error('Assignment error:', error);
      toast({ 
        title: 'Failed to assign ticket',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to convert priority to threat level
  const getPriorityThreatLevel = (priority: string): number => {
    switch (priority) {
      case 'OMEGA': return 5;
      case 'ALPHA': return 4;
      case 'BETA': return 3;
      case 'GAMMA': return 2;
      default: return 1;
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
          solution: '',
          internal_notes: ''
        }
      });
      toast({ title: 'Ticket closed successfully' });
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Failed to close ticket',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: commentData, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticket.id,
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
          description: "Your comment has been added to the ticket.",
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

  const handleAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setShowAnalysis(true);
      setAnalysisMessages([]);

      const addMessage = (message: string) => {
        setAnalysisMessages(prev => [...prev, message]);
      };

      addMessage("🔍 Starting ticket analysis...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addMessage("🤖 Consulting AI for threat assessment and hero recommendations...");
      const response = await fetch('/api/tickets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          title: ticket.title,
          description: ticket.description
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.message || data.details || 'Failed to analyze ticket');
      }

      const analysis = data;

      // Update priority
      addMessage(`⚠️ Analyzing threat level... determined as ${analysis.priority_assessment.level}`);
      addMessage(`📝 Reasoning: ${analysis.priority_assessment.reasoning}`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update objectives
      addMessage("🎯 Generating mission objectives...");
      const objectives = analysis.generated_objectives.map((obj: any) => obj.description);
      objectives.forEach((objective: string) => {
        addMessage(`  • ${objective}`);
      });
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update ticket
      addMessage("📋 Updating ticket information...");
      const updatedTicket = await updateTicket(ticket.id, {
        priority: analysis.priority_assessment.level,
        objectives: objectives,
        metadata: {
          ...ticket.metadata,
          ai_analysis: analysis
        }
      });

      // Update local ticket state
      ticket.objectives = updatedTicket.objectives;
      ticket.priority = updatedTicket.priority;
      ticket.metadata = updatedTicket.metadata;

      // Process hero matches
      let selectedHero = null;
      if (analysis.hero_matches?.length > 0) {
        addMessage("🦸 Analyzing potential hero matches...");
        
        // Fetch hero details from the database
        const { data: heroes } = await supabase
          .from('profiles')
          .select('id, codename, powers')
          .in('id', analysis.hero_matches.map((match: AIHeroMatch) => match.hero_id));

        const heroMatches = analysis.hero_matches.map((match: AIHeroMatch) => {
          const heroDetails = heroes?.find(h => h.id === match.hero_id);
          return {
            id: match.hero_id,
            name: heroDetails?.codename || 'Unknown Hero',
            role: 'HERO',
            match_score: match.match_score || 0,
            match_reasoning: match.match_reasoning
          };
        });

        // Find the best match
        const bestMatch = heroMatches.reduce((prev: AssigneeOption, current: AssigneeOption) => 
          ((current.match_score || 0) > (prev.match_score || 0)) ? current : prev
        );
        selectedHero = bestMatch;

        // Always assign the best match
        addMessage(`✨ Assigning to ${bestMatch.name} (Match Score: ${((bestMatch.match_score || 0) * 100).toFixed(1)}%)...`);
        await handleAssigneeSelect(bestMatch);
        addMessage(`✅ Successfully assigned to ${bestMatch.name}`);
        addMessage(`📝 Reasoning: ${bestMatch.match_reasoning}`);
      } else {
        addMessage("⚠️ No suitable hero matches found for this mission");
      }

      addMessage("✅ Analysis complete!");

      // Save analysis history as a comment
      const analysisHistory = [
        "🤖 **AI Analysis Summary**",
        "",
        "**Priority Assessment:**",
        `• Level: ${analysis.priority_assessment.level}`,
        `• Reasoning: ${analysis.priority_assessment.reasoning}`,
        "",
        "**Generated Objectives:**",
        ...objectives.map((obj: string) => `• ${obj}`),
        "",
        selectedHero ? [
          "**Selected Hero:**",
          `• **${selectedHero.name}** (Match Score: ${((selectedHero.match_score || 0) * 100).toFixed(1)}%)`,
          `• **Reasoning:** ${selectedHero.match_reasoning}`
        ].join('\n\n') : "**No suitable hero found**"
      ].join('\n\n');

      // Add the analysis summary as a comment
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: commentData, error: commentError } = await supabase
          .from('ticket_comments')
          .insert({
            ticket_id: ticket.id,
            author_id: session.user.id,
            content: analysisHistory
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

        if (commentData && !commentError) {
          const comment = commentData as unknown as DatabaseTicketComment;
          setComments(prev => [...prev, {
            ...comment,
            author_name: comment.profiles.codename || comment.profiles.real_name || 'Unknown User'
          }]);
        }
      }

    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAnalysisMessages(prev => [
        ...prev,
        "❌ Error: Analysis failed. Please try again.",
        error instanceof Error ? `Error details: ${error.message}` : "Unknown error occurred"
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl dialog-content z-50">
          <DialogHeader className="bg-white dark:bg-gray-800">
            <DialogTitle className="flex items-center justify-between">
              <span>{ticket.title}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                </Button>
                <Select
                  value={ticket.priority}
                  onValueChange={handlePriorityUpdate}
                >
                  <SelectTrigger className="border-0 p-0 hover:bg-accent hover:text-accent-foreground">
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OMEGA" className="flex items-center">
                      <Badge className="bg-red-500 text-white">OMEGA</Badge>
                    </SelectItem>
                    <SelectItem value="ALPHA" className="flex items-center">
                      <Badge className="bg-orange-500 text-white">ALPHA</Badge>
                    </SelectItem>
                    <SelectItem value="BETA" className="flex items-center">
                      <Badge className="bg-yellow-500 text-white">BETA</Badge>
                    </SelectItem>
                    <SelectItem value="GAMMA" className="flex items-center">
                      <Badge className="bg-blue-500 text-white">GAMMA</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusUpdate}
                >
                  <SelectTrigger className="border-0 p-0 hover:bg-accent hover:text-accent-foreground">
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW" className="flex items-center">
                      <Badge className="bg-blue-500 text-white">NEW</Badge>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="flex items-center">
                      <Badge className="bg-yellow-500 text-white">IN PROGRESS</Badge>
                    </SelectItem>
                    <SelectItem value="RESOLVED" className="flex items-center">
                      <Badge className="bg-green-500 text-white">RESOLVED</Badge>
                    </SelectItem>
                    <SelectItem value="ESCALATED" className="flex items-center">
                      <Badge className="bg-purple-500 text-white">ESCALATED</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 bg-white dark:bg-gray-800">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Objectives</h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add new objective..."
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!newObjective.trim()) return;
                      try {
                        setIsUpdating(true);
                        const updatedObjectives = [...(ticket.objectives || []), newObjective.trim()];
                        
                        // Update ticket objectives
                        const updatedTicket = await updateTicket(ticket.id, { objectives: updatedObjectives });
                        
                        // Update local state
                        ticket.objectives = updatedTicket.objectives;

                        // Update corresponding mission objectives
                        const { data: mission, error: missionError } = await supabase
                          .from('missions')
                          .select('id')
                          .eq('metadata->ticket_id', ticket.id)
                          .single();

                        if (mission && !missionError) {
                          await supabase
                            .from('missions')
                            .update({ objectives: updatedObjectives })
                            .eq('id', mission.id);
                        }

                        setNewObjective('');
                        toast({ title: 'Objective added successfully' });
                      } catch (error) {
                        toast({ 
                          title: 'Failed to add objective',
                          variant: 'destructive'
                        });
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={!newObjective.trim() || isUpdating}
                  >
                    Add
                  </Button>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {ticket.objectives?.map((objective, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center justify-between group">
                    <div className="flex items-center gap-2 flex-1">
                      <span>{objective}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={async () => {
                            try {
                              setIsUpdating(true);
                              const updatedObjectives = ticket.objectives?.filter((_, i) => i !== index) || [];
                              
                              // Update ticket objectives
                              const updatedTicket = await updateTicket(ticket.id, { objectives: updatedObjectives });
                              
                              // Update local state
                              ticket.objectives = updatedTicket.objectives;

                              // Update corresponding mission objectives
                              const { data: mission, error: missionError } = await supabase
                                .from('missions')
                                .select('id')
                                .eq('metadata->ticket_id', ticket.id)
                                .single();

                              if (mission && !missionError) {
                                await supabase
                                  .from('missions')
                                  .update({ objectives: updatedObjectives })
                                  .eq('id', mission.id);
                              }

                              toast({ title: 'Objective removed successfully' });
                            } catch (error) {
                              toast({ 
                                title: 'Failed to remove objective',
                                variant: 'destructive'
                              });
                            } finally {
                              setIsUpdating(false);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
                {(!ticket.objectives || ticket.objectives.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No objectives added yet</p>
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <div className="relative">
                <Input
                  placeholder="Type hero name..."
                  value={assigneeSearch}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    handleAssigneeSearch(e.target.value);
                  }}
                  className="w-full"
                  data-testid="assignee-search"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {assigneeOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background rounded-md shadow-lg border">
                    {assigneeOptions.map((assignee) => (
                      <button
                        key={assignee.id}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 bg-white dark:bg-gray-800"
                        onClick={() => handleAssigneeSelect(assignee)}
                      >
                        <User className="h-4 w-4" />
                        <span>{assignee.name}</span>
                        {assignee.team && (
                          <span className="text-muted-foreground text-sm">({assignee.team})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Comments</h4>
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
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleAddComment}
                  className="w-full font-comic"
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AIAnalysisDialog
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
        analysisMessages={analysisMessages}
      />
    </>
  );
} 