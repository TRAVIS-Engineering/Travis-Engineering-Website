# Homepage drone animation

`components/home/HeroAnimation.tsx` plays the approved 24-second drone scan / 360° orbit. Assets live in `public/media/hero/` and are served with the static site on GitHub Pages. No model, API, or Spark connection is used at runtime.

- `orbit-smooth-1080.webm`: VP9 alpha export rendered at 1920 × 1080, 24 fps, 24 seconds, CRF 24. Keep its full duration and transparent background.
- `orbit-mask-720.mp4`: iPhone-compatible H.264 color/alpha atlas, 2560 × 720 encoded, 1280 × 720 reconstructed, 24 fps and the same complete 24-second animation. RGB is on the left, grayscale alpha on the right; this file must never be displayed directly. `heroAlphaRenderer.ts` composites it into a transparent WebGL canvas.
- `orbit-poster-1080.png`: matching 1920 × 1080 transparent still, also used without JavaScript or with reduced motion.
- `Hero.module.css` provides the stationary teal grid. The video and poster have no card, border, or opaque backdrop.

The video is kept visually hidden until a decoded frame passes a canvas alpha check **and** `play()` succeeds. The check requires transparent corners and some opaque building pixels; WebM MIME support alone is insufficient. Do not add a poster attribute to the video: the separate image prevents accidentally sampling a PNG instead of a decoded frame. If replacing the artwork, verify these sample assumptions against the new clip.

An IntersectionObserver and page-visibility listener pause playback offscreen/in background tabs. Explicit pause persists through scrolling. Reduced-motion visitors see the poster and do not initially download the video; live preference changes also stop playback. iPhone/iPad browsers start with the packed H.264 path; other browsers try native WebM alpha first and switch to the packed path if its decoded alpha is unsupported. The reconstructed canvas is also checked for transparent corners and opaque content. Decode/graphics errors or a 20-second source-loading timeout retain the poster. Autoplay rejection retains the poster and exposes a Play animation button that retries synchronously inside the user gesture. Playback is requested before waiting for decoded frames, since iOS may defer decoding until playback starts. No opaque video is displayed.

Publish through the existing `.github/workflows/deploy.yml` workflow (push to `main`). Before publishing, run targeted ESLint and `npm run build`, and check desktop/mobile playback, a full loop, manual and offscreen pause, reduced motion, and unsupported-alpha/autoplay/error fallback paths in a browser.

## Quality refinement

The first integration enlarged a 960 × 540 CRF 38 export to as much as 1280 CSS pixels. Alex requested a less grainy result. The replacement is rendered directly from the scene at 1920 × 1080, rather than upscaled from the old video. Scan-point luminance variation was reduced from 35% to 6% and point coverage increased from 1.35 to 2.15 pixels at 1080p to reduce speckling. Building geometry, camera/drone motion, 24-second timing, and exact scene reset are unchanged. New asset filenames avoid stale cached copies.

Quality source and reproducible renderer: `/home/foisey/Documents/travis-hero-quality-20261102/` on Spark; CPU rendering runs in the matching directory on foiseydesk. The original approved scene under `/home/foisey/Documents/drone-scan-hero/` is preserved. These directories are production sources only, never website runtime dependencies.

## iPhone compatibility

The native VP9 alpha path can display only a poster in iPhone browsers because WebM codec support does not guarantee alpha decoding. The packed H.264 asset avoids that dependency while preserving the stationary grid and the approved animation. It is about 4.5 MB; iOS avoids downloading the larger WebM first. Rendering uses video-frame callbacks where available and stops them when paused, offscreen, or backgrounded. Reduced-motion visitors continue to see the transparent poster.

The packed source is derived from the improved 1080p WebM using ffmpeg/libvpx-vp9 to preserve its alpha, Lanczos downsampling to 1280×720, an RGB/alpha horizontal stack, and libx264 CRF18 yuv420p with faststart. Source/export and QA: `/home/foisey/Documents/travis-hero-ios-20261102/` on Spark and the matching foiseydesk directory. iPhone device confirmation remains separate from desktop browser emulation.
