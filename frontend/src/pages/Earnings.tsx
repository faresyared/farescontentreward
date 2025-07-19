// src/pages/Earnings.tsx

import React from 'react';
import { BanknotesIcon, ArrowDownTrayIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

// Define the Transaction type locally, following our successful pattern.
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'Earning' | 'Deposit';
}

// Mock data
const mockTransactions: Transaction[] = [
  { id: 1, date: '2025-07-18', description: 'Payout for "CyberRays" Campaign', amount: 350.00, type: 'Earning' },
  { id: 2, date: '2025-07-15', description: 'User Deposit', amount: 50.00, type: 'Deposit' },
  { id: 3, date: '2025-07-12', description: 'Payout for "Apex Gaming" Clip', amount: 75.50, type: 'Earning' },
  { id: 4, date: '2025-07-10', description: 'Payout for "Nova Watch" UGC', amount: 120.25, type: 'Earning' },
];

const totalEarnings = 545.75;
const pendingEarnings = 120.25;

const isAdmin = true;

const Earnings = () => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-white">Earnings</h1>
        {isAdmin && (
          <button className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
            <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Transaction
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Earnings Card */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 flex items-center space-x-4 shadow-lg hover:border-green-500/30 hover:shadow-green-500/10 transition-all">
          <div className="bg-green-500/10 p-3 rounded-full">
            <BanknotesIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>
        {/* Pending Earnings Card */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 flex items-center space-x-4 shadow-lg hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all">
          <div className="bg-yellow-500/10 p-3 rounded-full">
            <ArrowDownTrayIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Pending Deposit</p>
            <p className="text-3xl font-bold text-white">${pendingEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 text-sm font-semibold text-gray-400 p-4 border-b border-gray-800/50">
          <div>Date</div>
          <div>Description</div>
          <div className="text-right">Amount</div>
        </div>
        {/* Table Body */}
        <div className="divide-y divide-gray-800/50">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="grid grid-cols-3 p-4 items-center hover:bg-gray-800/40 transition-colors">
              <div className="text-gray-300">{transaction.date}</div>
              <div className="text-gray-300">{transaction.description}</div>
              <div className={`text-right font-semibold ${transaction.type === 'Earning' ? 'text-green-400' : 'text-blue-400'}`}>
                {transaction.type === 'Earning' ? '+' : ''}${transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earnings;