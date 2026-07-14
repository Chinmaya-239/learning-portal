import { Link } from "react-router-dom";

export default function VideoCard({ video, percentWatched }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="group block rounded-2xl bg-paper border border-line/50 shadow-card overflow-hidden hover:-translate-y-1 transition-transform duration-200"
    >
      <div className="relative aspect-video overflow-hidden bg-ink-dark">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] font-mono text-gold-light">
          {video.subject}
        </span>
        {percentWatched > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-gold"
              style={{ width: `${Math.min(100, percentWatched)}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-ink leading-snug line-clamp-2">
          {video.title}
        </h3>
        <p className="mt-1 text-xs text-slateink/60">{video.instructor}</p>
      </div>
    </Link>
  );
}
