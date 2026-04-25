import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react'
import styles from './Toast.module.css'

const Toast = forwardRef((_, ref) => {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef()

  useImperativeHandle(ref, () => ({
    show(message) {
      setMsg(message)
      setVisible(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setVisible(false), 3000)
    }
  }))

  return (
    <div className={`${styles.toast} ${visible ? styles.visible : ''}`}>
      {msg}
    </div>
  )
})
Toast.displayName = 'Toast'
export default Toast
