export default function Controls({
  currentStep, isPlaying, speed,
  onPlay, onPause, onStepForward, onStepBack, onReset, onGoToStep, onSpeedChange,
  stepInfo,
}) {
  return (
    <div className="flex items-center gap-4 px-6 h-full">
      {/* Transport */}
      <div className="flex items-center gap-1">
        <TBtn onClick={onReset}>
          <rect x="7" y="7" width="10" height="10" fill="currentColor" />
        </TBtn>
        <TBtn onClick={onStepBack} off={currentStep === 0}>
          <path d="M6 4v16h2V4H6zm12 0l-10 8 10 8V4z" fill="currentColor" />
        </TBtn>
        <button onClick={isPlaying ? onPause : onPlay}
          className="w-8 h-8 flex items-center justify-center transition-all"
          style={{
            background: isPlaying ? 'rgba(239,68,68,.06)' : 'var(--accent-bg)',
            border: `1px solid ${isPlaying ? 'rgba(239,68,68,.15)' : 'var(--accent-border)'}`,
            color: isPlaying ? '#ef4444' : 'var(--accent)',
          }}>
          {isPlaying
            ? <svg width="11" height="11" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor" /><rect x="14" y="4" width="4" height="16" fill="currentColor" /></svg>
            : <svg width="11" height="11" viewBox="0 0 24 24"><path d="M7 4l14 8-14 8V4z" fill="currentColor" /></svg>
          }
        </button>
        <TBtn onClick={onStepForward} off={currentStep === stepInfo.length - 1}>
          <path d="M6 4l10 8-10 8V4zm12 0v16h-2V4h2z" fill="currentColor" />
        </TBtn>
      </div>

      <div className="w-px h-5" style={{ background: 'var(--border)' }} />

      {/* Step indicators */}
      <div className="flex items-center gap-0.5 flex-1">
        {stepInfo.map((s, i) => {
          const a = i === currentStep;
          const d = i < currentStep;
          return (
            <button key={i} onClick={() => onGoToStep(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] uppercase transition-all"
              style={{
                background: a ? 'var(--accent-bg)' : 'transparent',
                border: a ? '1px solid var(--accent-border)' : '1px solid transparent',
                color: a ? 'var(--accent)' : d ? 'var(--t2)' : 'var(--t4)',
              }}>
              <span className="w-1.5 h-1.5"
                style={{ background: a ? 'var(--accent)' : d ? 'var(--accent-dim)' : 'var(--border-2)' }} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[8px] tracking-[0.14em] uppercase" style={{ color: 'var(--t4)' }}>Speed</span>
        <input type="range" min={500} max={4000} step={250} value={4500 - speed}
          onChange={e => onSpeedChange(4500 - parseInt(e.target.value))} className="w-16" />
        <span className="font-mono text-[9px]" style={{ color: 'var(--t3)' }}>
          {(speed / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}

function TBtn({ onClick, off, children }) {
  return (
    <button onClick={onClick} disabled={off}
      className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-15"
      style={{ color: 'var(--t3)' }}>
      <svg width="11" height="11" viewBox="0 0 24 24">{children}</svg>
    </button>
  );
}
