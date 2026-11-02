# Homepage drone animation

`components/home/HeroAnimation.tsx` plays the approved 24-second drone scan / 360° orbit. Assets live in `public/media/hero/` and are served with the static site on GitHub Pages. No model, API, or Spark connection is used at runtime.

- `orbit-smooth-1080.webm`: VP9 alpha export rendered at 1920 × 1080, 24 fps, 24 seconds, CRF 24. Keep its full duration and transparent background.
- `orbit-poster-1080.png`: matching 1920 × 1080 transparent still, also used without JavaScript or with reduced motion.
- `Hero.module.css` provides the stationary teal grid. The video and poster have no card, border, or opaque backdrop.

The video is kept visually hidden until a decoded frame passes a canvas alpha check **and** `play()` succeeds. The check requires transparent corners and some opaque building pixels; WebM MIME support alone is insufficient. Do not add a poster attribute to the video: the separate image prevents accidentally sampling a PNG instead of a decoded frame. If replacing the artwork, verify these sample assumptions against the new clip.

An IntersectionObserver and page-visibility listener pause playback offscreen/in background tabs. Explicit pause persists through scrolling. Reduced-motion visitors see the poster and do not initially download the video; live preference changes also stop playback. Decode errors, alpha failure, autoplay rejection, or a 15-second loading timeout leave the poster visible. No opaque MP4 fallback is used.

Publish through the existing `.github/workflows/deploy.yml` workflow (push to `main`). Before publishing, run targeted ESLint and `npm run build`, and check desktop/mobile playback, a full loop, manual and offscreen pause, reduced motion, and unsupported-alpha/autoplay/error fallback paths in a browser.

## Quality refinement

The first integration enlarged a 960 × 540 CRF 38 export to as much as 1280 CSS pixels. Alex requested a less grainy result. The replacement is rendered directly from the scene at 1920 × 1080, rather than upscaled from the old video. Scan-point luminance variation was reduced from 35% to 6% and point coverage increased from 1.35 to 2.15 pixels at 1080p to reduce speckling. Building geometry, camera/drone motion, 24-second timing, and exact scene reset are unchanged. New asset filenames avoid stale cached copies.

Quality source and reproducible renderer: `/home/foisey/Documents/travis-hero-quality-20261102/` on Spark; CPU rendering runs in the matching directory on foiseydesk. The original approved scene under `/home/foisey/Documents/drone-scan-hero/` is preserved. These directories are production sources only, never website runtime dependencies.
