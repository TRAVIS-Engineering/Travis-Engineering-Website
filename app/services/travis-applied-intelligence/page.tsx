import Header from '@/components/home/Header';
import Contact from '@/components/home/Contact';
import Footer from '@/components/home/Footer';
import BackToHomeButton from '@/components/BackToHomeButton';
import TransparentAnimation from '@/components/TransparentAnimation';
import { intelligenceAnimation } from '@/data/animations';
import styles from '../engineering-design/engineering-design.module.css';

const capabilities = [
  'AI workflow automation',
  'Digital engineering support',
  'Data-driven reporting',
  'Smart documentation tools',
  'Process optimization',
  'Built environment technology',
];

export default function TravisAppliedIntelligencePage() {
  return (
    <main>
      <Header />
      <section className={styles.page}>
        <div className={styles.container}>
          <BackToHomeButton />
          <div className={`${styles.grid} ${styles.animatedGrid}`}>
            <div>
              <h1 className={styles.title}>Travis Applied Intelligence</h1>
              <p className={styles.copy}>
                By combining practical field experience with emerging digital systems, Travis Applied
                Intelligence helps streamline reporting, reduce repetitive documentation tasks, and
                support more efficient inspection workflows.
              </p>
              <p className={styles.copy}>
                From AI-assisted field reports and weather analysis to structured documentation and
                digital process development, our approach is focused on using technology as a practical
                support tool for professionals — helping teams work faster, document more accurately,
                and deliver stronger technical reporting.
              </p>

              <div className={styles.capabilitiesTitle}>Solutions</div>
              <div className={styles.capabilities}>
                {capabilities.map((item) => (
                  <div key={item} className={styles.capability}>{item}</div>
                ))}
              </div>
            </div>

            <div>
              <TransparentAnimation key={intelligenceAnimation.id} animation={intelligenceAnimation} />
            </div>
          </div>
        </div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}
