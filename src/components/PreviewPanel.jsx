import React from 'react'
import { formatBytes } from '../hooks/useImageProcessor'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ originalFile, originalImg, livePreview, liveInfo }) {
  if (!originalFile || !originalImg) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.boxLabel}>Original</div>
        <div className={styles.imgWrap}>
          <img src={originalImg.src} alt="original" className={styles.img} />
        </div>
        <div className={styles.meta}>
          <span>{originalImg.width}×{originalImg.height}px</span>
          <span>{formatBytes(originalFile.size)}</span>
          <span>{originalFile.type.split('/')[1]?.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.arrow}>→</div>

      <div className={styles.box}>
        <div className={styles.boxLabel}>Preview</div>
        <div className={styles.imgWrap}>
          {livePreview
            ? <img src={livePreview} alt="preview" className={styles.img} />
            : <div className={styles.skeleton} />}
        </div>
        {liveInfo && (
          <div className={styles.meta}>
            <span>{liveInfo.w}×{liveInfo.h}px</span>
            <span className={styles.sizeHl}>~{formatBytes(liveInfo.bytes)}</span>
            <span>{liveInfo.fmt?.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
