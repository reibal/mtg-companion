import { useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { downloadFile } from '../export'

type Props = {
  title: string
  content: string
  filename: string
  mime?: string
  onClose: () => void
}

export function ExportModal({ title, content, filename, mime, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | null>(null)

  function copy() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(content)
        .then(markCopied)
        .catch(() => {
          fallbackCopy(content)
          markCopied()
        })
    } else {
      fallbackCopy(content)
      markCopied()
    }
  }

  function markCopied() {
    setCopied(true)
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  function fallbackCopy(text: string) {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <textarea
          readOnly
          value={content}
          spellCheck={false}
          aria-label="Exported content"
          className="h-[45dvh] w-full resize-none rounded-md border border-edge bg-ink-950 p-3 font-mono text-xs leading-relaxed text-text focus:border-gold/50 focus:outline-none"
        />

        <div className="flex items-center justify-end gap-2">
          {copied && (
            <span className="mr-auto flex items-center gap-1.5 text-sm text-good">
              <Icon name="check" className="h-4 w-4" />
              Copied
            </span>
          )}
          <Button variant="secondary" onClick={copy}>
            <Icon name="copy" className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={() => downloadFile(filename, content, mime)}>
            <Icon name="download" className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  )
}