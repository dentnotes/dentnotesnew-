import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logo}>DENTNOTES</div>
        <nav className={styles.nav}>
          <a href="/contact" className={styles.navLink}>CONTACT</a>
          <a href="/projects" className={styles.navLink}>GET STARTED</a>
        </nav>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.copyright}>
        <span>© 2024 DENTNOTES ALL RIGHTS RESERVED</span>
        <span className={styles.email}>ENQUIRES@DENTNOTES.COM</span>
      </div>
    </footer>
  );
}