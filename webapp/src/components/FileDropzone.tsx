import type { ChangeEvent, DragEvent } from 'react'

type FileDropzoneProps = {
  isDragging: boolean
  onFiles: (files: File[]) => void
  onDraggingChange: (isDragging: boolean) => void
}

export function FileDropzone({ isDragging, onFiles, onDraggingChange }: FileDropzoneProps) {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDraggingChange(false)
    onFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <div
      className={isDragging ? 'dropzone dragging' : 'dropzone'}
      onDragOver={(event) => { event.preventDefault(); onDraggingChange(true) }}
      onDragLeave={() => onDraggingChange(false)}
      onDrop={handleDrop}
    >
      <div className="upload-glyph">↑</div>
      <h2>Drop files here</h2>
      <p>or choose files from your device</p>
      <label className="primary-button">
        Browse files
        <input type="file" hidden multiple accept="image/png,image/jpeg,image/webp" onChange={handleInput} />
      </label>
      <span className="file-hint">PNG, JPG, WebP · processed locally</span>
    </div>
  )
}
