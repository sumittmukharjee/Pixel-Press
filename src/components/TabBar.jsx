import React from 'react'
import styles from './TabBar.module.css'

const TABS = [
  { id: 'resize',    icon: '⚡', label: 'Resize Image' },
  { id: 'img2pdf',   icon: '📄', label: 'Image → PDF' },
  { id: 'pdf2img',   icon: '🖼️', label: 'PDF → Image' },
  { id: 'pdftool',   icon: '🗜️', label: 'PDF Size Tool' },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className={styles.wrap}>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`${styles.tab} ${active === t.id ? styles.active : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.icon}>{t.icon}</span>
          <span className={styles.label}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
