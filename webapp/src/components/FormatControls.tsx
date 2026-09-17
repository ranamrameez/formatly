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
    <div className="control-row">
      <div>
        <span className="control-label">Output format</span>
        <div className="segmented" role="group" aria-label="Output format">
          {(['png', 'jpg'] as const).map((option) => (
            <button key={option} className={format === option ? 'selected' : ''} onClick={() => onFormatChange(option)}>
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="quality-control">
        <span className="control-label">Quality <strong>{quality}%</strong></span>
        <input type="range" min="20" max="100" value={quality} onChange={(event) => onQualityChange(Number(event.target.value))} />
      </div>
      <button className="convert-button" disabled={disabled} onClick={onConvert}>
        {disabled ? 'Add files to start' : 'Convert batch'} <span>→</span>
      </button>
    </div>
  )
}
