import { useEffect, useRef, useState } from "react";

/**
 * ScreenshotGuard
 * ----------------
 * Browsers give web pages no reliable API to detect or block a screenshot —
 * that decision belongs to the OS. This component implements the best
 * *deterrents* available in a standard browser stack, layered together:
 *
 *  1. Blur-on-blur: instantly blurs the video the moment the tab loses focus
 *     or becomes hidden (covers the ~1 frame most screenshot/screen-recording
 *     tools need, and fully covers screen-recording since the recording
 *     picks up the blurred frame for as long as focus is away).
 *  2. A moving watermark burned over the video (student name + email +
 *     timestamp) so any screenshot that does get through is traceable back
 *     to the account that produced it — the standard approach used by real
 *     DRM-less learning platforms.
 *  3. Right-click / text-selection / drag disabled on the player area.
 *  4. Common capture & devtools shortcuts (PrintScreen, Ctrl/Cmd+P,
 *     Ctrl+Shift+S, Ctrl+Shift+I, F12, Ctrl+U) are intercepted where the
 *     browser allows it.
 *  5. A print stylesheet that hides the content if someone tries to print
 *     the page to PDF.
 *
 * None of this can stop a phone camera pointed at the screen or an OS-level
 * capture tool that Chrome/Firefox cannot see — that is a hard platform
 * limitation, documented in the README, and is why native apps (with
 * FLAG_SECURE on Android, or screen-capture-kit protections on iOS) are the
 * only way to fully block screenshots.
 */
export default function ScreenshotGuard({ children, watermarkText }) {
  const containerRef = useRef(null);
  const [blurred, setBlurred] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const blur = () => setBlurred(true);
    const unblur = () => setBlurred(false);

    const onVisibility = () => {
      if (document.hidden) blur();
      else unblur();
    };

    const onBlurWindow = () => blur();
    const onFocusWindow = () => unblur();

    const onKeyDown = (e) => {
      const key = e.key;
      const combo = (e.ctrlKey || e.metaKey);

      const isPrintScreen = key === "PrintScreen";
      const isDevTools =
        key === "F12" ||
        (combo && e.shiftKey && (key === "I" || key === "i" || key === "C" || key === "c" || key === "J" || key === "j")) ||
        (combo && (key === "u" || key === "U"));
      const isSnip = combo && e.shiftKey && (key === "S" || key === "s"); // Win snipping / some screenshot tools
      const isPrint = combo && (key === "p" || key === "P");
      const isSave = combo && (key === "s" || key === "S");

      if (isPrintScreen) {
        // Can't block the OS capture itself, but we can nuke the clipboard
        // image an instant later and flash a warning overlay.
        navigator.clipboard?.writeText("Screenshots of this content are not permitted.").catch(() => {});
        triggerFlash();
      }

      if (isDevTools || isSnip || isPrint || isSave) {
        e.preventDefault();
        triggerFlash();
      }
    };

    const triggerFlash = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    };

    const onContextMenu = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlurWindow);
    window.addEventListener("focus", onFocusWindow);
    window.addEventListener("keydown", onKeyDown);
    const node = containerRef.current;
    node?.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlurWindow);
      window.removeEventListener("focus", onFocusWindow);
      window.removeEventListener("keydown", onKeyDown);
      node?.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none protect-select no-print"
      onDragStart={(e) => e.preventDefault()}
    >
      <div className={blurred ? "protected-blur" : ""}>{children}</div>

      {/* Traceable watermark, repositioned periodically so it can't be cropped out */}
      <FloatingWatermark text={watermarkText} />

      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/90 text-paper font-body text-sm tracking-wide">
          Playback paused — content is hidden while this tab isn't in focus.
        </div>
      )}

      {flash && (
        <div className="absolute inset-0 flex items-center justify-center bg-gold/90 text-ink font-display font-semibold text-lg animate-pulse">
          Screenshots and downloads of this lesson aren't permitted.
        </div>
      )}
    </div>
  );
}

function FloatingWatermark({ text }) {
  const [pos, setPos] = useState({ top: "10%", left: "8%" });

  useEffect(() => {
    const id = setInterval(() => {
      setPos({
        top: `${10 + Math.random() * 70}%`,
        left: `${5 + Math.random() * 70}%`,
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="pointer-events-none absolute select-none text-xs sm:text-sm font-mono text-white/40 mix-blend-difference px-2 py-1 transition-all duration-700 ease-in-out"
      style={{ top: pos.top, left: pos.left }}
    >
      {text}
    </div>
  );
}
