import React, { useState, useRef, useCallback } from 'react'
import { FileText, Download } from 'lucide-react'
import styles from './PDFToImage.module.css'

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

const SCALE_MAP = { high: 2.5, moderate: 1.8, low: 1.2 }

export default function PDFToImage() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [quality, setQuality] = useState('high')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const inputRef = useRef()

  const loadPDF = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    setResults([])
    setPages([])
    setProcessing(true)

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const thumbs = []
      const scale = 0.4

      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        thumbs.push({ pageNum: i, thumb: canvas.toDataURL('image/jpeg', 0.6) })
      }
      setPages(thumbs.map((t, i) => ({ ...t, selected: true })))
    } catch (e) { console.error(e) }
    setProcessing(false)
  }, [])

  const togglePage = (i) => setPages(prev => prev.map((p, idx) => idx === i ? { ...p, selected: !p.selected } : p))
  const selectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: true })))
  const selectNone = () => setPages(prev => prev.map(p => ({ ...p, selected: false })))

  const convert = useCallback(async () => {
    if (!file || !pages.length) return
    setProcessing(true)
    setProgress(0)
    setResults([])

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const selected = pages.filter(p => p.selected)
      const scale = SCALE_MAP[quality]
      const q = quality === 'high' ? 0.95 : quality === 'moderate' ? 0.82 : 0.65
      const out = []

      for (let i = 0; i < selected.length; i++) {
        const page = await pdf.getPage(selected[i].pageNum)
        const vp = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        const fmt = outputFormat === 'png' ? 'image/png' : 'image/jpeg'
        const dataURL = canvas.toDataURL(fmt, outputFormat === 'png' ? undefined : q)
        const bytes = Math.round((dataURL.length - 22) * 3 / 4)
        const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat
        out.push({ dataURL, pageNum: selected[i].pageNum, bytes, ext })
        setProgress(Math.round(((i + 1) / selected.length) * 100))
      }
      setResults(out)
    } catch (e) { console.error(e) }
    setProcessing(false)
  }, [file, pages, outputFormat, quality])

  const downloadAll = () => {
    results.forEach((r, i) => {
      const a = document.createElement('a')
      a.href = r.dataURL
      a.download = `pixelpress_page${r.pageNum}.${r.ext}`
      a.click()
    })
  }

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
        <FileText size={28} strokeWidth={1.5} style={{color:'var(--accent)', marginBottom:10}} />
        <div className={styles.dzTitle}>
          {file ? file.name : 'Drop a PDF here or click to browse'}
        </div>
        <div className={styles.dzSub}>
          {file ? `${formatBytes(file.size)} · ${pages.length} pages loaded` : 'PDF files only · Max 20 pages shown'}
        </div>
      </div>

      {/* Page selector */}
      {pages.length > 0 && (
        <div className={styles.pageSelector}>
          <div className={styles.psHeader}>
            <span className="label" style={{margin:0}}>🗂️ Select Pages ({pages.filter(p=>p.selected).length}/{pages.length})</span>
            <div className={styles.selBtns}>
              <button className={styles.selBtn} onClick={selectAll}>All</button>
              <button className={styles.selBtn} onClick={selectNone}>None</button>
            </div>
          </div>
          <div className={styles.thumbGrid}>
            {pages.map((p, idx) => (
              <div
                key={p.pageNum}
                className={`${styles.thumb} ${p.selected ? styles.thumbActive : ''}`}
                onClick={() => togglePage(idx)}
              >
                <img src={p.thumb} alt={`Page ${p.pageNum}`} />
                <div className={styles.thumbLabel}>P{p.pageNum}</div>
                <div className={styles.thumbCheck}>{p.selected ? '✓' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {pages.length > 0 && (
        <div className={styles.settings}>
          <div className={styles.settingsGrid}>
            <div className={styles.field}>
              <label className="label">Output Format</label>
              <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG (Lossless)</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className="label">Quality / Resolution</label>
              <select value={quality} onChange={e => setQuality(e.target.value)}>
                <option value="high">High (2.5× scale)</option>
                <option value="moderate">Moderate (1.8× scale)</option>
                <option value="low">Low (1.2× scale)</option>
              </select>
            </div>
          </div>

          {processing && progress > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{width: progress + '%'}} />
            </div>
          )}

          <button className={styles.convertBtn} onClick={convert} disabled={processing || !pages.filter(p=>p.selected).length}>
            {processing
              ? <><span className={styles.spinner}/> Converting… {progress > 0 ? progress + '%' : ''}</>
              : `🖼️ Convert ${pages.filter(p=>p.selected).length} Page${pages.filter(p=>p.selected).length !== 1 ? 's' : ''} to ${outputFormat.toUpperCase()}`
            }
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className={`${styles.results} animate-scaleIn`}>
          <div className={styles.resHeader}>
            <span className={styles.resTitle}>✅ {results.length} image{results.length > 1 ? 's' : ''} ready</span>
            {results.length > 1 && (
              <button className={styles.dlAllBtn} onClick={downloadAll}>
                <Download size={14}/> Download All
              </button>
            )}
          </div>
          <div className={styles.resGrid}>
            {results.map(r => (
              <div key={r.pageNum} className={styles.resItem}>
                <img src={r.dataURL} alt={`page ${r.pageNum}`} className={styles.resImg} />
                <div className={styles.resInfo}>
                  <span>Page {r.pageNum}</span>
                  <span className={styles.resSizeTag}>~{formatBytes(r.bytes)}</span>
                </div>
                <a href={r.dataURL} download={`pixelpress_page${r.pageNum}.${r.ext}`} className={styles.resDownload}>
                  <Download size={13}/>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
