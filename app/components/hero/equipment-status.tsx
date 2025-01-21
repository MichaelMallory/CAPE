import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, AlertTriangle, Wrench } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'MAINTENANCE_REQUIRED' | 'IN_MAINTENANCE' | 'DAMAGED';
  durability: number;
  type: string;
  specifications: Record<string, string>;
  maintenance_history: Array<{
    date: string;
    type: string;
    description: string;
    technician: string;
  }>;
}

const STATUS_COLORS = {
  OPERATIONAL: 'bg-green-500',
  MAINTENANCE_REQUIRED: 'bg-yellow-500',
  IN_MAINTENANCE: 'bg-blue-500',
  DAMAGED: 'bg-red-500',
} as const;

const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export function EquipmentStatus() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch of equipment
    const fetchEquipment = async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('type');

      if (!error && data) {
        setEquipment(data as Equipment[]);
      }
    };

    fetchEquipment();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('equipment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment',
        },
        (payload: RealtimePostgresChangesPayload<Equipment>) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setEquipment((current) => {
              const updated = [...current];
              const index = updated.findIndex((e) => e.id === payload.new.id);
              if (index >= 0) {
                updated[index] = payload.new;
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Handle custom equipment update events (for testing)
    const handleEquipmentUpdate = (event: CustomEvent<{ id: string; status: Equipment['status'] }>) => {
      const { id, status } = event.detail;
      setEquipment((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    };

    window.addEventListener('equipment-update', handleEquipmentUpdate as EventListener);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('equipment-update', handleEquipmentUpdate as EventListener);
    };
  }, [supabase]);

  const handleMaintenanceRequest = async (equipmentId: string, description: string, urgency: typeof URGENCY_LEVELS[number]) => {
    // In a real app, this would create a maintenance ticket
    console.log('Maintenance requested:', { equipmentId, description, urgency });
    setMaintenanceEquipment(null);
  };

  return (
    <section
      aria-label="Equipment Status"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {equipment.map((item) => (
        <Card
          key={item.id}
          role="article"
          className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="font-comic text-lg">{item.name}</span>
              <Badge
                role="status"
                className={STATUS_COLORS[item.status]}
              >
                {item.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Durability</div>
              <Progress
                role="meter"
                aria-label="Equipment Durability"
                value={item.durability}
                max={100}
                className={item.durability < 30 ? 'bg-red-200' : ''}
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium">{item.type}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedEquipment(item)}
              >
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                variant={item.status === 'MAINTENANCE_REQUIRED' ? 'destructive' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMaintenanceEquipment(item)}
              >
                {item.status === 'MAINTENANCE_REQUIRED' ? (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                Request Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Equipment Details Sheet */}
      <Sheet open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Equipment Details</SheetTitle>
          </SheetHeader>
          {selectedEquipment && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <dl className="space-y-2">
                  {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <dt className="font-medium text-muted-foreground">{key}</dt>
                      <dd className="col-span-2">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Maintenance History</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Technician</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEquipment.maintenance_history.map((record, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-2">{record.type}</td>
                          <td className="p-2">{record.technician}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Maintenance Request Dialog */}
      <Dialog open={!!maintenanceEquipment} onOpenChange={() => setMaintenanceEquipment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maintenance Request</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
              const urgency = (form.elements.namedItem('urgency') as HTMLSelectElement).value as typeof URGENCY_LEVELS[number];
              if (maintenanceEquipment) {
                handleMaintenanceRequest(maintenanceEquipment.id, description, urgency);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the maintenance needed..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select name="urgency" defaultValue="MEDIUM">
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMaintenanceEquipment(null)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
} 