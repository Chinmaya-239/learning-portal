import { useRef } from "react";

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * A book-spine styled progress rail: watched portion fills like a bookmark
 * ribbon, and every saved bookmark juts out as a small tab you can click to
 * jump straight to that timestamp.
 */
export default function ProgressRail({ duration, currentTime, bookmarks, onSeek }) {
  const railRef = useRef(null);
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleClick = (e) => {
    if (!railRef.current || !duration) return;
    const rect = railRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="w-full pt-5 pb-2">
      <div
        ref={railRef}
        onClick={handleClick}
        className="relative h-2 w-full rounded-full bg-ink-light/40 cursor-pointer group"
      >
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-gold transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-paper border-2 border-gold shadow-card transition-[left] duration-150"
          style={{ left: `${pct}%` }}
        />

        {bookmarks.map((b) => {
          const left = duration > 0 ? (b.timestamp / duration) * 100 : 0;
          return (
            <button
              key={b._id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(b.timestamp);
              }}
              title={`${b.name || "Bookmark"} — ${formatTime(b.timestamp)}`}
              className="tab-marker absolute -top-3 h-5 w-3 -translate-x-1/2 bg-leaf hover:bg-gold-dark transition-colors"
              style={{ left: `${left}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 font-mono text-xs text-paper/70">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export { formatTime };
