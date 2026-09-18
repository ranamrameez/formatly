import { X } from 'lucide-react'

type SettingsPanelProps = {
  quality: number
  onQualityChange: (quality: number) => void
  onClose: () => void
}

export function SettingsPanel({ quality, onQualityChange, onClose }: SettingsPanelProps) {
  return (
    <section className="settings-panel card border-0" aria-label="Formatly settings">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <p className="eyebrow mb-1">PREFERENCES</p>
            <h2 className="h5 mb-1">Processing defaults</h2>
            <p className="text-secondary small mb-0">Set the quality used for new batches.</p>
          </div>
          <button className="icon-button" title="Close settings" aria-label="Close settings" onClick={onClose}><X size={18} /></button>
        </div>
        <label className="settings-quality mt-4">
          <span className="control-label d-flex justify-content-between">Default quality &nbsp;<strong> {quality}%</strong></span>
          <input className={`form-range quality-${qualityLevel(quality)}`} type="range" min="20" max="100" value={quality} onChange={(event) => onQualityChange(Number(event.target.value))} />
        </label>
      </div>
    </section>
  )
}

function qualityLevel(value: number) {
  return Math.min(100, Math.max(20, Math.round(value / 5) * 5))
}
