// 'use client'
// import React from 'react';
// // import { Button, List, ListItem, ListItemText, Box } from '@mui/material';
// import styles from "./page.module.css";
// import Footer from 'C:\\Users\\jedho\\OneDrive\\Documents\\(9) Dentnotes\\dentnotes\\src\\app\\components\\Footer';
// // import ProjectList from '../components/ProjectList'; // Import the ProjectList component
// import { Dancing_Script, Instrument_Sans } from 'next/font/google';
// const jetBrainsMono = Instrument_Sans({subsets: ['latin']});
// import dynamic from 'next/dynamic';


// export default function Landing() {
//   return (
//     <main className={styles.main}>
//       <div className={styles.content}>
//         <div className={styles.topBar}>
//           <a href="/" className={styles.logoLink}>
//             <div className={styles.logo}>dentnotes</div>
//           </a>
//           <nav className={styles.navLinks}>
//             <a href="/" className={styles.navLink}>home</a>
//             <a href="/projects" className={styles.navLink}>contact</a>
//             <a href="/contact" className={styles.navLink}>get started</a>
//           </nav>
//         </div>
//       </div>
//       <Footer />
//     </main>
//   );
// }




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

