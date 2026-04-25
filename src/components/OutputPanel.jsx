import React from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { formatBytes } from '../hooks/useImageProcessor'
import styles from './OutputPanel.module.css'

export default function OutputPanel({ output, onReset }) {
  if (!output) return null

  const reduced = output.reduction > 0

  return (
    <div className={`${styles.wrap} animate-scaleIn`}>
      <div className={styles.header}>
        <div className={styles.title}>✅ Ready to Download</div>
        <button className={styles.resetBtn} onClick={onReset}>
          <RefreshCw size={13} /> New Image
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.imgWrap}>
          <img src={output.dataURL} alt="output" className={styles.img} />
        </div>
        <div className={styles.stats}>
          <StatRow label="Original" val={formatBytes(output.origBytes)} />
          <StatRow label="Output" val={formatBytes(output.bytes)} highlight="green" />
          <StatRow
            label="Reduction"
            val={(reduced ? '▼ ' : '▲ ') + Math.abs(output.reduction) + '%'}
            highlight={reduced ? 'green' : 'orange'}
          />
          <StatRow label="Dimensions" val={`${output.w}×${output.h}px`} />
          <StatRow label="Format" val={output.fmt.toUpperCase()} />
          <StatRow label="Quality" val={output.quality} />
        </div>
      </div>

      <a
        href={output.dataURL}
        download={output.filename}
        className={styles.dlBtn}
      >
        <Download size={18} /> Download — {formatBytes(output.bytes)}
      </a>
    </div>
  )
}

function StatRow({ label, val, highlight }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statKey}>{label}</span>
      <span className={`${styles.statVal} ${highlight ? styles[highlight] : ''}`}>{val}</span>
    </div>
  )
}
