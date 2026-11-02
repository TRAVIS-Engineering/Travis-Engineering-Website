"use client";

import { useState, type CSSProperties } from 'react';
import { ArrowUpRight, Pause, Play, Star } from 'lucide-react';
import { googleReviews } from '@/data/googleReviews';
import styles from './Reviews.module.css';

export default function Reviews() {
    const [paused, setPaused] = useState(false);
    if (!googleReviews.reviews.length) return null;

    return (
        <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>CLIENT EXPERIENCES</p>
                        <h2 id="reviews-title" className={styles.title}>What Our Clients Have To Say</h2>
                        <p className={styles.subtitle}>Selected Google reviews of our engineering services and training.</p>
                    </div>
                    <a className={styles.allReviews} href={googleReviews.url} target="_blank" rel="noopener noreferrer">
                        Read all Google reviews <ArrowUpRight size={18} aria-hidden="true" />
                        <span className={styles.srOnly}> (opens in a new tab)</span>
                    </a>
                </div>

                <div className={styles.viewport}>
                    <div
                        id="google-review-cards"
                        className={styles.track}
                        data-paused={paused}
                        style={{ '--review-duration': `${googleReviews.reviews.length * 12}s` } as CSSProperties}
                    >
                        {[false, true].map(copy => (
                            <ul key={String(copy)} className={styles.group} aria-label={copy ? undefined : 'Client reviews'} aria-hidden={copy || undefined}>
                                {googleReviews.reviews.map(review => (
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
                                        <a href={review.url} target="_blank" rel="noopener noreferrer" className={styles.authorLink} tabIndex={copy ? -1 : undefined}>
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
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className={styles.pause}
                    onClick={() => setPaused(value => !value)}
                    aria-label={paused ? 'Resume review scrolling' : 'Pause review scrolling'}
                    aria-controls="google-review-cards"
                >
                    {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                    {paused ? 'Resume scrolling' : 'Pause scrolling'}
                </button>
            </div>
        </section>
    );
}
