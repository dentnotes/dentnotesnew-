import Footer from './components/Footer';
import Link from 'next/link'
import Image from 'next/image'
import { Zap } from 'lucide-react'
import styles from './page.module.css'

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="https://dentnotes.com" className={styles.logo}>
          <span>DENTNOTES</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="https://dentnotes.com" className={styles.navLink}>
            contact us
          </Link>
          <Link href="https://dentnotes.com" className={`${styles.button} ${styles.navButton}`}>
            get started
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Create dental clinic<br />notes like never before.
            </h1>
            <p className={styles.subtitle}>
              Forget manually typing your clinic notes, generate notes in seconds
            </p>
            <Link href="https://dentnotes.com" className={`${styles.button} ${styles.heroButton}`}>
              <Zap className={styles.buttonIcon} />
              Start clinics better
            </Link>
          </div>
        </section>

        <section className={styles.trust}>
          <p className={styles.trustText}>trusted by folks from</p>
          <Image
            src="/uq logo.png"
            alt="University Logo"
            className={styles.trustLogo}
            width={200}
            height={48}
          />
        </section>

        <div className={styles.footerWrapper}>
          <Footer />
        </div>
      </main>
    </div>
  )
}

