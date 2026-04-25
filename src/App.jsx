import React, { useRef } from 'react'
import { Zap } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { useImageProcessor } from './hooks/useImageProcessor'
import Navbar from './components/Navbar'
import DropZone from './components/DropZone'
import Presets from './components/Presets'
import Controls from './components/Controls'
import PreviewPanel from './components/PreviewPanel'
import OutputPanel from './components/OutputPanel'
import Footer from './components/Footer'
import Toast from './components/Toast'
import styles from './App.module.css'

export default function App() {
  const { theme, toggle } = useTheme()
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
          Resize Photos.<br />Beat <em>Any</em> Size Limit.
        </h1>
        <p className={`${styles.sub} animate-fadeUp`} style={{animationDelay:'0.2s'}}>
          Compress, resize & convert images to exact KB limits or pixel dimensions.
          Built for every portal that rejects your perfectly good photo.
        </p>
      </section>

      {/* Main card */}
      <main className={styles.main}>
        <div className={`card animate-fadeUp`} style={{animationDelay:'0.3s'}}>

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
        </div>
      </main>

      <Footer />
      <Toast ref={toastRef} />
    </>
  )
}
