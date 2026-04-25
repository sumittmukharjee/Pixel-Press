import React, { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { FileImage, Plus, Trash2, Download, ArrowUp, ArrowDown } from 'lucide-react'
import styles from './ImageToPDF.module.css'

const PAGE_SIZES = {
  'A4':      [595, 842],
  'A3':      [842, 1191],
  'Letter':  [612, 792],
  'Legal':   [612, 1008],
  'Fit Image': null,
}

const QUALITY_MAP = { high: 0.95, moderate: 0.82, low: 0.65 }

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

export default function ImageToPDF() {
  const [images, setImages] = useState([])
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('portrait')
  const [quality, setQuality] = useState('high')
  const [margin, setMargin] = useState(20)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  const addImages = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    imgs.forEach(file => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setImages(prev => [...prev, { file, url, w: img.width, h: img.height, id: Date.now() + Math.random() }])
      }
      img.src = url
    })
  }, [])

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id))
  const moveUp = (idx) => setImages(prev => { const a = [...prev]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a })
  const moveDown = (idx) => setImages(prev => { const a = [...prev]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a })

  const buildPDF = useCallback(async () => {
    if (!images.length) return
    setProcessing(true)
    setResult(null)
    try {
      const pdfDoc = await PDFDocument.create()
      const q = QUALITY_MAP[quality]

      for (const imgItem of images) {
        // Draw to canvas to get JPEG bytes at chosen quality
        const canvas = document.createElement('canvas')
        const img = new Image()
        await new Promise(r => { img.onload = r; img.src = imgItem.url })
        canvas.width = imgItem.w; canvas.height = imgItem.h
        canvas.getContext('2d').drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/jpeg', q)
        const base64 = dataURL.split(',')[1]
        const jpgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const embeddedImg = await pdfDoc.embedJpg(jpgBytes)

        // Determine page dimensions
        let [pw, ph] = PAGE_SIZES[pageSize] || [imgItem.w * 0.75, imgItem.h * 0.75]
        if (pageSize !== 'Fit Image' && orientation === 'landscape') [pw, ph] = [ph, pw]

        const page = pdfDoc.addPage([pw, ph])
        const m = margin
        const availW = pw - m * 2
        const availH = ph - m * 2
        const imgAR = embeddedImg.width / embeddedImg.height
        const boxAR = availW / availH

        let drawW, drawH
        if (imgAR > boxAR) { drawW = availW; drawH = availW / imgAR }
        else { drawH = availH; drawW = availH * imgAR }

        const x = m + (availW - drawW) / 2
        const y = m + (availH - drawH) / 2
        page.drawImage(embeddedImg, { x, y, width: drawW, height: drawH })
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setResult({ url, size: bytes.byteLength, pages: images.length })
    } catch (e) {
      console.error(e)
    }
    setProcessing(false)
  }, [images, pageSize, orientation, quality, margin])

  return (
    <div className={styles.wrap}>
      {/* Drop zone */}
      <div
        className={styles.dropZone}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver) }}
        onDragLeave={e => e.currentTarget.classList.remove(styles.dragOver)}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(styles.dragOver); addImages(e.dataTransfer.files) }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{display:'none'}}
          onChange={e => addImages(e.target.files)} />
        <FileImage size={28} strokeWidth={1.5} style={{color:'var(--accent2)', marginBottom:10}} />
        <div className={styles.dzTitle}>Drop images here or click to browse</div>
        <div className={styles.dzSub}>JPG, PNG, WebP, GIF · Multiple files supported</div>
      </div>

      {/* Image queue */}
      {images.length > 0 && (
        <div className={styles.queue}>
          <div className={styles.qHeader}>
            <span className="label" style={{margin:0}}>📋 Pages ({images.length})</span>
            <button className={styles.addMoreBtn} onClick={() => inputRef.current.click()}>
              <Plus size={13} /> Add More
            </button>
          </div>
          {images.map((img, idx) => (
            <div key={img.id} className={styles.qItem}>
              <img src={img.url} alt="" className={styles.qThumb} />
              <div className={styles.qInfo}>
                <div className={styles.qName}>{img.file.name}</div>
                <div className={styles.qMeta}>{img.w}×{img.h}px · {formatBytes(img.file.size)}</div>
              </div>
              <div className={styles.qActions}>
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className={styles.qBtn}><ArrowUp size={13}/></button>
                <button onClick={() => moveDown(idx)} disabled={idx === images.length-1} className={styles.qBtn}><ArrowDown size={13}/></button>
                <button onClick={() => removeImage(img.id)} className={`${styles.qBtn} ${styles.qDel}`}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {images.length > 0 && (
        <div className={styles.settings}>
          <div className={styles.settingsGrid}>
            <div className={styles.field}>
              <label className="label">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)}>
                {Object.keys(PAGE_SIZES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className="label">Orientation</label>
              <select value={orientation} onChange={e => setOrientation(e.target.value)}
                disabled={pageSize === 'Fit Image'}>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className="label">Image Quality</label>
              <select value={quality} onChange={e => setQuality(e.target.value)}>
                <option value="high">High (95%)</option>
                <option value="moderate">Moderate (82%)</option>
                <option value="low">Low (65%)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className="label">Margin (pt)</label>
              <input type="number" value={margin} min={0} max={100}
                onChange={e => setMargin(Number(e.target.value))} />
            </div>
          </div>

          <button
            className={styles.buildBtn}
            onClick={buildPDF}
            disabled={processing}
          >
            {processing
              ? <><span className={styles.spinner}/> Building PDF…</>
              : `📄 Convert ${images.length} Image${images.length > 1 ? 's' : ''} to PDF`}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`${styles.result} animate-scaleIn`}>
          <div className={styles.resultIcon}>✅</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultTitle}>PDF Ready — {result.pages} page{result.pages > 1 ? 's' : ''}</div>
            <div className={styles.resultSub}>{formatBytes(result.size)}</div>
          </div>
          <a href={result.url} download="pixelpress_output.pdf" className={styles.dlBtn}>
            <Download size={16} /> Download PDF
          </a>
        </div>
      )}
    </div>
  )
}
