import Header from '@/components/home/Header';
import Contact from '@/components/home/Contact';
import Footer from '@/components/home/Footer';
import BackToHomeButton from '@/components/BackToHomeButton';
import TransparentAnimation from '@/components/TransparentAnimation';
import { damageAnimation } from '@/data/animations';
import styles from '../engineering-design/engineering-design.module.css';

const capabilities = [
  'Storm, impact, fire, water, and collapse damage',
  'Building envelope and structural components',
  'Interior and exterior condition assessments',
  'Repair versus replacement evaluations',
  'Technical summaries and cost alignment support',
];

export default function DamageAssessmentsPage() {
  return (
    <main>
      <Header />
      <section className={styles.page}>
        <div className={styles.container}>
          <BackToHomeButton />
          <div className={`${styles.grid} ${styles.animatedGrid}`}>
            <div>
              <h1 className={styles.title}>Damage Assessments</h1>
              <p className={styles.copy}>
                We complete detailed damage assessments to determine the nature, cause, and extent of loss to
                buildings and infrastructure.
              </p>
              <p className={styles.copy}>
                Our assessments support insurance claims, legal matters, and risk management decisions.
              </p>

              <div className={styles.capabilitiesTitle}>Assessment Scope</div>
              <div className={styles.capabilities}>
                {capabilities.map((item) => (
                  <div key={item} className={styles.capability}>{item}</div>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.capabilitiesTitle}>Sample Damage Assessment</div>
              <TransparentAnimation key={damageAnimation.id} animation={damageAnimation} />
            </div>
          </div>
        </div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}
