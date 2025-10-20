import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  note: string;
  status: string;
  created_at: string;
  from_user: { id: string; name: string; email: string };
  to_user: { id: string; name: string; email: string };
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  currentUserId?: string;
}

export default function TransactionList({ transactions, loading, currentUserId }: TransactionListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Clock className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">No transactions yet</p>
        <p className="text-gray-400">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isSent = transaction.from_user.id === currentUserId;
        const otherParty = isSent ? transaction.to_user : transaction.from_user;
        
        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isSent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {isSent ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isSent ? 'Sent to' : 'Received from'} {otherParty.name}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.note || 'No description'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(transaction.created_at).toLocaleDateString()} • 
                  {new Date(transaction.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className={`text-lg font-semibold ${
              isSent ? 'text-red-600' : 'text-green-600'
            }`}>
              {isSent ? '-' : '+'}₹{transaction.amount.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}