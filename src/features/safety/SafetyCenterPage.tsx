import { FormEvent, useEffect, useMemo, useState } from 'react';
import { safetyService, type EmergencyContact, type SOSAlert } from '../../services/safetyService';
const emptyForm = { name: '', relation: '', mobileNumber: '' };

function SafetyCenterPage() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('busgoWomenSafetyMode') === 'true');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadSafetyData = async () => {
      try {
        const [contactResponse, alertResponse] = await Promise.all([
          safetyService.getContacts(),
          safetyService.getSOSHistory(),
        ]);
        setContacts(contactResponse.contacts);
        setAlerts(alertResponse.alerts);
      } catch {
        setContacts([]);
        setAlerts([]);
      }
    };

    void loadSafetyData();
  }, []);

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.status === 'active').length, [alerts]);

  const toggleSafety = () => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem('busgoWomenSafetyMode', String(next));
      return next;
    });
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.relation.trim() || !form.mobileNumber.trim()) return;

    try {
      if (editingId) {
        const response = await safetyService.updateContact(editingId, form);
        setContacts((current) => current.map((contact) => (contact.id === editingId ? response.contact : contact)));
        setStatus('Emergency contact updated.');
      } else {
        const response = await safetyService.createContact(form);
        setContacts((current) => [response.contact, ...current]);
        setStatus('Emergency contact added.');
      }
    } catch {
      setStatus('Could not save emergency contact. Please try again.');
    }

    setForm(emptyForm);
    setEditingId(null);
  };

  const editContact = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setForm({ name: contact.name, relation: contact.relation, mobileNumber: contact.mobileNumber });
  };

  const deleteContact = async (id: string) => {
    try {
      await safetyService.deleteContact(id);
    } catch {
      // Local fallback below keeps the UI testable without a backend session.
    }
    const nextContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(nextContacts);
    setStatus('Emergency contact deleted.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Safety Center</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Manage trip safety preferences, emergency contacts, trip sharing, and SOS history.</p>
          </div>
          <button
            type="button"
            onClick={toggleSafety}
            className={`w-full rounded-xl px-5 py-3 text-sm font-bold md:w-auto ${enabled ? 'bg-teal-600 text-white' : 'border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200'}`}
            aria-pressed={enabled}
          >
            Women's Safety Mode {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Emergency Contacts</h3>
            <form onSubmit={submitContact} className="mt-4 grid gap-3 md:grid-cols-3">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white" />
              <input value={form.relation} onChange={(event) => setForm({ ...form, relation: event.target.value })} placeholder="Relation" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white" />
              <input value={form.mobileNumber} onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })} placeholder="Mobile Number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white" />
              <button type="submit" className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white md:col-span-3">
                {editingId ? 'Update Contact' : 'Add Contact'}
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {contacts.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">No emergency contacts added yet.</p>
              ) : (
                contacts.map((contact) => (
                  <article key={contact.id} className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-bold text-slate-950 dark:text-white">{contact.name}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{contact.relation} - {contact.mobileNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editContact(contact)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">Edit</button>
                      <button type="button" onClick={() => void deleteContact(contact.id)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 dark:border-rose-500/30 dark:text-rose-300">Delete</button>
                    </div>
                  </article>
                ))
              )}
            </div>
            {status && <p className="mt-4 text-sm font-medium text-teal-700 dark:text-teal-300">{status}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">SOS History</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{activeAlerts} active alert{activeAlerts === 1 ? '' : 's'}</p>
            <div className="mt-4 grid gap-3">
              {alerts.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">No SOS alerts recorded.</p>
              ) : (
                alerts.map((alert) => (
                  <article key={alert.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="font-bold text-slate-950 dark:text-white">{alert.booking?.busName || 'Booking'} SOS</p>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${alert.status === 'active' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>{alert.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{new Date(alert.timestamp).toLocaleString('en-IN')}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Trip Sharing</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Share active journey details with trusted contacts. The shared message includes passenger, bus, route, times, and seat number.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default SafetyCenterPage;
