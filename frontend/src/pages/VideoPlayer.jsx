import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ScreenshotGuard from "../components/ScreenshotGuard";
import ProgressRail from "../components/ProgressRail";
import BookmarkPanel from "../components/BookmarkPanel";
import { useAuth } from "../context/AuthContext";

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
}

export default function VideoPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);
  const pendingResumeRef = useRef(0);

  const [video, setVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  const saveTimer = useRef(null);

  // Fetch video/bookmarks/progress
  useEffect(() => {
    setLoading(true);
    setPlayerReady(false);
    (async () => {
      const [videoRes, bookmarksRes, progressRes] = await Promise.all([
        api.get(`/videos/${id}`),
        api.get(`/bookmarks/${id}`),
        api.get(`/progress/${id}`),
      ]);
      setVideo(videoRes.data.video);
      setBookmarks(bookmarksRes.data.bookmarks);
      pendingResumeRef.current = progressRes.data.progress?.lastPosition || 0;
      setLoading(false);
    })();
  }, [id]);

  // Create the YouTube player once video data is loaded
  useEffect(() => {
    if (!video || !playerContainerRef.current) return;
    let cancelled = false;

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !playerContainerRef.current) return;

      playerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: video.youtubeId,
        playerVars: { modestbranding: 1, rel: 0 },
        events: {
          onReady: (e) => {
            const d = e.target.getDuration();
            setDuration(d);
            if (pendingResumeRef.current > 0) {
              e.target.seekTo(pendingResumeRef.current, true);
            }
            setPlayerReady(true);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              clearInterval(pollRef.current);
              pollRef.current = setInterval(() => {
                if (playerRef.current?.getCurrentTime) {
                  const t = playerRef.current.getCurrentTime();
                  setCurrentTime(t);
                  persistProgress(t);
                }
              }, 500);
            } else {
              setPlaying(false);
              clearInterval(pollRef.current);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  const persistProgress = useCallback(
    (time) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api
          .put(`/progress/${id}`, {
            lastPosition: Math.floor(time),
            duration: playerRef.current?.getDuration?.() || duration,
          })
          .catch(() => {});
      }, 800);
    },
    [id, duration]
  );

  const seekTo = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
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
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
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
                <div className="relative w-full pt-[56.25%] bg-black">
                  <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />
                </div>
              </ScreenshotGuard>

              <div className="bg-ink-dark px-4 pb-3">
                {playerReady && (
                  <ProgressRail
                    duration={duration}
                    currentTime={currentTime}
                    bookmarks={bookmarks}
                    onSeek={seekTo}
                  />
                )}
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