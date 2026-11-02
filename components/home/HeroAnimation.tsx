'use client';

import { useEffect, useRef, useState } from 'react';
import BASE_PATH from '@/lib/basePath';
import styles from './Hero.module.css';

const poster = `${BASE_PATH}/media/hero/orbit-poster.png`;
const animation = `${BASE_PATH}/media/hero/orbit-alpha.webm`;

export default function HeroAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const toggleRef = useRef<() => void>(() => {});
    const [showVideo, setShowVideo] = useState(false);
    const [showControl, setShowControl] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let inView = false;
        let verified = false;
        let failed = false;
        let userPaused = false;
        let disposed = false;
        let starting = false;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        function fallback() {
            if (disposed) return;
            failed = true;
            video!.pause();
            clearTimeout(timeout);
            setShowVideo(false);
            setShowControl(false);
        }

        function shouldPlay() {
            return !disposed && !failed && !userPaused && !reducedMotion.matches && inView && !document.hidden;
        }

        function syncPlayback() {
            if (disposed || failed) return;
            setShowControl(verified && !reducedMotion.matches);
            if (reducedMotion.matches) setShowVideo(false);
            if (!shouldPlay()) {
                video!.pause();
                return;
            }
            if (!video!.getAttribute('src')) {
                video!.src = animation;
                video!.load();
                // A stalled or unsupported decoder leaves the transparent still visible.
                timeout = setTimeout(fallback, 15000);
            }
            if (verified && video!.paused && !starting) {
                starting = true;
                video!.play().then(() => {
                    starting = false;
                    if (shouldPlay()) setShowVideo(true);
                    else video!.pause();
                }).catch((error: unknown) => {
                    starting = false;
                    // Leaving the viewport can interrupt an otherwise valid play request.
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        if (shouldPlay()) syncPlayback();
                    } else {
                        fallback();
                    }
                });
            }
        }

        function checkTransparency() {
            if (disposed || failed || verified || video!.readyState < 2) return;
            try {
                // WebM support alone does not establish alpha support. Inspect a decoded
                // frame: this asset has clear corners and an opaque building. There is
                // no video poster attribute, so a PNG cannot accidentally pass this test.
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 18;
                const context = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) return fallback();
                context.drawImage(video!, 0, 0, 32, 18);
                const pixels = context.getImageData(0, 0, 32, 18).data;
                const corners = [0, 31, 17 * 32, 18 * 32 - 1];
                const transparent = corners.every(index => pixels[index * 4 + 3] < 16);
                const hasBuilding = pixels.some((value, index) => index % 4 === 3 && value > 240);
                if (!transparent || !hasBuilding) return fallback();
                verified = true;
                clearTimeout(timeout);
                syncPlayback();
            } catch {
                fallback();
            }
        }

        toggleRef.current = () => {
            userPaused = !userPaused;
            setPaused(userPaused);
            syncPlayback();
        };
        video.muted = true;
        video.addEventListener('loadeddata', checkTransparency);
        video.addEventListener('error', fallback);
        reducedMotion.addEventListener('change', syncPlayback);
        document.addEventListener('visibilitychange', syncPlayback);
        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            syncPlayback();
        });
        observer.observe(container);
        checkTransparency();

        return () => {
            disposed = true;
            clearTimeout(timeout);
            observer.disconnect();
            reducedMotion.removeEventListener('change', syncPlayback);
            document.removeEventListener('visibilitychange', syncPlayback);
            video.removeEventListener('loadeddata', checkTransparency);
            video.removeEventListener('error', fallback);
            video.pause();
            toggleRef.current = () => {};
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.animation}>
            {/* Separate PNG also provides the no-JavaScript/reduced-motion fallback. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} width="1280" height="720"
                alt="A drone scanning a contemporary building"
                className={styles.visual} hidden={showVideo} fetchPriority="high" />
            <video ref={videoRef} id="hero-drone-animation" muted playsInline loop preload="auto"
                width="1280" height="720" aria-hidden="true" tabIndex={-1}
                className={`${styles.visual} ${styles.video}`}
                style={{ opacity: showVideo ? 1 : 0 }} />
            {showControl && (
                <button type="button" className={styles.motionControl}
                    aria-controls="hero-drone-animation" onClick={() => toggleRef.current()}
                    aria-label={paused ? 'Play hero animation' : 'Pause hero animation'}>
                    <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
                    {paused ? 'Play animation' : 'Pause animation'}
                </button>
            )}
        </div>
    );
}
