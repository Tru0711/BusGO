import { useMemo, useState } from 'react';
import { CheckCircle2, Mail, MessageSquare, Phone, Send, UserRound } from 'lucide-react';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new';
  createdAt: string;
};

const storageKey = 'busgoContactMessages';

function ContactPage() {
  const [name, setName] = useState('Demo Traveler');
  const [email, setEmail] = useState('traveler@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [subject, setSubject] = useState('Need help with booking');
  const [message, setMessage] = useState('I want to know more about cancellation and refund support.');
  const [submittedMessage, setSubmittedMessage] = useState<ContactMessage | null>(null);

  const messageCount = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]').length;
    } catch {
      return 0;
    }
  }, [submittedMessage]);

  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    const nextMessage: ContactMessage = {
      id: `MSG-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]') as ContactMessage[];
    localStorage.setItem(storageKey, JSON.stringify([nextMessage, ...existing]));
    setSubmittedMessage(nextMessage);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,1fr)] lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">Contact BusGo</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Send support requests directly to admin.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
            This dummy contact flow stores submissions locally and shows them in the Admin Support page, so you can test the workflow without backend setup.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">
              <Mail className="h-6 w-6 text-teal-600" />
              <p className="mt-4 font-bold text-slate-950 dark:text-white">Email support</p>
              <p className="mt-1 text-sm text-slate-500">support@busgo.app</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">
              <MessageSquare className="h-6 w-6 text-teal-600" />
              <p className="mt-4 font-bold text-slate-950 dark:text-white">Admin inbox</p>
              <p className="mt-1 text-sm text-slate-500">{messageCount} local messages saved</p>
            </div>
          </div>

          {submittedMessage && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Message sent to admin inbox.</p>
                  <p className="mt-1 text-sm">Ticket ID: {submittedMessage.id}. Open `/admin/support` as admin to view it.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submitContact} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Name</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                <UserRound className="h-4 w-4 text-teal-600" />
                <input value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" required />
              </div>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                  <Mail className="h-4 w-4 text-teal-600" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" required />
                </div>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Phone</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                  <Phone className="h-4 w-4 text-teal-600" />
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
                </div>
              </label>
            </div>
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Subject</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Message</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" required />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20">
              <Send className="h-4 w-4" />
              Send to admin
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ContactPage;
