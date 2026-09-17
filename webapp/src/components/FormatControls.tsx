import type { OutputFormat, ProcessingMode } from '../types'

type FormatControlsProps = {
  format: OutputFormat
  mode: ProcessingMode
  quality: number
  disabled: boolean
  onFormatChange: (format: OutputFormat) => void
  onQualityChange: (quality: number) => void
  onConvert: () => void
  onReset: () => void
}

export function FormatControls({ format, mode, quality, disabled, onFormatChange, onQualityChange, onConvert, onReset }: FormatControlsProps) {
  return (
    <div className="control-row row gy-3 align-items-end">
      {mode === 'convert' && <div className="col-12 col-md-auto">
          <span className="control-label d-block">Output format</span>
          <div className="segmented btn-group" role="group" aria-label="Output format">
            {(['png', 'jpg'] as const).map((option) => (
              <button key={option} className={format === option ? 'selected btn btn-success' : 'btn btn-outline-success'} onClick={() => onFormatChange(option)}>{option.toUpperCase()}</button>
            ))}
          </div>
        </div>}
      <div className="quality-control col-12 col-md">
        <span className="control-label">{mode === 'compress' ? 'Compression quality' : 'Output quality'} <strong>{quality}%</strong></span>
        <input className="form-range" type="range" min="20" max="100" value={quality} onChange={(event) => onQualityChange(Number(event.target.value))} />
      </div>
      <div className="control-actions col-12 col-md-auto d-flex gap-2">
        <button className="reset-button btn btn-outline-secondary" disabled={disabled} onClick={onReset} title="Reset the current batch"><span aria-hidden="true">↺</span> Reset</button>
        <button className="convert-button btn btn-success" disabled={disabled} onClick={onConvert}>
          {disabled ? 'Add files to start' : mode === 'compress' ? 'Compress batch' : 'Convert batch'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
