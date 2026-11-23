import { motion } from 'framer-motion';

export default function Controls({
  currentStep, isPlaying, speed,
  onPlay, onPause, onStepForward, onStepBack, onReset, onGoToStep, onSpeedChange, stepInfo,
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-full">
      {/* Playback */}
      <div className="flex items-center gap-0.5">
        <Btn onClick={onReset} title="Reset">
          <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>
        </Btn>
        <Btn onClick={onStepBack} disabled={currentStep === 0} title="Back">
          <path d="M6 4v16h2V4H6zm12 0l-10 8 10 8V4z" fill="currentColor"/>
        </Btn>
        <button onClick={isPlaying ? onPause : onPlay} title={isPlaying ? 'Pause' : 'Play'}
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{
            background: isPlaying ? 'rgba(196,114,114,0.12)' : 'var(--accent-bg)',
            border: `1px solid ${isPlaying ? 'rgba(196,114,114,0.2)' : 'rgba(79,184,196,0.2)'}`,
            color: isPlaying ? 'var(--red)' : 'var(--accent)',
          }}>
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24"><path d="M7 4l14 8-14 8V4z" fill="currentColor"/></svg>
          )}
        </button>
        <Btn onClick={onStepForward} disabled={currentStep === stepInfo.length - 1} title="Next">
          <path d="M6 4l10 8-10 8V4zm12 0v16h-2V4h2z" fill="currentColor"/>
        </Btn>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Step dots */}
      <div className="flex items-center gap-1 flex-1">
        {stepInfo.map((s, i) => {
          const active = i === currentStep;
          const done = i < currentStep;
          return (
            <button key={i} onClick={() => onGoToStep(i)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors"
              style={{
                background: active ? 'var(--accent-bg)' : 'transparent',
                border: active ? '1px solid rgba(79,184,196,0.2)' : '1px solid transparent',
                color: active ? 'var(--accent)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: active ? 'var(--accent)' : done ? 'var(--accent-dim)' : 'var(--border-light)' }} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Speed</span>
        <input type="range" min={500} max={4000} step={250}
          value={4500 - speed} onChange={e => onSpeedChange(4500 - parseInt(e.target.value))} className="w-14" />
        <span className="text-[10px] font-mono w-8" style={{ color: 'var(--text-muted)' }}>{(speed / 1000).toFixed(1)}s</span>
      </div>
    </div>
  );
}

function Btn({ onClick, disabled, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-20"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <svg width="12" height="12" viewBox="0 0 24 24">{children}</svg>
    </button>
  );
}
