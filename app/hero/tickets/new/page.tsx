import { CreateTicketForm } from '@/components/hero/create-ticket-form';
import { Panel } from '@/components/ui/panel';

export default function NewTicketPage() {
  return (
    <div className="container mx-auto py-8">
      <Panel title="Create Support Ticket">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Support Ticket</h1>
          <p className="text-muted-foreground">
            Submit a new support ticket for mission assistance, equipment maintenance, or intelligence reports.
          </p>
        </div>
        <CreateTicketForm />
      </Panel>
    </div>
  );
} 