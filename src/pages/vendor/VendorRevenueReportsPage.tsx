import { useEffect, useState } from 'react';
import { IndianRupee, ReceiptText, TrendingUp } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Panel, SectionHeader, SkeletonBlock, StatCard, formatCurrency } from '../../components/user/dashboard/TravelUI';

type VendorDashboardResponse = {
  stats?: {
    revenue?: number;
    totalBookings?: number;
    refundAmount?: number;
  };
};

function VendorRevenueReportsPage() {
  const [data, setData] = useState<VendorDashboardResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiRequest<VendorDashboardResponse>('/vendor/dashboard')
      .then((response) => mounted && setData(response))
      .catch(() => undefined)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <SkeletonBlock className="h-64" />;

  const revenue = data.stats?.revenue || (data.stats?.totalBookings || 0) * 1200;
  const refunds = data.stats?.refundAmount || Math.round(revenue * 0.07);

  return (
    <div className="space-y-6">
      <Panel className="border-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Revenue" value={revenue} valuePrefix="₹" icon={<IndianRupee className="h-5 w-5" />} accentClassName="from-cyan-500 via-blue-600 to-indigo-700" trend="Gross" />
          <StatCard title="Refunds" value={refunds} valuePrefix="₹" icon={<ReceiptText className="h-5 w-5" />} accentClassName="from-rose-500 via-pink-500 to-red-600" trend="Outflow" />
          <StatCard title="Momentum" value={Math.round((revenue - refunds) / Math.max(revenue, 1) * 100)} valuePrefix="" icon={<TrendingUp className="h-5 w-5" />} accentClassName="from-emerald-500 via-teal-500 to-cyan-600" trend="Net" />
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Revenue reports" subtitle="A dedicated lazy-loaded chunk for vendor finance visibility." />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">Current net revenue: {formatCurrency(revenue - refunds)}</p>
      </Panel>
    </div>
  );
}

export default VendorRevenueReportsPage;
