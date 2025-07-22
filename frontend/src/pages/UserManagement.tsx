// frontend/src/pages/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId: string, data: { role?: string; isActive?: boolean }) => {
    try {
      const res = await axios.put(`/api/users/${userId}`, data);
      setUsers(users.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  if (loading) return <p className="text-center text-gray-400">Loading users...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">User Management</h1>
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800/50">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-800/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.username} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUser(user._id, { role: e.target.value })}
                    className="bg-gray-700/50 rounded-md p-1 border-transparent focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleUpdateUser(user._id, { isActive: !user.isActive })}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;