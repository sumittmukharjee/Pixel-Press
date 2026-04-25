import React, { useState } from 'react'
import styles from './Presets.module.css'

const PRESETS = [
  { label: '200×200', sub: 'Passport', w: 200, h: 200 },
  { label: '150×200', sub: 'Aadhaar', w: 150, h: 200 },
  { label: '100×120', sub: 'PAN Card', w: 100, h: 120 },
  { label: '35×45', sub: 'Visa Photo', w: 35, h: 45 },
  { label: '400×400', sub: 'Profile Pic', w: 400, h: 400 },
  { label: '600×450', sub: 'Form Photo', w: 600, h: 450 },
  { label: '800×600', sub: 'Web Image', w: 800, h: 600 },
  { label: '1920×1080', sub: 'Full HD', w: 1920, h: 1080 },
]

export default function Presets({ onApply }) {
  const [active, setActive] = useState(null)
  return (
    <div className={styles.wrap}>
      <span className="label">⚡ Quick Presets</span>
      <div className={styles.chips}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            className={`${styles.chip} ${active === p.label ? styles.active : ''}`}
            onClick={() => { setActive(p.label); onApply(p.w, p.h, 'jpeg') }}
          >
            <span className={styles.chipDim}>{p.label}</span>
            <span className={styles.chipSub}>{p.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
