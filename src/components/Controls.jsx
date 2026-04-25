import React from 'react'
import styles from './Controls.module.css'

const FORMATS = ['jpeg', 'png', 'webp']

export default function Controls({
  width, height, quality, format, lockAspect, targetKB, targetUnit,
  onWidth, onHeight, onQuality, onFormat, onLock, onTargetKB, onTargetUnit,
}) {
  return (
    <div className={styles.wrap}>

      {/* Dimensions */}
      <div className={styles.section}>
        <span className="label">📐 Dimensions</span>
        <div className={styles.dimRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Width (px)</label>
            <input type="number" value={width} min={1} max={10000}
              onChange={e => onWidth(e.target.value)} placeholder="e.g. 400" />
          </div>
          <div className={styles.sep}>×</div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Height (px)</label>
            <input type="number" value={height} min={1} max={10000}
              onChange={e => onHeight(e.target.value)} placeholder="e.g. 300" />
          </div>
        </div>
        <label className={styles.lockRow}>
          <span className={styles.toggle}>
            <input type="checkbox" checked={lockAspect} onChange={e => onLock(e.target.checked)} />
            <span className={styles.track}><span className={styles.thumb}></span></span>
          </span>
          <span className={styles.lockLabel}>Lock aspect ratio</span>
        </label>
      </div>

      {/* Format */}
      <div className={styles.section}>
        <span className="label">🎨 Output Format</span>
        <div className={styles.fmtRow}>
          {FORMATS.map(f => (
            <button
              key={f}
              className={`${styles.fmtBtn} ${format === f ? styles.fmtActive : ''}`}
              onClick={() => onFormat(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className={styles.section}>
        <div className={styles.qualRow}>
          <span className="label" style={{margin:0}}>Quality</span>
          <span className={styles.qualVal}>{format === 'png' ? 'Lossless' : quality + '%'}</span>
        </div>
        <input type="range" min={1} max={100} value={quality}
          onChange={e => onQuality(Number(e.target.value))}
          disabled={format === 'png'}
          style={{ opacity: format === 'png' ? 0.35 : 1 }}
        />
      </div>

      {/* Target size */}
      <div className={styles.section}>
        <span className="label">🎯 Target File Size <em className={styles.opt}>(optional)</em></span>
        <div className={styles.targetRow}>
          <input type="number" value={targetKB} min={1} max={100000}
            onChange={e => onTargetKB(e.target.value)}
            placeholder="e.g. 50 — leave blank to skip"
          />
          <select value={targetUnit} onChange={e => onTargetUnit(e.target.value)} style={{width:'80px'}}>
            <option value="kb">KB</option>
            <option value="mb">MB</option>
          </select>
        </div>
        <div className={styles.hint}>Auto-adjusts quality to hit your size target</div>
      </div>

    </div>
  )
}
