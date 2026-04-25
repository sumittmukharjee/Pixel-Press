import React from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>Pixel<span>Press</span></div>

      <div className={styles.rant}>
        <div className={styles.rantTitle}>😤 A Love Letter to Indian Government Portals</div>
        <p>Dear <em>every government website ever</em>, thank you for insisting my passport photo must be <em>exactly 20 KB</em>. My 12 MP DSLR shot wasn't good enough, but a blurry 1998 webcam photo would be perfectly acceptable.</p>
        <p>Special thanks to portals that say "upload failed" with <em>zero explanation</em>. Was it the size? The format? The phase of the moon? We'll never know — and that's what makes it <em>exciting.</em></p>
        <p>And a standing ovation 👏 to the portal that accepts <em>JPG only</em> but throws the error "invalid JPEG format". A riddle wrapped in a mystery inside a 20 KB enigma.</p>
        <p>This tool exists because you made it necessary. We are not angry. We are just… <em>efficient now.</em></p>
      </div>

      <div className={styles.copy}>
        100% browser-based · No files uploaded · Your photos stay on your device ·{' '}
        <span>PixelPress</span> © {new Date().getFullYear()}
      </div>
    </footer>
  )
}
