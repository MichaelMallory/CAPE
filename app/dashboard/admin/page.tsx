"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Activity, Settings, FileText } from 'lucide-react';
import Link from 'next/link';

const ADMIN_SECTIONS = [
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage hero and support staff accounts',
    icon: Users,
    href: '/dashboard/admin/users',
    color: 'text-blue-500',
  },
  {
    id: 'roles',
    title: 'Role Management',
    description: 'Configure roles and permissions',
    icon: Shield,
    href: '/dashboard/admin/roles',
    color: 'text-purple-500',
  },
  {
    id: 'activity',
    title: 'System Activity',
    description: 'Monitor system-wide activity',
    icon: Activity,
    href: '/dashboard/admin/activity',
    color: 'text-green-500',
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configure global system settings',
    icon: Settings,
    href: '/dashboard/admin/settings',
    color: 'text-orange-500',
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'View and generate system reports',
    icon: FileText,
    href: '/dashboard/admin/reports',
    color: 'text-yellow-500',
  },
] as const;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMIN_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = section.href}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{section.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="quick-access">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Common Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/users/new">
                    <Users className="h-4 w-4 mr-2" />
                    Create New User
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/roles/new">
                    <Shield className="h-4 w-4 mr-2" />
                    Create New Role
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/activity">
                    <Activity className="h-4 w-4 mr-2" />
                    View Recent Activity
                  </Link>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Users</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Missions</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>System Load</span>
                    <span className="font-medium text-green-500">Normal</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/admin/status">
                    View Detailed Status
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 