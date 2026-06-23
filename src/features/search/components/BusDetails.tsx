import { Building2, Image, MapPin, ShieldCheck, Star } from 'lucide-react';
import type { BusResult } from '../searchData';

function BusDetails({ bus }: { bus: BusResult }) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Amenities" icon={ShieldCheck}>
          <div className="flex flex-wrap gap-2">
            {bus.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
                {amenity}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Bus Images" icon={Image}>
          <div className="grid gap-2 sm:grid-cols-3">
            {bus.images.map((image) => (
              <div key={image} className="grid min-h-20 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-slate-950 p-3 text-center text-xs font-bold text-white">
                {image}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Boarding Points" icon={MapPin}>
          <Timeline items={bus.boardingPoints} />
        </Panel>

        <Panel title="Dropping Points" icon={MapPin}>
          <Timeline items={bus.droppingPoints} />
        </Panel>

        <Panel title="Cancellation Policy" icon={ShieldCheck}>
          <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            {bus.cancellationPolicy.map((item) => (
              <li key={item} className="rounded-2xl bg-white p-3 dark:bg-slate-900">{item}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="Operator Information" icon={Building2}>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{bus.operatorInfo}</p>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-bold text-amber-700 dark:bg-slate-900 dark:text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {bus.rating} rating from {bus.reviewCount.toLocaleString('en-IN')} reviews
          </div>
        </Panel>

        <Panel title="Reviews" icon={Star}>
          <div className="grid gap-2">
            {bus.reviews.map((review) => (
              <div key={`${review.name}-${review.text}`} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950 dark:text-white">{review.name}</p>
                  <span className="text-sm font-bold text-amber-600">{review.rating}★</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{review.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof ShieldCheck; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl bg-white p-4 dark:bg-slate-900/70">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
        <Icon className="h-4 w-4 text-teal-600" />
        {title}
      </h4>
      {children}
    </section>
  );
}

function Timeline({ items }: { items: Array<{ name: string; time: string }> }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={`${item.name}-${item.time}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
          <span className="text-sm font-black text-teal-700 dark:text-teal-300">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

export default BusDetails;
