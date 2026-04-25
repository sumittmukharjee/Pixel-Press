import React, { useRef, useState } from 'react'
import { Zap, Image, FileText, Maximize2, ArrowLeftRight } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { useImageProcessor } from './hooks/useImageProcessor'
import Navbar from './components/Navbar'
import DropZone from './components/DropZone'
import Presets from './components/Presets'
import Controls from './components/Controls'
import PreviewPanel from './components/PreviewPanel'
import OutputPanel from './components/OutputPanel'
import ImageToPDF from './components/ImageToPDF'
import PDFToImage from './components/PDFToImage'
import PDFSizeChanger from './components/PDFSizeChanger'
import Footer from './components/Footer'
import Toast from './components/Toast'
import styles from './App.module.css'

const TABS = [
  { id: 'resize',     label: 'Image Resizer',    icon: Image,         desc: 'Resize & compress images' },
  { id: 'img2pdf',    label: 'Image → PDF',       icon: FileText,      desc: 'Convert images to PDF' },
  { id: 'pdf2img',    label: 'PDF → Image',       icon: ArrowLeftRight,desc: 'Extract PDF pages as images' },
  { id: 'pdfsize',    label: 'PDF Page Resizer',  icon: Maximize2,     desc: 'Change PDF page dimensions' },
]

export default function App() {
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState('resize')
  const toastRef = useRef()
  const ip = useImageProcessor()

  const handleFile = (file) => {
    const ok = ip.loadFile(file)
    if (!ok) toastRef.current?.show('⚠️ Please select a valid image file')
  }

  const handleProcess = async () => {
    await ip.process()
    toastRef.current?.show('✅ Done! Your image is ready.')
  }

  const handleReset = () => {
    ip.reset()
    toastRef.current?.show('🔄 Ready for a new image')
  }

  return (
    <>
      <Navbar theme={theme} onToggle={toggle} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`${styles.heroTag} animate-fadeUp`}>
          <Zap size={12} /> No Upload · 100% Browser-Based · Instant
        </div>
        <h1 className={`${styles.h1} animate-fadeUp`} style={{animationDelay:'0.1s'}}>
          Your Image &amp; PDF<br /><em>Swiss Army Knife</em>
        </h1>
        <p className={`${styles.sub} animate-fadeUp`} style={{animationDelay:'0.2s'}}>
          Resize images, convert to PDF, extract PDF pages as images, and resize PDF pages —
          all free, all private, all in your browser.
        </p>
      </section>

      <main className={styles.main}>
        {/* Tab bar */}
        <div className={`${styles.tabBar} animate-fadeUp`} style={{animationDelay:'0.25s'}}>
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                <Icon size={15} strokeWidth={2} />
                <span className={styles.tabLabel}>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tool card */}
        <div className={`card animate-fadeUp`} style={{animationDelay:'0.3s'}}>

          {/* ── IMAGE RESIZER ── */}
          {tab === 'resize' && (
            <>
              {!ip.originalFile
                ? <div className={styles.pad}><DropZone onFile={handleFile} /></div>
                : (
                  <>
                    <PreviewPanel
                      originalFile={ip.originalFile}
                      originalImg={ip.originalImg}
                      livePreview={ip.livePreview}
                      liveInfo={ip.liveInfo}
                    />
                    <div className="divider" />
                    <Presets onApply={ip.applyPreset} />
                    <div className="divider" style={{margin:'8px 0'}} />
                    <Controls
                      width={ip.width} height={ip.height}
                      quality={ip.quality} format={ip.format}
                      lockAspect={ip.lockAspect}
                      targetKB={ip.targetKB} targetUnit={ip.targetUnit}
                      onWidth={ip.setWidth} onHeight={ip.setHeight}
                      onQuality={ip.updateQuality} onFormat={ip.updateFormat}
                      onLock={ip.setLockAspect}
                      onTargetKB={ip.setTargetKB} onTargetUnit={ip.setTargetUnit}
                    />
                    <div className={styles.actions}>
                      <button className={styles.resetBtn} onClick={handleReset}>↺ Reset</button>
                      <button
                        className={styles.processBtn}
                        onClick={handleProcess}
                        disabled={ip.processing}
                      >
                        {ip.processing
                          ? <><span className={styles.spinner} /> Processing…</>
                          : '✦ Resize & Compress'}
                      </button>
                    </div>
                    {ip.output && (
                      <>
                        <div className="divider" />
                        <OutputPanel output={ip.output} onReset={handleReset} />
                      </>
                    )}
                  </>
                )
              }
            </>
          )}

          {/* ── IMAGE TO PDF ── */}
          {tab === 'img2pdf' && <ImageToPDF />}

          {/* ── PDF TO IMAGE ── */}
          {tab === 'pdf2img' && <PDFToImage />}

          {/* ── PDF SIZE CHANGER ── */}
          {tab === 'pdfsize' && <PDFSizeChanger />}

        </div>
      </main>

      <Footer />
      <Toast ref={toastRef} />
    </>
  )
}
