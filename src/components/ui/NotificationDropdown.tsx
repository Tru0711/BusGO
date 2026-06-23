import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    apiRequest('/notifications/user').then((d:any) => setItems(d.notifications || [])).catch(()=>{});
  }, [open]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-2 rounded-full bg-white/60 shadow">🔔</button>
      {open && (
        <div className="glass absolute right-0 z-50 mt-2 max-h-[min(28rem,calc(100vh-7rem))] w-[min(20rem,calc(100vw-2rem))] overflow-auto rounded bg-white/90 p-3 shadow-lg">
          <h4 className="font-semibold mb-2">Notifications</h4>
          <div className="flex flex-col gap-2">
            {items.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
            {items.map((it, idx) => (
              <div key={idx} className="p-2 rounded hover:bg-gray-50">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-gray-500">{it.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
