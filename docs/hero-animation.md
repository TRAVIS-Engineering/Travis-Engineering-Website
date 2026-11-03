# Approved homepage and service animations

The four approved replacements share `components/TransparentAnimation.tsx` and the established Canvas 2D mobile pipeline. Existing page text, headings, navigation, links and CTA are unchanged. Asset selection is in `data/animations.ts`.

| Page | Prefix | Complete loop |
| --- | --- | --- |
| `/` | aerial-v7-van | 20 seconds |
| `/services/travis-applied-intelligence` | services-intelligence | 20 seconds |
| `/services/engineering-design` | services-design | 28 seconds |
| `/services/damage-assessments` | services-damage | 24 seconds |

These are the 2026-11-03 revision 5 assets: homepage orange/black pad and van clearing during reconstruction; Applied Intelligence street/parked van; Design rectangular base with crew departure; Damage corrected rear door. Source handoff: `/home/foisey/Documents/drone-scan-hero/SERVICE-ANIMATIONS-HANDOFF.md`.

## Assets and mobile generation

`public/media/animations/` contains exact approved transparent delivery WebMs and PNG posters, plus newly generated H.264 RGB/alpha atlases for **all four** animations. `docs/animation-assets.json` records exact sizes, SHA-256 hashes and matching master hashes. Masters, review MP4s and gallery HTML are not shipped. Old v6 assets and the two obsolete image-only slideshow components are removed.

Every mobile atlas is generated from its matching 1280×720 `-alpha-master.webm`, not the lower-resolution homepage delivery WebM. It encodes RGB on the left and alpha on the right, yielding 2560×720 H.264 and a reconstructed transparent 1280×720 canvas. All retain the original 24 fps, timing, frame count and silence. Run this on the desktop build host, not the shared Spark model host:

```sh
for prefix in aerial-v7-van services-intelligence services-design services-damage; do
  ffmpeg -c:v libvpx-vp9 -i "$source_dir/$prefix-alpha-master.webm" \
    -filter_complex '[0:v]split=2[color][alpha];[color]format=yuv420p[rgb];[alpha]alphaextract,format=yuv420p[mask];[rgb][mask]hstack=inputs=2[out]' \
    -map '[out]' -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -movflags +faststart -threads 4 "$asset_dir/$prefix-mask-720.mp4"
done
```

Never display these packed MP4s directly. `alphaVideoRenderer.ts` reconstructs transparency with Canvas 2D. Retain this implementation: WebGL previously lost its context at loop boundaries in WebKit.

## Playback and layout contract

The current page alone supplies the player's configuration. Video sources are assigned only when the player enters the viewport and motion is allowed. iPhone/iPad starts with H.264; other browsers try native WebM first. Before revealing either, inspect actual decoded pixels for transparent corners and opaque content; MIME support alone is insufficient. No video poster attribute is used, since it can cause alpha verification to sample the PNG instead of decoded video.

The separate matching transparent PNG is present in server-rendered HTML and remains visible while loading, without JavaScript, with reduced motion, or when playback fails. Blocked autoplay retains the poster and offers a synchronous user-gesture Play retry. Alpha verification waits until the video is playing: a paused, autoplay-blocked video can report loadeddata while its canvas pixels are still blank. The player pauses offscreen and while the document is hidden. Manual pause survives scrolling and preference changes. Reduced motion prevents initial video downloads. Canvas callbacks stop while paused.

Each full 16:9 composition uses `object-fit: contain`; frames and control space are reserved before loading. No added background, border, card or shadow. The homepage keeps its stationary teal grid and original copy/CTA; its transparent left padding is offset on desktop while keeping the full source frame within the viewport. Mobile fits the complete source frame above the copy. Service pages retain their two-column desktop layout, stack on mobile, and use a flexible media column to avoid tablet overflow.

## Validation and publishing

Use the established `main` → `.github/workflows/deploy.yml` → GitHub Pages workflow. Targeted ESLint and production build run in the existing desktop mirror. Four-page browser checks and screenshots are in `/home/foisey/Documents/travis-four-animations-20261103/` (execution directory under `/home/foiseydesk/Documents/` on `onarchy-pc`). The range-capable temporary QA server binds only to an ephemeral loopback port and closes after testing.

The harness covers Chromium and Linux WebKit, desktop and iPhone emulation, actual transparency, complete real-time loops, post-loop canvas updates, 320–1920px frame bounds, no overflow, page-specific downloads, correct posters, controls, manual/offscreen pause, synthetic document-hidden gating, initial and changed reduced motion, blocked-autoplay retry, opaque WebM fallback, broken media, unavailable canvas and no-JavaScript fallback. Browser emulation is not physical iPhone testing; physical iPhone Safari/Chrome remains unverified.
