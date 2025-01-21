import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Shield,
  Building2,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceMetrics {
  heroes: {
    total: number;
    available: number;
    onMission: number;
    utilization: number;
  };
  equipment: {
    total: number;
    ready: number;
    inMaintenance: number;
    utilization: number;
  };
  facilities: {
    total: number;
    operational: number;
    underMaintenance: number;
    utilization: number;
  };
}

const MOCK_METRICS: ResourceMetrics = {
  heroes: {
    total: 50,
    available: 20,
    onMission: 30,
    utilization: 75,
  },
  equipment: {
    total: 200,
    ready: 150,
    inMaintenance: 50,
    utilization: 65,
  },
  facilities: {
    total: 10,
    operational: 8,
    underMaintenance: 2,
    utilization: 85,
  },
};

const MOCK_UTILIZATION_DATA = [
  { name: 'Mon', heroes: 65, equipment: 55, facilities: 80 },
  { name: 'Tue', heroes: 75, equipment: 60, facilities: 85 },
  { name: 'Wed', heroes: 85, equipment: 70, facilities: 82 },
  { name: 'Thu', heroes: 70, equipment: 65, facilities: 88 },
  { name: 'Fri', heroes: 60, equipment: 58, facilities: 85 },
  { name: 'Sat', heroes: 55, equipment: 50, facilities: 80 },
  { name: 'Sun', heroes: 50, equipment: 45, facilities: 75 },
];

export function ResourceStatus() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Alerts */}
      <Alert variant="destructive" role="alert">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Low Equipment Availability: 25% of combat gear requires maintenance
        </AlertDescription>
      </Alert>

      {/* Resource Categories */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5" />
              Heroes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Available</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.heroes.available}/{MOCK_METRICS.heroes.total}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>On Mission</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.heroes.onMission}
                </Badge>
              </div>
              <Progress value={MOCK_METRICS.heroes.utilization} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Ready</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.equipment.ready}/{MOCK_METRICS.equipment.total}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>In Maintenance</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.equipment.inMaintenance}
                </Badge>
              </div>
              <Progress value={MOCK_METRICS.equipment.utilization} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="mr-2 h-5 w-5" />
              Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Operational</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.facilities.operational}/{MOCK_METRICS.facilities.total}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Under Maintenance</span>
                <Badge role="status" variant="secondary">
                  {MOCK_METRICS.facilities.underMaintenance}
                </Badge>
              </div>
              <Progress value={MOCK_METRICS.facilities.utilization} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowAllocation(true)}
          className="flex items-center"
        >
          <Activity className="mr-2 h-4 w-4" />
          View Hero Allocation
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowScheduling(true)}
          className="flex items-center"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Resources
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowMetrics(true)}
          className="flex items-center"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          View Metrics
        </Button>
      </div>

      {/* Metrics Dialog */}
      <Dialog open={showMetrics} onOpenChange={setShowMetrics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resource Metrics</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="utilization" className="w-full">
            <TabsList>
              <TabsTrigger value="utilization">Utilization</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="utilization" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_UTILIZATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="heroes" fill="#3b82f6" name="Heroes" />
                  <Bar dataKey="equipment" fill="#10b981" name="Equipment" />
                  <Bar dataKey="facilities" fill="#6366f1" name="Facilities" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            {/* Add other tab contents */}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog open={showAllocation} onOpenChange={setShowAllocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hero Allocation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2 p-4" role="grid">
            {/* Placeholder for allocation timeline */}
            <div className="col-span-7 h-8 bg-blue-500/10 rounded" role="gridcell">
              Captain Thunder - Downtown Patrol
            </div>
            {/* Add more allocation rows */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scheduling Dialog */}
      <Dialog open={showScheduling} onOpenChange={setShowScheduling}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resource Scheduling</DialogTitle>
          </DialogHeader>
          {/* Add scheduling form */}
        </DialogContent>
      </Dialog>
    </div>
  );
} 