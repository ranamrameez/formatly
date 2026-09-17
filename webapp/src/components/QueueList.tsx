import type { QueueItem } from '../types'

type QueueListProps = {
  items: QueueItem[]
  onDownload: (item: QueueItem) => void
  onDownloadBatch: () => void
}

export function QueueList({ items, onDownload, onDownloadBatch }: QueueListProps) {
  const completedCount = items.filter((item) => item.status === 'Done' || item.status === 'Error').length
  const batchProgress = items.length ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length) : 0
  const completedItems = items.filter((item) => item.status === 'Done')

  return (
    <section className="queue" aria-live="polite">
      <div className="queue-heading">
        <h2>Batch queue <span>{items.length}</span></h2>
        <div className="queue-actions">
          <span>{completedCount}/{items.length} complete · {batchProgress}%</span>
          <button className="download-button" disabled={!completedItems.length} onClick={onDownloadBatch}>Download batch</button>
        </div>
      </div>
      <div className="batch-progress"><span style={{ width: `${batchProgress}%` }} /></div>
      {items.map((item) => (
        <div className="file-row" key={item.id}>
          <div className="file-icon">{item.file.name.split('.').pop()?.toUpperCase()}</div>
          <div className="file-meta">
            <strong title={item.file.name}>{item.file.name}</strong>
            <span>{formatBytes(item.file.size)}{item.message ? ` · ${item.message}` : ''}</span>
            <div className="item-progress"><span style={{ width: `${item.progress}%` }} /></div>
          </div>
          <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
          {item.status === 'Done' && <button className="download-button" onClick={() => onDownload(item)}>Download</button>}
        </div>
      ))}
    </section>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
