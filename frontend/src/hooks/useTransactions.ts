// frontend/src/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import axios from '../utils/api'; // CHANGED: Use local axios instance

interface Transaction {
  id: string;
  amount: number;
  note: string;
  status: string;
  created_at: string;
  from_user: { id: string; name: string; email: string };
  to_user: { id: string; name: string; email: string };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/transactions/history');
      setTransactions(response.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async (toEmail: string, amount: number, note: string) => {
    setError(null);
    try {
      const response = await axios.post('/api/payments/send-money', {
        toEmail,
        amount,
        note
      });
      await fetchTransactions(); // Refresh transactions
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send money';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    sendMoney,
    refetch: fetchTransactions
  };
}