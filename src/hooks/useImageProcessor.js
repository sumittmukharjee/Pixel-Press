import { useState, useRef, useCallback } from 'react'

export function formatBytes(b) {
  if (!b) return '—'
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 / 1024).toFixed(2) + ' MB'
}

function getDataURLBytes(dataURL) {
  return Math.round((dataURL.length - 22) * 3 / 4)
}

export function useImageProcessor() {
  const [originalFile, setOriginalFile] = useState(null)
  const [originalImg, setOriginalImg] = useState(null)
  const [livePreview, setLivePreview] = useState(null)
  const [liveInfo, setLiveInfo] = useState(null)
  const [output, setOutput] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [width, setWidthState] = useState('')
  const [height, setHeightState] = useState('')
  const [quality, setQuality] = useState(85)
  const [format, setFormat] = useState('jpeg')
  const [lockAspect, setLockAspect] = useState(true)
  const [targetKB, setTargetKB] = useState('')
  const [targetUnit, setTargetUnit] = useState('kb')
  const aspectRef = useRef(1)
  const canvasRef = useRef(null)

  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    return canvasRef.current
  }, [])

  const renderLive = useCallback((img, w, h, q, fmt) => {
    const canvas = getCanvas()
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const dataURL = canvas.toDataURL('image/' + fmt, fmt === 'png' ? undefined : q / 100)
    const bytes = getDataURLBytes(dataURL)
    setLivePreview(dataURL)
    setLiveInfo({ w, h, bytes, fmt })
  }, [getCanvas])

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return false
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        aspectRef.current = img.width / img.height
        setOriginalFile(file)
        setOriginalImg(img)
        setWidthState(String(img.width))
        setHeightState(String(img.height))
        setOutput(null)
        renderLive(img, img.width, img.height, 85, 'jpeg')
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
    return true
  }, [renderLive])

  const setWidth = useCallback((val) => {
    setWidthState(val)
    if (lockAspect && val && originalImg) {
      const newH = Math.round(parseInt(val) / aspectRef.current)
      setHeightState(String(newH))
      renderLive(originalImg, parseInt(val), newH, quality, format)
    }
  }, [lockAspect, originalImg, quality, format, renderLive])

  const setHeight = useCallback((val) => {
    setHeightState(val)
    if (lockAspect && val && originalImg) {
      const newW = Math.round(parseInt(val) * aspectRef.current)
      setWidthState(String(newW))
      renderLive(originalImg, newW, parseInt(val), quality, format)
    }
  }, [lockAspect, originalImg, quality, format, renderLive])

  const updateQuality = useCallback((q) => {
    setQuality(q)
    if (originalImg) renderLive(originalImg, parseInt(width) || originalImg.width, parseInt(height) || originalImg.height, q, format)
  }, [originalImg, width, height, format, renderLive])

  const updateFormat = useCallback((f) => {
    setFormat(f)
    if (originalImg) renderLive(originalImg, parseInt(width) || originalImg.width, parseInt(height) || originalImg.height, quality, f)
  }, [originalImg, width, height, quality, renderLive])

  const applyPreset = useCallback((w, h, fmt) => {
    setWidthState(String(w))
    setHeightState(String(h))
    setFormat(fmt)
    setLockAspect(false)
    if (originalImg) renderLive(originalImg, w, h, quality, fmt)
  }, [originalImg, quality, renderLive])

  const process = useCallback(async () => {
    if (!originalImg) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 30))

    const w = parseInt(width) || originalImg.width
    const h = parseInt(height) || originalImg.height
    let q = quality
    const fmt = format
    const targetBytes = targetKB
      ? parseFloat(targetKB) * (targetUnit === 'mb' ? 1024 * 1024 : 1024)
      : null

    const canvas = getCanvas()
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(originalImg, 0, 0, w, h)

    let dataURL
    if (targetBytes && fmt !== 'png') {
      let lo = 1, hi = 100, best = null
      for (let i = 0; i < 15; i++) {
        const mid = Math.floor((lo + hi) / 2)
        const d = canvas.toDataURL('image/' + fmt, mid / 100)
        if (getDataURLBytes(d) <= targetBytes) { lo = mid + 1; best = d; q = mid }
        else hi = mid - 1
        if (lo > hi) break
      }
      dataURL = best || canvas.toDataURL('image/' + fmt, 0.01)
      if (!best) q = 1
    } else {
      dataURL = canvas.toDataURL('image/' + fmt, fmt === 'png' ? undefined : q / 100)
    }

    const outBytes = getDataURLBytes(dataURL)
    const reduction = (((originalFile.size - outBytes) / originalFile.size) * 100).toFixed(1)
    const ext = fmt === 'jpeg' ? 'jpg' : fmt

    setOutput({
      dataURL,
      w, h,
      bytes: outBytes,
      origBytes: originalFile.size,
      reduction: parseFloat(reduction),
      fmt,
      quality: fmt === 'png' ? 'Lossless' : q + '%',
      filename: `pixelpress_${w}x${h}.${ext}`,
    })
    setProcessing(false)
  }, [originalImg, width, height, quality, format, targetKB, targetUnit, originalFile, getCanvas])

  const reset = useCallback(() => {
    setOriginalFile(null)
    setOriginalImg(null)
    setLivePreview(null)
    setLiveInfo(null)
    setOutput(null)
    setWidthState('')
    setHeightState('')
    setQuality(85)
    setFormat('jpeg')
    setLockAspect(true)
    setTargetKB('')
  }, [])

  return {
    originalFile, originalImg, livePreview, liveInfo, output, processing,
    width, height, quality, format, lockAspect, targetKB, targetUnit,
    loadFile, setWidth, setHeight, updateQuality, updateFormat,
    setLockAspect, setTargetKB, setTargetUnit, applyPreset, process, reset,
  }
}
