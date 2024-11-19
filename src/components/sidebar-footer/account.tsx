"use client"

import Image from 'next/image'
import styles from './PsrScores.module.css'

const Account: React.FC = () => {
  return (
    <div className={styles.welcome}>
      <div className={styles.generate}>
        <div className={styles.box}>
          <h2 className="text-xl mb-4">PSR Scores</h2>
          <Image
            src="/psr-guide.png"
            alt="molar2"
            // className="center"
            width={800}
            height={500}
            priority
            style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
          />
        </div>
      </div>
    </div>
  )
}

export default Account
