type RouteSkeletonProps = {
  variant: 'dashboard' | 'booking' | 'search' | 'admin' | 'profile' | 'public';
};

const skeletonCard = 'animate-pulse rounded-3xl border border-white/20 bg-white/75 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55';

function ShimmerLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 ${className}`} />;
}

export function RouteSkeleton({ variant }: RouteSkeletonProps) {
  if (variant === 'search') {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${skeletonCard} overflow-hidden p-6`}>
          <ShimmerLine className="h-5 w-40" />
          <ShimmerLine className="mt-4 h-10 w-[72%]" />
          <ShimmerLine className="mt-3 h-4 w-[58%]" />
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <ShimmerLine className="h-14" />
            <ShimmerLine className="h-14" />
            <ShimmerLine className="h-14" />
            <ShimmerLine className="h-14 w-36" />
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className={`${skeletonCard} p-5`}>
            <ShimmerLine className="h-6 w-36" />
            <div className="mt-5 space-y-3">
              <ShimmerLine className="h-12" />
              <ShimmerLine className="h-12" />
              <ShimmerLine className="h-12" />
              <ShimmerLine className="h-12" />
            </div>
          </div>
          <div className="space-y-4">
            <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-48" /><ShimmerLine className="mt-4 h-36 w-full" /></div>
            <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-40" /><ShimmerLine className="mt-4 h-36 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'booking') {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${skeletonCard} p-6`}><ShimmerLine className="h-5 w-40" /><ShimmerLine className="mt-4 h-10 w-72" /><ShimmerLine className="mt-3 h-4 w-[55%]" /></div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.72fr)]">
          <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-48" /><ShimmerLine className="mt-4 h-56 w-full" /></div>
          <div className={`${skeletonCard} p-5`}>
            <ShimmerLine className="h-6 w-40" />
            <div className="mt-4 space-y-3"><ShimmerLine className="h-16" /><ShimmerLine className="h-16" /><ShimmerLine className="h-16" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${skeletonCard} p-6`}><ShimmerLine className="h-5 w-40" /><ShimmerLine className="mt-4 h-10 w-80" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className={`${skeletonCard} p-5`}><ShimmerLine className="h-4 w-24" /><ShimmerLine className="mt-4 h-10 w-20" /></div>)}
        </div>
        <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-52" /><ShimmerLine className="mt-4 h-64 w-full" /></div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${skeletonCard} p-6`}><ShimmerLine className="h-10 w-72" /><ShimmerLine className="mt-3 h-4 w-96" /></div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.72fr)]">
          <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-48" /><ShimmerLine className="mt-4 h-60 w-full" /></div>
          <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-40" /><ShimmerLine className="mt-4 h-40 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-6 w-56" /><ShimmerLine className="mt-4 h-4 w-80" /></div>
      <div className={`${skeletonCard} p-5`}><ShimmerLine className="h-64 w-full" /></div>
    </div>
  );
}

export default RouteSkeleton;
