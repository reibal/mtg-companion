import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface CameraState {
  videoRef: React.RefObject<HTMLVideoElement | null>
  running: boolean
  error: string | null
  start: () => Promise<boolean>
  stop: () => void
  capture: () => Promise<Blob | null>
}

export function useCamera(): CameraState {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setRunning(false)
  }, [])

  const start = useCallback(async (): Promise<boolean> => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera support is not available on this device or connection (needs HTTPS).')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => undefined)
      }
      setRunning(true)
      return true
    } catch {
      setError('Could not access the camera. Check permissions and try again.')
      return false
    }
  }, [])

  const capture = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video) return null
    if (video.readyState < 2) {
      try {
        await video.play()
      } catch {
        return null
      }
      if (video.readyState < 2) return null
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92),
    )
  }, [])

  useEffect(() => stop, [stop])

  return useMemo(
    () => ({ videoRef, running, error, start, stop, capture }),
    [videoRef, running, error, start, stop, capture],
  )
}