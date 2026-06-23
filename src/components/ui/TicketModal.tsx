import React from 'react';

export const TicketModal: React.FC<{ open: boolean; bookingId?: string; onClose: () => void }> = ({ open, bookingId, onClose }) => {
  if (!open || !bookingId) return null;

  const ticketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${bookingId}/ticket`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="glass relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-auto rounded bg-white/90 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Ticket</h3>
          <button onClick={onClose} className="shrink-0 text-sm text-gray-600">Close</button>
        </div>
        <div className="mb-3">
          <iframe title="ticket" src={ticketUrl} className="w-full h-72 border rounded" />
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <a href={ticketUrl} target="_blank" rel="noreferrer" className="rounded bg-indigo-600 px-3 py-2 text-center text-white">Open PDF</a>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} className="rounded bg-gray-100 px-3 py-2">Copy Link</button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
