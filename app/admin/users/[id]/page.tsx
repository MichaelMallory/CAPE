import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, Users, Activity } from 'lucide-react';
import { UserStatusSelect } from './status-select';
import { ClearanceEditor } from './clearance-editor';
import { ActivityLog } from './activity-log';

interface User {
  id: string;
  codename: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MIA';
  clearance_level: number;
  team_affiliations: string[];
  last_active: string;
  metadata: Record<string, unknown>;
}

async function getUser(id: string): Promise<User> {
  const supabase = createServerComponentClient({ cookies });
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    notFound();
  }

  return user;
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser(params.id);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">{user.codename}</h1>
        <UserStatusSelect userId={user.id} initialStatus={user.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="teams">Team Affiliations</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Clearance Level</dt>
                    <dd className="mt-1">
                      <ClearanceEditor
                        userId={user.id}
                        initialLevel={user.clearance_level}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Last Active</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(user.last_active).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <div>
                <h2 className="text-xl font-semibold mb-4">Team Affiliations</h2>
                <div className="flex flex-wrap gap-2">
                  {user.team_affiliations.map((team) => (
                    <Badge key={team} variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Log
                </h2>
                <Suspense fallback={<div>Loading activity...</div>}>
                  <ActivityLog userId={user.id} />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              Send Message
            </Button>
            <Button className="w-full" variant="outline">
              View Equipment
            </Button>
            <Button className="w-full" variant="outline">
              Mission History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 