# Homepage drone animation

`components/home/HeroAnimation.tsx` plays the approved **aerial-v6-site** animation: improved frontage road, parking access and landscaping, with the full 20-second drone-capture-to-engineering sequence. Alex explicitly confirmed TRAVIS Engineering as the destination on 2026-11-02. Existing headline, description, navigation and CTA are unchanged.

## Public assets

Assets are copied into `public/media/hero/` and served by GitHub Pages. No model, API or Spark connection is used for playback; preview HTML is not embedded.

- `aerial-v6-site-alpha.webm`: exact supplied VP9 alpha video, 960×540, 24 fps, 480 frames, 20 seconds, silent; 6,873,152 bytes.
- `aerial-v6-site-poster.png`: exact supplied 1280×720 transparent poster, 200,481 bytes. Used while loading, with reduced motion, without JavaScript, or when playback cannot render transparency.
- `aerial-v6-site-mask-540.mp4`: derived iPhone-compatible H.264 RGB/alpha atlas, 1920×540 encoded and 960×540 reconstructed, same 20 seconds/24 fps, silent; 8,781,487 bytes. RGB left, grayscale alpha right. Never display this video directly; `heroAlphaRenderer.ts` reconstructs a transparent canvas. This is not the white-background review MP4.

Source handoff: `/home/foisey/Documents/drone-scan-hero/AERIAL-V6-HANDOFF.md`. The portable `aerial-v6-site-hero.html` is a visual/behavior reference only. Old orbit assets remain in git history and the original source directories; they are no longer shipped by the site.

## Layout and transparency

The stationary white/teal grid stays in `Hero.module.css`; no video card, border or opaque backdrop. Desktop artwork occupies the area beside the original copy. Mobile places it above the copy, with dedicated control space. All 480 decoded frames were measured: alpha greater than 8 occupies x=326..902 and y=7..512 within the 960×540 video. CSS centers and scales that full visible range so the drone, building and captions remain in view, including at 320px. No asset content is cropped. Re-measure if replacing the animation again.

As in the approved preview, verify actual decoded alpha before revealing motion, rather than trusting WebM MIME support. The existing stronger check requires transparent corners and opaque scene pixels. Do not add a video poster attribute, which could cause a PNG to be sampled instead of decoded video pixels. The poster is a separate image and remains visible until verified playback starts.

The prior iPhone fix is retained with the matching v6 asset. iPhone/iPad starts with packed H.264; other browsers try native WebM alpha first, then the packed path if necessary. The reconstructed canvas must also pass actual-alpha validation. Decode errors, unavailable graphics or a 20-second loading timeout preserve the poster. Blocked autoplay preserves the poster and offers a synchronous-gesture Play animation retry. Playback is requested before waiting for loadeddata to avoid mobile decoding stalls.

Muted, inline, full-length continuous looping; accessible pause/play button; manual pause persists through scrolling. IntersectionObserver and document visibility pause playback offscreen/in background tabs. Reduced motion shows the poster and avoids initial video requests; changes to the preference are honored. Packed canvas frame callbacks stop when playback stops.

## Verification and publishing

Push main through the existing `.github/workflows/deploy.yml` workflow. Run targeted ESLint and the production build. Browser checks cover Chromium and WebKit playback, full real-time loop, 320–1920px bounds/layout, actual alpha, pause/resume, offscreen/reduced motion, blocked-autoplay retry, media/graphics failures and no-JavaScript poster. Desktop engine/emulation checks do not constitute physical iPhone testing.

Reproducible checks, asset hashes, decoded-frame bounds and screenshots: `/home/foisey/Documents/travis-hero-v6-20261102/`, with execution in the matching `/home/foiseydesk/Documents/` directory on `onarchy-pc`. Build/browser/ffmpeg work uses the desktop, not the shared Spark model host. Temporary QA servers bind only to ephemeral loopback ports and close after checks.

The mobile atlas was generated from the exact delivery WebM with libvpx-vp9 alpha decoding, split RGB/alpha extraction and horizontal stacking, then libx264 CRF18/yuv420p/faststart. No resampling or animation timing changes.
