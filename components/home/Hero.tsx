import { siteData } from '@/data/siteData';
import HeroAnimation from './HeroAnimation';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.gridBackground} aria-hidden="true" />
            <div className={styles.container}>
                <HeroAnimation />
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        {siteData.hero.title}
                    </h1>
                    <h2 className={styles.subtitle}>{siteData.hero.subtitle}</h2>
                    <p className={styles.description}>{siteData.hero.description}</p>
                    <a href={siteData.hero.ctaLink} className={styles.ctaButton}>
                        {siteData.hero.ctaText}
                    </a>
                </div>
            </div>
        </section>
    );
}
