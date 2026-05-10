interface StaleBannerProps {
  date: string;
}

export function StaleBanner({ date }: StaleBannerProps) {
  return (
    <div className="stale-banner" role="status" aria-live="polite">
      <span className="stale-banner__icon">📰</span>
      <span className="stale-banner__text">
        No new articles for today — showing the most up-to-date news from{' '}
        <strong>{date}</strong>.
      </span>
    </div>
  );
}
