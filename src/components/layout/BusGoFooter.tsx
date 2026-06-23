import { Link as RouterLink } from 'react-router-dom';
import { Bus, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const footerSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Contact Us', to: '#' },
      { label: 'Press Kit', to: '#' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Book Tickets', to: '/search-buses' },
      { label: 'Refunds', to: '#' },
      { label: 'Operators', to: '#' },
      { label: 'Offers', to: '/offers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', to: '#' },
      { label: 'Help Center', to: '#' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
    ],
  },
];

type BusGoFooterProps = {
  compact?: boolean;
};

function BusGoFooter(_props: BusGoFooterProps) {
  return (
    <footer className="relative bg-[#0F172A] overflow-hidden">

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Subtle background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-emerald-500/3 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-teal-500/3 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <RouterLink to="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105">
                <Bus className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">BusGo</span>
                <span className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400">Premium Travel</span>
              </div>
            </RouterLink>

            <p className="text-sm leading-relaxed text-slate-400 max-w-sm mb-6">
              India's premium bus ticket booking platform. Search routes, compare fares, reserve seats, and manage your travel — all in one place.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span>support@busgo.app</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span>24/7 customer support</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {[
                { name: 'Twitter', path: 'M18.2 5.2a5.3 5.3 0 0 1 2.4-1.3 11 11 0 0 1-3.5 1.4 5.3 5.3 0 0 0-9 4.8A15 15 0 0 1 3 4.5a5.3 5.3 0 0 0 1.6 7 5 5 0 0 1-2.4-.7v.1a5.3 5.3 0 0 0 4.2 5.2 5 5 0 0 1-2.4.1 5.3 5.3 0 0 0 4.9 3.7A10.6 10.6 0 0 1 3 19.7a15 15 0 0 0 8 2.4c9.6 0 14.8-7.9 14.8-14.8l-.1-.7A10.5 10.5 0 0 0 21 5.2z' },
                { name: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { name: 'Instagram', path: 'M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z' },
                { name: 'Youtube', path: 'M10 15l5.19-3L10 9v6z' },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 hover:-translate-y-0.5"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-2 lg:col-start-auto">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <RouterLink
                      to={link.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-all duration-200 hover:text-emerald-400"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-emerald-400 transition-colors opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA Column */}
          <div className="lg:col-span-2 lg:col-start-auto">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-5">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Get exclusive deals and travel tips delivered to your inbox.
            </p>
            <form className="space-y-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} BusGo. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <RouterLink to="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Terms
              </RouterLink>
              <RouterLink to="/privacy-policy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Privacy
              </RouterLink>
              <span className="text-xs text-slate-600">Made with ❤️ for travelers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default BusGoFooter;
