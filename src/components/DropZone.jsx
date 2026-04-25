import React, { useState, useRef } from 'react'
import styles from './DropZone.module.css'

export default function DropZone({ onFile }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const handle = (file) => {
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      className={`${styles.zone} ${drag ? styles.dragging : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={e => handle(e.target.files[0])}
      />
      <div className={styles.icon}>🖼️</div>
      <div className={styles.title}>Drop your image here</div>
      <div className={styles.sub}>
        or <span>click to browse</span> · JPG, PNG, WebP, GIF, BMP · Any size
      </div>
      <div className={styles.pill}>No upload · Stays in your browser</div>
    </div>
  )
}
