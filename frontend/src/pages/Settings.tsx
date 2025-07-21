// frontend/src/pages/Settings.tsx

import React from 'react';
import { CreditCardIcon, KeyIcon, LinkIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-white">Settings</h1>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Connected Accounts */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-4">
            <LinkIcon className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Connected Accounts</h2>
              <p className="text-gray-400 text-sm">Manage your social media connections.</p>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-6">
            <p>Feature coming soon.</p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-4">
            <KeyIcon className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Security</h2>
              <p className="text-gray-400 text-sm">Update your password and manage account security.</p>
            </div>
          </div>
           <div className="text-center text-gray-500 mt-6">
            <p>Feature coming soon.</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-4">
            <CreditCardIcon className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Payment Methods</h2>
              <p className="text-gray-400 text-sm">Manage your payout and deposit accounts.</p>
            </div>
          </div>
           <div className="text-center text-gray-500 mt-6">
            <p>Feature coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;