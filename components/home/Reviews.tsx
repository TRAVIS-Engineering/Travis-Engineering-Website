"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, Star } from 'lucide-react';
import { googleReviews } from '@/data/googleReviews';
import styles from './Reviews.module.css';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeToMotionChange(callback: () => void) {
    const query = window.matchMedia(motionQuery);
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
}

export default function Reviews() {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLUListElement>(null);
    const inViewRef = useRef(false);
    const [playing, setPlaying] = useState(true);
    const [hovering, setHovering] = useState(false);
    const [canSlide, setCanSlide] = useState(false);
    const reducedMotion = useSyncExternalStore(
        subscribeToMotionChange,
        () => window.matchMedia(motionQuery).matches,
        () => true,
    );

    const slide = useCallback((direction: number) => {
        const track = trackRef.current;
        const card = track?.firstElementChild;
        if (!track || !card) return;
        const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
        const maximum = track.scrollWidth - track.clientWidth;
        const current = track.scrollLeft;
        const destination = direction > 0
            ? (current >= maximum - 2 ? 0 : Math.min(current + step, maximum))
            : (current <= 2 ? maximum : Math.max(current - step, 0));
        track.scrollTo({ left: destination, behavior: reducedMotion ? 'instant' : 'smooth' });
    }, [reducedMotion]);

    useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;
        const observer = new IntersectionObserver(([entry]) => {
            inViewRef.current = entry.isIntersecting;
        }, { threshold: 0.25 });
        observer.observe(section);
        const resizeObserver = new ResizeObserver(() => {
            setCanSlide(track.scrollWidth > track.clientWidth + 2);
        });
        resizeObserver.observe(track);
        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!canSlide || !playing || hovering || reducedMotion) return;
        const interval = window.setInterval(() => {
            if (inViewRef.current && !document.hidden) {
                slide(1);
            }
        }, 6500);
        return () => window.clearInterval(interval);
    }, [canSlide, playing, hovering, reducedMotion, slide]);

    if (!googleReviews.reviews.length) return null;

    const navigate = (direction: number) => {
        setPlaying(false);
        slide(direction);
    };

    return (
        <section
            id="reviews"
            ref={sectionRef}
            className={styles.section}
            aria-labelledby="reviews-title"
            aria-roledescription="carousel"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocusCapture={(event) => {
                if (!(event.target instanceof HTMLElement) || !event.target.closest('[data-review-rotation]')) {
                    setPlaying(false);
                }
            }}
        >
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>CLIENT EXPERIENCES</p>
                        <h2 id="reviews-title" className={styles.title}>What our clients say.</h2>
                        <p className={styles.subtitle}>Selected Google reviews of our engineering services and training.</p>
                    </div>
                    <a className={styles.allReviews} href={googleReviews.url} target="_blank" rel="noopener noreferrer">
                        Read all Google reviews <ArrowUpRight size={18} aria-hidden="true" />
                        <span className={styles.srOnly}> (opens in a new tab)</span>
                    </a>
                </div>

                <ul
                    id="google-review-cards"
                    ref={trackRef}
                    className={styles.track}
                    aria-label="Client reviews"
                    tabIndex={0}
                    onPointerDown={() => setPlaying(false)}
                    onKeyDown={(event) => {
                        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                        event.preventDefault();
                        navigate(event.key === 'ArrowRight' ? 1 : -1);
                    }}
                >
                    {googleReviews.reviews.map((review) => (
                        <li key={review.url} className={styles.card}>
                            <div className={styles.cardTop}>
                                <div className={styles.stars} role="img" aria-label={`${review.rating} out of 5 stars`}>
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <Star key={index} size={17} fill={index < review.rating ? 'currentColor' : 'none'} aria-hidden="true" />
                                    ))}
                                </div>
                                <span className={styles.source}>Google review</span>
                            </div>
                            <blockquote className={styles.quote}>
                                <p>“{review.excerpt}”</p>
                            </blockquote>
                            <a href={review.url} target="_blank" rel="noopener noreferrer" className={styles.authorLink}>
                                <span className={styles.avatar} aria-hidden="true">{review.author.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</span>
                                <span className={styles.authorDetails}>
                                    <span className={styles.author}>{review.author}</span>
                                    <span className={styles.readReview}>Read review on Google<span className={styles.srOnly}> (opens in a new tab)</span></span>
                                </span>
                                <ArrowUpRight size={20} className={styles.externalIcon} aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                </ul>

                {canSlide && (
                    <div className={styles.controls}>
                        <span className={styles.hint}>Use the arrows or swipe to explore.</span>
                        <div className={styles.buttons}>
                            {!reducedMotion && (
                                <button
                                    type="button"
                                    data-review-rotation
                                    className={styles.control}
                                    onClick={() => setPlaying(value => !value)}
                                    aria-label={playing ? 'Pause automatic review rotation' : 'Start automatic review rotation'}
                                    aria-controls="google-review-cards"
                                >
                                    {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
                                </button>
                            )}
                            <button type="button" className={styles.control} onClick={() => navigate(-1)} aria-label="Previous reviews" aria-controls="google-review-cards">
                                <ArrowLeft size={20} aria-hidden="true" />
                            </button>
                            <button type="button" className={styles.control} onClick={() => navigate(1)} aria-label="Next reviews" aria-controls="google-review-cards">
                                <ArrowRight size={20} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
