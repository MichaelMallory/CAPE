import { TicketList } from '@/components/hero/ticket-list';
import { Panel } from '@/components/ui/panel';

export default function TicketsPage() {
  return (
    <div className="container mx-auto py-8">
      <Panel title="Support Tickets">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your support tickets for mission assistance, equipment maintenance, and intelligence reports.
          </p>
        </div>
        <TicketList />
      </Panel>
    </div>
  );
} 