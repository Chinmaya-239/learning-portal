import { useState } from "react";
import { formatTime } from "./ProgressRail";

export default function BookmarkPanel({
  bookmarks,
  currentTime,
  onCreate,
  onUpdate,
  onDelete,
  onJump,
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    onCreate({ name: name.trim(), timestamp: Math.floor(currentTime) });
    setName("");
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setEditName(b.name || "");
  };

  const saveEdit = (b) => {
    onUpdate(b._id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col bg-paper rounded-2xl shadow-card border border-line/60">
      <div className="px-5 pt-5 pb-3 border-b border-line/60">
        <h2 className="font-display text-lg text-ink">Bookmarks</h2>
        <p className="text-xs text-slateink/60 mt-1">
          Save this moment, come back to it any time.
        </p>
      </div>

      <form onSubmit={handleAdd} className="px-5 py-4 border-b border-line/60 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Note (optional)"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-slateink focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light transition-colors"
        >
          + {formatTime(currentTime)}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {bookmarks.length === 0 && (
          <p className="text-sm text-slateink/50 italic py-6 text-center">
            No bookmarks yet — hit "+" while watching to drop your first one.
          </p>
        )}

        {bookmarks.map((b) => (
          <div
            key={b._id}
            className="group flex items-center gap-3 rounded-xl border border-line/70 bg-white/60 px-3 py-2 hover:border-gold transition-colors"
          >
            <button
              onClick={() => onJump(b.timestamp)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf/10 text-leaf font-mono text-[11px] font-semibold hover:bg-leaf hover:text-white transition-colors"
              title="Jump to this timestamp"
            >
              ▶
            </button>

            <button onClick={() => onJump(b.timestamp)} className="flex-1 text-left">
              {editingId === b._id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => saveEdit(b)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(b)}
                  className="w-full rounded border border-gold px-2 py-1 text-sm"
                />
              ) : (
                <>
                  <div className="text-sm font-medium text-ink truncate">
                    {b.name || "Untitled bookmark"}
                  </div>
                  <div className="font-mono text-xs text-slateink/60">
                    {formatTime(b.timestamp)}
                  </div>
                </>
              )}
            </button>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(b)}
                title="Rename"
                className="text-xs text-slateink/50 hover:text-ink px-1.5 py-1"
              >
                ✎
              </button>
              <button
                onClick={() => onDelete(b._id)}
                title="Delete"
                className="text-xs text-slateink/50 hover:text-red-500 px-1.5 py-1"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
