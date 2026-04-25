import React from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar({ theme, onToggle }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
      I❤️JPG <span>— Image Resizer</span>
      </div>
      <div className={styles.right}>
        <span className={styles.badge}>Free · Private</span>
        <button className={styles.themeBtn} onClick={onToggle} aria-label="Toggle theme">
          {theme === 'light'
            ? <><Moon size={14} /> Dark</>
            : <><Sun size={14} /> Light</>}
        </button>
      </div>
    </nav>
  )
}
