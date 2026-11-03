'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnimationAsset } from '@/data/animations';
import { createHeroAlphaRenderer } from './alphaVideoRenderer';
import styles from './TransparentAnimation.module.css';

type View = 'poster' | 'video' | 'canvas';

type Props = { animation: AnimationAsset; priority?: boolean; className?: string; frameClassName?: string; controlClassName?: string };

export default function TransparentAnimation({ animation, priority = false, className = '', frameClassName = '', controlClassName = '' }: Props) {
    const { id, label, alt, poster, webm, packed } = animation;
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const toggleRef = useRef<() => void>(() => {});
    const [view, setView] = useState<View>('poster');
    const [showControl, setShowControl] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const container = containerRef.current!;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reduce = reducedMotion.matches;
        // Avoid downloading a large WebM probe on iOS. Both paths still verify real pixels.
        const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        let mode: 'webm' | 'packed' = ios || !video.canPlayType('video/webm; codecs="vp9"') ? 'packed' : 'webm';
        let renderer: ReturnType<typeof createHeroAlphaRenderer> | undefined;
        let inView = false, verified = false, failed = false, loaded = false;
        let userPaused = false, blocked = false, disposed = false, starting = false;
        let generation = 0;
        let frame: number | undefined;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const videoFrames = typeof video.requestVideoFrameCallback === 'function';

        function stopFrames() {
            if (frame !== undefined) {
                if (videoFrames) video.cancelVideoFrameCallback(frame);
                else cancelAnimationFrame(frame);
                frame = undefined;
            }
        }
        function still() {
            if (disposed) return;
            failed = true;
            stopFrames(); video.pause(); clearTimeout(timeout);
            setView('poster'); setShowControl(false);
        }
        function shouldPlay() {
            return !disposed && !failed && !userPaused && !blocked && !reduce && inView && !document.hidden;
        }
        function drawFrame() {
            frame = undefined;
            if (!shouldPlay() || video.paused || mode !== 'packed' || !verified) return;
            try { renderer!.draw(video); } catch { still(); return; }
            frame = videoFrames ? video.requestVideoFrameCallback(drawFrame) : requestAnimationFrame(drawFrame);
        }
        function reveal() {
            if (!verified || !shouldPlay() || video.paused) return;
            setView(mode === 'packed' ? 'canvas' : 'video');
            setShowControl(true); setPaused(false);
            if (mode === 'packed' && frame === undefined) drawFrame();
        }
        function loadSource() {
            if (disposed || failed) return;
            generation++; starting = false; verified = false; loaded = true;
            stopFrames(); clearTimeout(timeout); setView('poster');
            if (mode === 'packed' && !renderer) {
                try { renderer = createHeroAlphaRenderer(canvas); } catch { still(); return; }
            }
            video.src = mode === 'packed' ? packed : webm;
            video.load();
            timeout = setTimeout(sourceFailed, 20000);
        }
        function sourceFailed() {
            if (disposed || failed) return;
            if (mode === 'webm') {
                mode = 'packed'; loadSource(); syncPlayback();
            } else still();
        }
        function play() {
            if (starting || !shouldPlay() || !video.paused) return;
            starting = true;
            const attempt = generation;
            // Called synchronously by the button too, preserving the iOS user gesture.
            video.play().then(() => {
                if (disposed || attempt !== generation) return;
                starting = false;
                if (!shouldPlay()) video.pause();
                else { checkFrame(); reveal(); }
            }).catch((error: unknown) => {
                if (disposed || attempt !== generation) return;
                starting = false;
                if (error instanceof DOMException && error.name === 'AbortError') {
                    if (shouldPlay()) syncPlayback();
                } else if (error instanceof DOMException && error.name === 'NotAllowedError') {
                    blocked = true; clearTimeout(timeout); stopFrames(); video.pause();
                    setView('poster'); setPaused(true); setShowControl(!reduce);
                } else sourceFailed();
            });
        }
        function syncPlayback() {
            if (disposed || failed) return;
            setShowControl(!reduce && (verified || blocked));
            if (reduce) setView('poster');
            if (!shouldPlay()) { stopFrames(); video.pause(); return; }
            if (!loaded) loadSource();
            // Do not wait for loadeddata: iOS can defer decoding until play() is requested.
            if (!failed) { play(); reveal(); }
        }
        function checkFrame() {
            // A blocked, paused video can report loadeddata before pixels are drawable.
            // Keep the poster and gesture retry until playback supplies a real frame.
            if (disposed || failed || verified || blocked || video.paused || video.readyState < 2) return;
            try {
                if (mode === 'packed') {
                    if (video.videoWidth !== 2560 || video.videoHeight !== 720) throw new Error('Invalid packed frame');
                    renderer!.draw(video, true);
                } else {
                    // Like the approved preview, inspect decoded alpha rather than WebM MIME support.
                    // A video poster attribute could accidentally make this sample a PNG.
                    const probe = document.createElement('canvas');
                    probe.width = 32; probe.height = 18;
                    const context = probe.getContext('2d', { willReadFrequently: true });
                    if (!context) throw new Error('Canvas unavailable');
                    context.drawImage(video, 0, 0, 32, 18);
                    const pixels = context.getImageData(0, 0, 32, 18).data;
                    if (![0,31,17*32,18*32-1].every(i => pixels[i*4+3] < 16) ||
                        !pixels.some((v,i) => i%4===3 && v>240)) throw new Error('WebM alpha unsupported');
                }
                verified = true; clearTimeout(timeout);
                setShowControl(!reduce); reveal();
            } catch { sourceFailed(); }
        }
        function onPlaying() {
            // WebKit may resume a visible video independently after a pause event.
            // Reapply user/visibility preferences to every platform-initiated start.
            if (!shouldPlay()) { stopFrames(); video.pause(); return; }
            checkFrame(); reveal();
        }
        function onSeeked() {
            checkFrame();
            if (verified && mode === 'packed') {
                try { renderer!.draw(video); } catch { still(); }
            }
        }
        function onMotionChange(event: MediaQueryListEvent) { reduce = event.matches; syncPlayback(); }
        toggleRef.current = () => {
            if (blocked) { blocked = false; userPaused = false; }
            else userPaused = !userPaused;
            setPaused(userPaused);
            syncPlayback();
        };
        video.muted = true; video.defaultMuted = true;
        video.addEventListener('loadeddata', checkFrame);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('pause', stopFrames);
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', sourceFailed);
        reducedMotion.addEventListener('change', onMotionChange);
        document.addEventListener('visibilitychange', syncPlayback);
        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting; syncPlayback();
        });
        observer.observe(container);
        return () => {
            disposed = true; clearTimeout(timeout); stopFrames(); observer.disconnect();
            reducedMotion.removeEventListener('change', onMotionChange);
            document.removeEventListener('visibilitychange', syncPlayback);
            video.removeEventListener('loadeddata', checkFrame);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('pause', stopFrames);
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', sourceFailed);
            video.pause(); renderer?.dispose(); toggleRef.current = () => {};
        };
    }, [poster, webm, packed]);

    return (
        <div ref={containerRef} data-animation={id} className={`${styles.animation} ${className}`}>
            <div className={`${styles.frame} ${frameClassName}`} data-animation-frame>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} width="1280" height="720" alt={alt}
                    className={styles.visual} hidden={view !== 'poster'}
                    loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
                <video ref={videoRef} id={`${id}-animation`} muted playsInline loop preload="none"
                    width="1280" height="720" aria-hidden="true" tabIndex={-1}
                    className={styles.visual} style={{ opacity: view === 'video' ? 1 : 0 }} />
                <canvas ref={canvasRef} id={`${id}-canvas`} width="1280" height="720" aria-hidden="true"
                    className={styles.visual} style={{ opacity: view === 'canvas' ? 1 : 0 }} />
            </div>
            <div className={styles.controls}>
                {showControl && (
                    <button type="button" className={`${styles.motionControl} ${controlClassName}`}
                        aria-controls={`${id}-animation`} onClick={() => toggleRef.current()}
                        aria-label={`${paused ? 'Play' : 'Pause'} ${label} animation`}>
                        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
                        {paused ? 'Play animation' : 'Pause animation'}
                    </button>
                )}
            </div>
        </div>
    );
}
