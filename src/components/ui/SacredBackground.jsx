export default function SacredBackground({ intensity = 1 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* Deep ember radial */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '800px',
        background: `radial-gradient(circle, rgba(200,121,65,${0.06 * intensity}) 0%, transparent 65%)`,
        borderRadius: '50%',
      }} />

      {/* Outer ring — rotating */}
      <div className="rotate-slow" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
      }}>
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ width: '100%', height: '100%', opacity: 0.07 * intensity }}>
          <circle cx="300" cy="300" r="290" stroke="#c87941" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="300" cy="300" r="260" stroke="#c87941" strokeWidth="0.3" />
          {/* Octagram points */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8
            const x1 = 300 + 260 * Math.cos(angle)
            const y1 = 300 + 260 * Math.sin(angle)
            const x2 = 300 + 240 * Math.cos(angle)
            const y2 = 300 + 240 * Math.sin(angle)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c87941" strokeWidth="0.5" />
          })}
          {/* Cross lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8
            const x = 300 + 260 * Math.cos(angle)
            const y = 300 + 260 * Math.sin(angle)
            return <line key={i} x1="300" y1="300" x2={x} y2={y} stroke="#c87941" strokeWidth="0.2" opacity="0.5" />
          })}
        </svg>
      </div>

      {/* Inner ring — counter rotating */}
      <div className="rotate-reverse" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '380px', height: '380px',
      }}>
        <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ width: '100%', height: '100%', opacity: 0.1 * intensity }}>
          <circle cx="190" cy="190" r="180" stroke="#c87941" strokeWidth="0.4" strokeDasharray="2 6" />
          {/* Hexagram */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6 - Math.PI / 6
            const x = 190 + 180 * Math.cos(angle)
            const y = 190 + 180 * Math.sin(angle)
            const nx = 190 + 180 * Math.cos(angle + Math.PI * 2 / 3)
            const ny = 190 + 180 * Math.sin(angle + Math.PI * 2 / 3)
            return <line key={i} x1={x} y1={y} x2={nx} y2={ny} stroke="#c87941" strokeWidth="0.4" />
          })}
          <circle cx="190" cy="190" r="6" stroke="#c87941" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Corner sigils */}
      {[
        { top: '8%',  left: '6%',  size: 60 },
        { top: '8%',  right: '6%', size: 60 },
        { bottom: '8%', left: '6%',  size: 60 },
        { bottom: '8%', right: '6%', size: 60 },
      ].map((pos, i) => (
        <div key={i} className="pulse-glow" style={{ position: 'absolute', ...pos }}>
          <svg width={pos.size} height={pos.size} viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" stroke="#c87941" strokeWidth="0.5" />
            <line x1="30" y1="2"  x2="30" y2="58" stroke="#c87941" strokeWidth="0.3" />
            <line x1="2"  y1="30" x2="58" y2="30" stroke="#c87941" strokeWidth="0.3" />
            <line x1="8"  y1="8"  x2="52" y2="52" stroke="#c87941" strokeWidth="0.3" />
            <line x1="52" y1="8"  x2="8"  y2="52" stroke="#c87941" strokeWidth="0.3" />
            <circle cx="30" cy="30" r="4" stroke="#c87941" strokeWidth="0.5" />
          </svg>
        </div>
      ))}

      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to bottom, var(--void), transparent)',
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, var(--void), transparent)',
      }} />
    </div>
  )
}