import type { OutputFormat } from '../types'

type FormatControlsProps = {
  format: OutputFormat
  quality: number
  disabled: boolean
  onFormatChange: (format: OutputFormat) => void
  onQualityChange: (quality: number) => void
  onConvert: () => void
}

export function FormatControls({ format, quality, disabled, onFormatChange, onQualityChange, onConvert }: FormatControlsProps) {
  return (
    <div className="control-row row gy-3 align-items-end">
      <div className="col-12 col-md-auto">
        <span className="control-label">Output format</span>
        <div className="segmented btn-group" role="group" aria-label="Output format">
          {(['png', 'jpg'] as const).map((option) => (
            <button key={option} className={format === option ? 'selected btn btn-success' : 'btn btn-outline-success'} onClick={() => onFormatChange(option)}>
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="quality-control col-12 col-md">
        <span className="control-label">Quality <strong>{quality}%</strong></span>
        <input className="form-range" type="range" min="20" max="100" value={quality} onChange={(event) => onQualityChange(Number(event.target.value))} />
      </div>
      <button className="convert-button btn btn-success col-12 col-md-auto" disabled={disabled} onClick={onConvert}>
        {disabled ? 'Add files to start' : 'Convert batch'} <span>→</span>
      </button>
    </div>
  )
}
