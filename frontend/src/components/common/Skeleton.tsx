export function SkeletonLine({ w = '100%', h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkeletonCard() {
  return (
    <div className="teacher-card is-skeleton" aria-hidden>
      <div className="skeleton tc-photo" />
      <div className="tc-body">
        <SkeletonLine w="55%" h={18} />
        <SkeletonLine w="40%" />
        <SkeletonLine w="70%" />
        <SkeletonLine w="90%" />
        <SkeletonLine w="35%" h={20} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="teacher-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="container-qh profile-page" aria-hidden>
      <div className="profile-hero">
        <div className="skeleton profile-photo" />
        <div className="profile-info">
          <SkeletonLine w="50%" h={36} />
          <SkeletonLine w="30%" />
          <SkeletonLine w="40%" />
          <SkeletonLine w="90%" />
          <SkeletonLine w="80%" />
          <SkeletonLine w="45%" h={48} r={10} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div aria-hidden>
      <SkeletonLine w="40%" h={30} />
      <div className="stat-grid mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card"><SkeletonLine w="50%" /><SkeletonLine w="70%" h={28} /></div>
        ))}
      </div>
      <div className="panel mt-4"><SkeletonLine w="30%" h={20} /><div className="mt-3"><SkeletonLine h={180} r={10} /></div></div>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="d-flex flex-column gap-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => <SkeletonLine key={i} h={48} r={10} />)}
    </div>
  );
}
