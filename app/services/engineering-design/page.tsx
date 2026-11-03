import Header from '@/components/home/Header';
import Contact from '@/components/home/Contact';
import Footer from '@/components/home/Footer';
import BackToHomeButton from '@/components/BackToHomeButton';
import TransparentAnimation from '@/components/TransparentAnimation';
import { designAnimation } from '@/data/animations';
import styles from './engineering-design.module.css';

const capabilities = [
  'Structural repair and reinforcement',
  'Building envelope remediation',
  'Construction drawings and details',
  'Code compliance and retrofit design',
  'Insurance and capital project support',
];

export default function EngineeringDesignPage() {
  return (
    <main>
      <Header />
      <section className={styles.page}>
        <div className={styles.container}>
          <BackToHomeButton />
          <div className={`${styles.grid} ${styles.animatedGrid}`}>
            <div>
              <h1 className={styles.title}>Engineering Design Services</h1>
              <p className={styles.copy}>
                We deliver practical engineering design services focused on constructability, performance,
                and code compliance.
              </p>
              <p className={styles.copy}>
                Our designs support repairs, retrofits, and new construction across residential, commercial,
                and institutional projects.
              </p>

              <div className={styles.capabilitiesTitle}>Design Capabilities</div>
              <div className={styles.capabilities}>
                {capabilities.map((item) => (
                  <div key={item} className={styles.capability}>{item}</div>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.capabilitiesTitle}>Design Services</div>
              <TransparentAnimation key={designAnimation.id} animation={designAnimation} />
            </div>
          </div>
        </div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}
