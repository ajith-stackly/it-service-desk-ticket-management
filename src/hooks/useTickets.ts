import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import { Ticket } from '../types/ticket';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Make sure JSON Server is running on port 4000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, setTickets, loading, error, refetch: fetchTickets };
}
