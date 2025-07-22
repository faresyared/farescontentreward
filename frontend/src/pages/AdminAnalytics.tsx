// frontend/src/pages/AdminAnalytics.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UsersIcon, MegaphoneIcon, BanknotesIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface AnalyticsData {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string; }> = ({ icon, title, value, color }) => (
  <div className={`bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 flex items-center space-x-4 shadow-lg hover:border-${color}-500/30 hover:shadow-${color}-500/10 transition-all`}>
    <div className={`bg-${color}-500/10 p-3 rounded-full`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/admin/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center text-gray-400">Loading analytics...</p>;
  if (!data) return <p className="text-center text-red-500">Could not load analytics data.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">Platform Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<UsersIcon className="h-8 w-8 text-blue-400"/>}
            title="Total Users"
            value={data.totalUsers}
            color="blue"
        />
         <StatCard 
            icon={<MegaphoneIcon className="h-8 w-8 text-purple-400"/>}
            title="Total Campaigns"
            value={data.totalCampaigns}
            color="purple"
        />
        <StatCard 
            icon={<CheckBadgeIcon className="h-8 w-8 text-green-400"/>}
            title="Active Campaigns"
            value={data.activeCampaigns}
            color="green"
        />
        <StatCard 
            icon={<BanknotesIcon className="h-8 w-8 text-yellow-400"/>}
            title="Total Revenue"
            value={`$${data.totalRevenue.toFixed(2)}`}
            color="yellow"
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;