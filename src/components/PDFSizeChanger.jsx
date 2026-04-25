import React, { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Maximize2, Download, FileText } from 'lucide-react'
import styles from './PDFSizeChanger.module.css'

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

const PRESETS = {
  'A4 Portrait':   { w: 595, h: 842 },
  'A4 Landscape':  { w: 842, h: 595 },
  'A3 Portrait':   { w: 842, h: 1191 },
  'A3 Landscape':  { w: 1191, h: 842 },
  'Letter':        { w: 612, h: 792 },
  'Legal':         { w: 612, h: 1008 },
  'A5 Portrait':   { w: 420, h: 595 },
  'Square (500)':  { w: 500, h: 500 },
}

const FIT_MODES = [
  { value: 'fit',    label: 'Fit (keep aspect)' },
  { value: 'fill',   label: 'Stretch to fill' },
  { value: 'crop',   label: 'Crop to center' },
  { value: 'pad',    label: 'Pad with white' },
]

export default function PDFSizeChanger() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [customW, setCustomW] = useState(595)
  const [customH, setCustomH] = useState(842)
  const [fitMode, setFitMode] = useState('fit')
  const [activePreset, setActivePreset] = useState('A4 Portrait')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  const loadPDF = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    setResult(null)
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setPageCount(pdf.getPageCount())
    } catch(e) { console.error(e) }
  }, [])

  const applyPreset = (name) => {
    setActivePreset(name)
    setCustomW(PRESETS[name].w)
    setCustomH(PRESETS[name].h)
  }

  const process = useCallback(async () => {
    if (!file) return
    setProcessing(true)
    setResult(null)

    try {
      const srcBytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(srcBytes)
      const outPdf = await PDFDocument.create()
      const pages = srcPdf.getPages()
      const tw = customW, th = customH

      for (const srcPage of pages) {
        const [copied] = await outPdf.copyPages(srcPdf, [srcPdf.getPages().indexOf(srcPage)])
        const { width: sw, height: sh } = copied.getSize()
        const newPage = outPdf.addPage([tw, th])

        const scaleX = tw / sw
        const scaleY = th / sh

        let scale, tx = 0, ty = 0, clipW = tw, clipH = th, srcX = 0, srcY = 0, embedW = sw, embedH = sh

        if (fitMode === 'fit') {
          scale = Math.min(scaleX, scaleY)
          const fw = sw * scale, fh = sh * scale
          tx = (tw - fw) / 2; ty = (th - fh) / 2
          newPage.drawPage(copied, { x: tx, y: ty, width: fw, height: fh })
        } else if (fitMode === 'fill') {
          newPage.drawPage(copied, { x: 0, y: 0, width: tw, height: th })
        } else if (fitMode === 'pad') {
          scale = Math.min(scaleX, scaleY)
          const fw = sw * scale, fh = sh * scale
          tx = (tw - fw) / 2; ty = (th - fh) / 2
          // White background already (default PDF)
          newPage.drawPage(copied, { x: tx, y: ty, width: fw, height: fh })
        } else if (fitMode === 'crop') {
          scale = Math.max(scaleX, scaleY)
          const fw = sw * scale, fh = sh * scale
          tx = (tw - fw) / 2; ty = (th - fh) / 2
          newPage.drawPage(copied, { x: tx, y: ty, width: fw, height: fh })
        }
      }

      const outBytes = await outPdf.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setResult({
        url,
        size: outBytes.byteLength,
        origSize: file.size,
        pages: pages.length,
        w: tw, h: th,
      })
    } catch(e) { console.error(e) }
    setProcessing(false)
  }, [file, customW, customH, fitMode])

  return (
    <div className={styles.wrap}>
      {/* Drop zone */}
      <div
        className={styles.dropZone}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver) }}
        onDragLeave={e => e.currentTarget.classList.remove(styles.dragOver)}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(styles.dragOver); loadPDF(e.dataTransfer.files[0]) }}
      >
        <input ref={inputRef} type="file" accept="application/pdf" style={{display:'none'}}
          onChange={e => loadPDF(e.target.files[0])} />
        <Maximize2 size={28} strokeWidth={1.5} style={{color:'var(--accent2)', marginBottom:10}} />
        <div className={styles.dzTitle}>
          {file ? file.name : 'Drop a PDF to resize its pages'}
        </div>
        <div className={styles.dzSub}>
          {file
            ? `${formatBytes(file.size)} · ${pageCount} page${pageCount !== 1 ? 's' : ''}`
            : 'All pages will be resized to your chosen dimensions'}
        </div>
      </div>

      {file && (
        <>
          {/* Presets */}
          <div className={styles.section}>
            <span className="label">⚡ Page Size Presets</span>
            <div className={styles.presetGrid}>
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  className={`${styles.presetBtn} ${activePreset === name ? styles.presetActive : ''}`}
                  onClick={() => applyPreset(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom dimensions */}
          <div className={styles.section}>
            <span className="label">📐 Custom Dimensions (points · 1pt = 1/72 inch)</span>
            <div className={styles.dimRow}>
              <div className={styles.field}>
                <label className={styles.dimLabel}>Width (pt)</label>
                <input type="number" value={customW} min={72} max={5000}
                  onChange={e => { setCustomW(Number(e.target.value)); setActivePreset('') }} />
              </div>
              <div className={styles.dimX}>×</div>
              <div className={styles.field}>
                <label className={styles.dimLabel}>Height (pt)</label>
                <input type="number" value={customH} min={72} max={5000}
                  onChange={e => { setCustomH(Number(e.target.value)); setActivePreset('') }} />
              </div>
              <div className={styles.dimHint}>
                = {(customW / 72 * 25.4).toFixed(0)}×{(customH / 72 * 25.4).toFixed(0)} mm
              </div>
            </div>
          </div>

          {/* Fit mode */}
          <div className={styles.section}>
            <span className="label">🔧 Content Fit Mode</span>
            <div className={styles.fitGrid}>
              {FIT_MODES.map(m => (
                <button
                  key={m.value}
                  className={`${styles.fitBtn} ${fitMode === m.value ? styles.fitActive : ''}`}
                  onClick={() => setFitMode(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className={styles.fitHint}>
              {fitMode === 'fit' && '↔ Scale to fit inside new dimensions, centered, no cropping'}
              {fitMode === 'fill' && '⇔ Stretch content to exactly fill — may distort aspect ratio'}
              {fitMode === 'crop' && '✂ Scale to fill, crop edges that overflow'}
              {fitMode === 'pad' && '▭ Scale to fit, add white padding on sides'}
            </div>
          </div>

          <button className={styles.processBtn} onClick={process} disabled={processing}>
            {processing
              ? <><span className={styles.spinner}/> Resizing pages…</>
              : `📄 Resize All ${pageCount} Page${pageCount !== 1 ? 's' : ''} → ${customW}×${customH}pt`}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className={`${styles.result} animate-scaleIn`}>
          <div className={styles.resultLeft}>
            <div className={styles.resultTitle}>✅ PDF Resized Successfully</div>
            <div className={styles.statRow}><span>Pages</span><span>{result.pages}</span></div>
            <div className={styles.statRow}><span>New Page Size</span><span>{result.w}×{result.h}pt</span></div>
            <div className={styles.statRow}><span>Original Size</span><span>{formatBytes(result.origSize)}</span></div>
            <div className={styles.statRow}><span>Output Size</span><span style={{color:'var(--success)'}}>{formatBytes(result.size)}</span></div>
          </div>
          <a href={result.url} download="pixelpress_resized.pdf" className={styles.dlBtn}>
            <Download size={16}/> Download PDF
          </a>
        </div>
      )}
    </div>
  )
}
