import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

export const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/users/me').then((d:any) => setProfile(d.user || d)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white/60 glass p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl">{(profile?.name || 'U').charAt(0)}</div>
          <div>
            <div className="text-xl font-semibold">{profile?.name}</div>
            <div className="text-sm text-gray-600">{profile?.email}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/70 rounded">
            <div className="text-sm text-gray-500">Saved Passengers</div>
            <div className="mt-2 text-sm">{(profile?.savedPassengers || []).length} saved</div>
          </div>
          <div className="p-4 bg-white/70 rounded">
            <div className="text-sm text-gray-500">Wallet / Rewards</div>
            <div className="mt-2 text-sm">{profile?.wallet?.balance ? `₹${profile.wallet.balance}` : 'No wallet'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;