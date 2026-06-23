import { useEffect, useState } from 'react';
import { BarChart3, CircleDollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Panel, SectionHeader, StatCard, SkeletonBlock } from '../../components/user/dashboard/TravelUI';

type VendorDashboardResponse = {
  stats?: {
    totalBuses?: number;
    totalBookings?: number;
    revenue?: number;
    activeTrips?: number;
  };
};

function VendorAnalyticsPage() {
  const [data, setData] = useState<VendorDashboardResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiRequest<VendorDashboardResponse>('/vendor/dashboard')
      .then((response) => {
        if (mounted) setData(response);
      })
      .catch(() => undefined)
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <SkeletonBlock className="h-64" />;
  }

  const stats = data.stats || {};

  return (
    <div className="space-y-6">
      <Panel className="border-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Buses" value={stats.totalBuses || 0} icon={<BarChart3 className="h-5 w-5" />} accentClassName="from-cyan-500 via-blue-600 to-indigo-700" trend="Fleet" />
          <StatCard title="Total Bookings" value={stats.totalBookings || 0} icon={<TrendingUp className="h-5 w-5" />} accentClassName="from-emerald-500 via-teal-500 to-cyan-600" trend="Demand" />
          <StatCard title="Revenue" value={stats.revenue || 0} valuePrefix="₹" icon={<CircleDollarSign className="h-5 w-5" />} accentClassName="from-amber-500 via-orange-500 to-rose-500" trend="Money" />
          <StatCard title="Active Trips" value={stats.activeTrips || 0} icon={<Sparkles className="h-5 w-5" />} accentClassName="from-slate-700 via-slate-800 to-slate-900" trend="Live" />
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Vendor analytics" subtitle="Lazy-loaded analytics page showing operational KPIs and revenue pressure points." />
      </Panel>
    </div>
  );
}

export default VendorAnalyticsPage;
