// frontend/src/components/AddTransactionForm.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface AddTransactionFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    type: 'Earning',
    amount: '',
    description: '',
  });
  const [error, setError] = useState('');

  const { username, type, amount, description } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      // Note: We need to get the userId from the username.
      // For now, we will assume the admin enters the userId directly.
      // In a future step, we can make an API call to find the user by username.
      const transactionData = {
        userId: username, // For now, this is the ID.
        type,
        amount: Number(amount),
        description,
      };
      await axios.post('/api/transactions', transactionData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">User ID</label>
        <input type="text" name="username" value={username} onChange={onChange} required placeholder="Enter the user's ID" className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Type</label>
          <select name="type" value={type} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
            <option>Earning</option>
            <option>Deposit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Amount ($)</label>
          <input type="number" name="amount" value={amount} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <input type="text" name="description" value={description} onChange={onChange} required placeholder="e.g., Payout for 'CyberRays' Campaign" className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
      </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Add Transaction</button>
      </div>
    </form>
  );
};

export default AddTransactionForm;