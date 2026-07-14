import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ScreenshotGuard from "../components/ScreenshotGuard";
import ProgressRail from "../components/ProgressRail";
import BookmarkPanel from "../components/BookmarkPanel";
import { useAuth } from "../context/AuthContext";

export default function VideoPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeApplied, setResumeApplied] = useState(false);

  const saveTimer = useRef(null);

  useEffect(() => {
    setLoading(true);
    setResumeApplied(false);
    (async () => {
      const [videoRes, bookmarksRes, progressRes] = await Promise.all([
        api.get(`/videos/${id}`),
        api.get(`/bookmarks/${id}`),
        api.get(`/progress/${id}`),
      ]);
      setVideo(videoRes.data.video);
      setBookmarks(bookmarksRes.data.bookmarks);

      const resumeAt = progressRes.data.progress?.lastPosition || 0;
      if (videoRef.current && resumeAt > 0) {
        videoRef.current.currentTime = resumeAt;
      }
      setResumeApplied(true);
      setLoading(false);
    })();
  }, [id]);

  const persistProgress = useCallback(
    (time) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api
          .put(`/progress/${id}`, {
            lastPosition: Math.floor(time),
            duration: videoRef.current?.duration || duration,
          })
          .catch(() => {});
      }, 800);
    },
    [id, duration]
  );

  const handleTimeUpdate = () => {
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    persistProgress(t);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration || 0);
  };

  const seekTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const createBookmark = async ({ name, timestamp }) => {
    const { data } = await api.post("/bookmarks", { videoId: id, name, timestamp });
    setBookmarks((prev) => [...prev, data.bookmark].sort((a, b) => a.timestamp - b.timestamp));
  };

  const updateBookmark = async (bookmarkId, patch) => {
    const { data } = await api.put(`/bookmarks/${bookmarkId}`, patch);
    setBookmarks((prev) =>
      prev.map((b) => (b._id === bookmarkId ? data.bookmark : b)).sort((a, b) => a.timestamp - b.timestamp)
    );
  };

  const deleteBookmark = async (bookmarkId) => {
    await api.delete(`/bookmarks/${bookmarkId}`);
    setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-ink">
        <Navbar />
        <p className="text-paper/70 text-center py-20">Loading lesson…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/" className="text-gold text-sm font-mono">
          ← Back to library
        </Link>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <div className="rounded-2xl overflow-hidden bg-black shadow-card">
              <ScreenshotGuard
                watermarkText={`${user?.name} · ${user?.email} · ${new Date().toLocaleString()}`}
              >
                <video
                  ref={videoRef}
                  src={video.url}
                  className="w-full aspect-video bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onClick={togglePlay}
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                />
              </ScreenshotGuard>

              <div className="bg-ink-dark px-4 pb-3">
                <ProgressRail
                  duration={duration}
                  currentTime={currentTime}
                  bookmarks={bookmarks}
                  onSeek={seekTo}
                />
                <div className="flex items-center gap-3 pb-2">
                  <button
                    onClick={togglePlay}
                    className="rounded-full bg-gold text-ink w-9 h-9 flex items-center justify-center font-bold"
                  >
                    {playing ? "❚❚" : "▶"}
                  </button>
                  <span className="text-paper/60 text-xs font-mono">
                    {video.subject} · {video.instructor}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h1 className="font-display text-2xl text-paper">{video.title}</h1>
              <p className="text-paper/70 text-sm mt-2 max-w-2xl">{video.description}</p>
            </div>
          </div>

          <div className="h-[520px] lg:h-auto">
            <BookmarkPanel
              bookmarks={bookmarks}
              currentTime={currentTime}
              onCreate={createBookmark}
              onUpdate={updateBookmark}
              onDelete={deleteBookmark}
              onJump={seekTo}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
