import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BanknotesIcon, ArrowDownTrayIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import Modal from '../components/Modal';
import AddTransactionForm from '../components/AddTransactionForm';
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Earning' | 'Deposit';
  createdAt: string;
}

const Earnings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // --- THIS IS THE FIX ---
      // The URL now correctly points to the user route for transactions.
      const res = await axios.get('/api/users/me/transactions');
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const { totalEarnings, totalDeposits } = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'Earning') {
        acc.totalEarnings += transaction.amount;
      } else if (transaction.type === 'Deposit') {
        acc.totalDeposits += transaction.amount;
      }
      return acc;
    }, { totalEarnings: 0, totalDeposits: 0 });
  }, [transactions]);
  
  const pendingEarnings = totalEarnings - totalDeposits;

  const handleSuccess = () => {
    setIsModalOpen(false);
    // This doesn't need to refetch all transactions, only the current user's.
    // But for an admin, they might want to see a global list.
    // For now, this is fine.
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-500">Loading history...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (transactions.length === 0) return <p className="text-center text-gray-500">No transactions yet.</p>;

    return (
      <div className="divide-y divide-gray-800/50">
        {transactions.map((transaction) => (
          <div key={transaction._id} className="grid grid-cols-3 p-4 items-center hover:bg-gray-800/40 transition-colors">
            <div className="text-gray-300">
              <p>{format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</p>
              <p className="text-xs text-gray-500">{format(new Date(transaction.createdAt), 'p')}</p>
            </div>
            <div className="text-gray-300">{transaction.description}</div>
            <div className={`text-right font-semibold ${transaction.type === 'Earning' ? 'text-green-400' : 'text-blue-400'}`}>
              {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Transaction">
        <AddTransactionForm onSuccess={handleSuccess} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Earnings</h1>
          {isAdmin && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Transaction
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 flex items-center space-x-4 shadow-lg hover:border-green-500/30 hover:shadow-green-500/10 transition-all">
            <div className="bg-green-500/10 p-3 rounded-full"><BanknotesIcon className="h-8 w-8 text-green-400" /></div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 flex items-center space-x-4 shadow-lg hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all">
            <div className="bg-yellow-500/10 p-3 rounded-full"><ArrowDownTrayIcon className="h-8 w-8 text-yellow-400" /></div>
            <div>
              <p className="text-gray-400 text-sm">Pending Payout</p>
              <p className="text-3xl font-bold text-white">${pendingEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-semibold text-gray-400 p-4 border-b border-gray-800/50">
            <div>Date</div><div>Description</div><div className="text-right">Amount</div>
          </div>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Earnings;