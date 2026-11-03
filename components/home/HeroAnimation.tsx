import TransparentAnimation from '@/components/TransparentAnimation';
import { homeAnimation } from '@/data/animations';
import styles from './Hero.module.css';

export default function HeroAnimation() {
    return <TransparentAnimation key={homeAnimation.id} animation={homeAnimation} priority
        className={styles.animation} frameClassName={styles.animationFrame} controlClassName={styles.motionControl} />;
}
