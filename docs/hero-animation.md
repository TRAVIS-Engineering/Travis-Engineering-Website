# Homepage drone animation

`components/home/HeroAnimation.tsx` plays the approved 24-second drone scan / 360° orbit. Assets live in `public/media/hero/` and are served with the static site on GitHub Pages. No model, API, or Spark connection is used at runtime.

- `orbit-alpha.webm`: original approved VP9 alpha export, 960 × 540, 24 fps, 24 seconds, 2,439,140 bytes. Keep its full duration and transparent background.
- `orbit-poster.png`: original transparent still, also used without JavaScript or with reduced motion.
- `Hero.module.css` provides the stationary teal grid. The video and poster have no card, border, or opaque backdrop.

The video is kept visually hidden until a decoded frame passes a canvas alpha check **and** `play()` succeeds. The check requires transparent corners and some opaque building pixels; WebM MIME support alone is insufficient. Do not add a poster attribute to the video: the separate image prevents accidentally sampling a PNG instead of a decoded frame. If replacing the artwork, verify these sample assumptions against the new clip.

An IntersectionObserver and page-visibility listener pause playback offscreen/in background tabs. Explicit pause persists through scrolling. Reduced-motion visitors see the poster and do not initially download the video; live preference changes also stop playback. Decode errors, alpha failure, autoplay rejection, or a 15-second loading timeout leave the poster visible. No opaque MP4 fallback is used.

Publish through the existing `.github/workflows/deploy.yml` workflow (push to `main`). Before publishing, run targeted ESLint and `npm run build`, and check desktop/mobile playback, a full loop, manual and offscreen pause, reduced motion, and unsupported-alpha/autoplay/error fallback paths in a browser.
