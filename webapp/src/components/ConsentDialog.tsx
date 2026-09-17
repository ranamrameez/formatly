type ConsentDialogProps = {
  onAgree: () => void
}

export function ConsentDialog({ onAgree }: ConsentDialogProps) {
  const legalPath = (file: string) => `${import.meta.env.BASE_URL}legal/${file}`

  return (
    <div className="consent-backdrop" role="presentation">
      <section className="consent-dialog card border-0" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div className="card-body">
          <p className="eyebrow mb-2">BEFORE YOU BEGIN</p>
          <h2 id="consent-title">Use Formatly with confidence.</h2>
          <p className="text-secondary">Please review and agree to the Terms and Conditions and Disclaimer before using the file tools.</p>
          <div className="consent-links">
            <a href={legalPath('terms-and-conditions.html')} target="_blank" rel="noreferrer">Terms and Conditions</a>
            <a href={legalPath('disclaimer.html')} target="_blank" rel="noreferrer">Disclaimer</a>
            <a href={legalPath('privacy-policy.html')} target="_blank" rel="noreferrer">Privacy Policy</a>
          </div>
          <button className="btn btn-success consent-button" onClick={onAgree}>I agree and continue <span aria-hidden="true">→</span></button>
          <p className="consent-note mb-0">Your agreement is saved in this browser. You can clear it from browser storage at any time.</p>
        </div>
      </section>
    </div>
  )
}
