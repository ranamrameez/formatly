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
      className={isDragging ? 'dropzone dragging border border-2 border-success-subtle rounded-3' : 'dropzone border border-2 border-success-subtle rounded-3'}
      onDragOver={(event) => { event.preventDefault(); onDraggingChange(true) }}
      onDragLeave={() => onDraggingChange(false)}
      onDrop={handleDrop}
    >
      <div className="upload-glyph mb-3">↑</div>
      <h2 className="h4">Drop files here</h2>
      <p className="text-secondary mb-3">or choose files from your device</p>
      <label className="primary-button btn btn-success">
        Browse files
        <input type="file" hidden multiple accept="image/png,image/jpeg,image/webp" onChange={handleInput} />
      </label>
      <span className="file-hint text-secondary mt-3">PNG, JPG, WebP · processed locally</span>
    </div>
  )
}
