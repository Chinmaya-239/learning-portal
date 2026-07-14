import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import VideoCard from "../components/VideoCard";
import { formatTime } from "../components/ProgressRail";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [subject, setSubject] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [videosRes, cwRes, recentRes] = await Promise.all([
          api.get("/videos"),
          api.get("/videos/continue-watching"),
          api.get("/videos/recently-watched"),
        ]);
        setVideos(videosRes.data.videos);
        setContinueWatching(cwRes.data.items);

        const map = {};
        recentRes.data.items.forEach((p) => {
          map[p.video._id] = p.percentWatched;
        });
        setProgressMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subjects = ["All", ...new Set(videos.map((v) => v.subject))];
  const filtered =
    subject === "All" ? videos : videos.filter((v) => v.subject === subject);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-paper/70">Loading your library…</p>
        ) : (
          <>
            {continueWatching.length > 0 && (
              <section className="mb-12">
                <h2 className="font-display text-2xl text-paper mb-4">Continue watching</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {continueWatching.map((p) => (
                    <Link
                      key={p._id}
                      to={`/watch/${p.video._id}`}
                      className="shrink-0 w-64 rounded-xl bg-paper border border-line/50 overflow-hidden shadow-card hover:-translate-y-1 transition-transform"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={p.video.thumbnail}
                          alt={p.video.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${p.percentWatched}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-ink truncate">
                          {p.video.title}
                        </p>
                        <p className="text-xs font-mono text-slateink/60">
                          Resume at {formatTime(p.lastPosition)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl text-paper">Your library</h2>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`text-xs font-mono uppercase tracking-wide rounded-full px-3.5 py-1.5 border transition-colors ${
                      subject === s
                        ? "bg-gold border-gold text-ink"
                        : "border-white/20 text-paper/70 hover:border-gold/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="text-paper/60">No videos in this subject yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((v) => (
                    <VideoCard
                      key={v._id}
                      video={v}
                      percentWatched={progressMap[v._id] || 0}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
