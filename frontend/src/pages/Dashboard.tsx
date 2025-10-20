// frontend/src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import SendMoneyModal from '../components/SendMoneyModal';
import AddMoneyModal from '../components/AddMoneyModal';
import TransactionList from '../components/TransactionList';
import { Send, Plus, History, User } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Manage your money with ease</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 mb-2">Current Balance</p>
            <p className="text-4xl font-bold mb-4">₹{user?.balance?.toFixed(2)}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setAddMoneyModalOpen(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Money</span>
            </button>
            <button
              onClick={() => setSendModalOpen(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Send Money</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          </div>
        </div>
        
        <TransactionList 
          transactions={transactions} 
          loading={loading} 
          currentUserId={user?.id} 
        />
      </div>

      {/* Modals */}
      <SendMoneyModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
      
      <AddMoneyModal
        isOpen={addMoneyModalOpen}
        onClose={() => setAddMoneyModalOpen(false)}
      />
    </div>
  );
}