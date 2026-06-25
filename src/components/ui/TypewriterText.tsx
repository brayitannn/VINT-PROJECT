'use client'

import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  text: string
  delay?: number      // ms antes de empezar
  speed?: number      // ms por letra
  style?: React.CSSProperties
  className?: string
}

export function TypewriterText({
  text,
  delay = 900,
  speed = 28,
  style,
  className,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) return

    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)

    return () => clearTimeout(t)
  }, [started, displayed, text, speed])

  return (
    <p style={style} className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            backgroundColor: 'var(--accent)',
            marginLeft: 2,
            verticalAlign: 'middle',
            animation: 'twCursor 0.8s step-end infinite',
          }}
        />
      )}
    </p>
  )
}
