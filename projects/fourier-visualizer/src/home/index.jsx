import '../about/about.css'
import FourierSweep from '../about/FourierSweep.jsx'

const TAU = Math.PI * 2

function wavePath(fn, w, h, cycles = 2, pts = 200) {
  const parts = []
  for (let i = 0; i < pts; i++) {
    const t = (i / (pts - 1)) * cycles * TAU
    const x = (i / (pts - 1)) * w
    const y = h / 2 - fn(t) * (h / 2 - 6)
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

function areaPath(fn, w, h, cycles = 2) {
  const mid = (h / 2).toFixed(2)
  return wavePath(fn, w, h, cycles) + ` L${w},${mid} L0,${mid} Z`
}

function Graph({ id, w, h, cycles = 2, curves, label }) {
  const mid = h / 2
  const hasSplit = curves.some(c => c.split)
  return (
    <figure className="wg-figure">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="wg-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {hasSplit && (
          <defs>
            <clipPath id={`${id}-p`}><rect x={0} y={0} width={w} height={mid} /></clipPath>
            <clipPath id={`${id}-n`}><rect x={0} y={mid} width={w} height={mid} /></clipPath>
          </defs>
        )}
        <line x1={0} y1={mid} x2={w} y2={mid} stroke="#332e27" strokeWidth="1" />
        {curves.map((c, i) => {
          const ap = areaPath(c.fn, w, h, cycles)
          return (
            <g key={i}>
              {c.negZone && (
                <rect x={0} y={mid} width={w} height={h - mid} fill="rgba(219,138,35,0.08)" />
              )}
              {c.fill && <path d={ap} fill={c.fill} />}
              {c.split && (
                <>
                  <path d={ap} fill="rgba(81,170,219,0.2)"  clipPath={`url(#${id}-p)`} />
                  <path d={ap} fill="rgba(219,138,35,0.2)" clipPath={`url(#${id}-n)`} />
                </>
              )}
              <path
                d={wavePath(c.fn, w, h, cycles)}
                fill="none"
                stroke={c.color}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>
      {label && <figcaption className="wg-label">{label}</figcaption>}
    </figure>
  )
}

export default function Home() {
  return (
    <div className="about-page">
      <h1>What is the Fourier transform?</h1>
      <p>The Fourier transform is a complex-valued integral used to discover what frequencies make up a composite waveform.
        The core idea is to multiply the waveform by a pure sine/cosine wave at a given frequency and integrate over time.
        If that frequency is present in the waveform, the peaks and valleys reinforce each other, producing a large result.</p>
      <p>If it isn't, the positive and negative contributions cancel out, producing a value near zero. By sweeping this across every frequency and recording the magnitude of each result, we can identify exactly which pure frequencies combine to make up the waveform.</p>

      <section className="about-section">
        <p>To demonstrate the way the integral is reinforced via multiplication, lets take two of the same sin wave, with different amplitudes.</p>

        <div className="wg-pair">
          <Graph id="g1a" w={275} h={84}
            curves={[{ fn: t => Math.sin(t), color: '#51aadb' }]}
            label="sin(t)" />
          <Graph id="g1b" w={275} h={84}
            curves={[{ fn: t => 0.5 * Math.sin(t), color: '#db8a23' }]}
            label="½ · sin(t)" />
        </div>

        <p>And then multiply them together</p>

        <div className="wg-single">
          <Graph id="g2" w={560} h={96}
            curves={[{
              fn: t => 0.5 * Math.sin(t) * Math.sin(t),
              color: '#51aadb',
              fill: 'rgba(81,170,219,0.28)',
              negZone: true,
            }]}
            label="sin(t) · ½sin(t) — product is always ≥ 0" />
        </div>

        <p>The integral of this function never goes below zero, meaning the resonance was perfect. While most waveforms aren't this simple, the idea is the same.</p>

        <div className="wg-pair">
          <Graph id="g3a" w={275} h={84}
            curves={[
              { fn: t => Math.sin(t),           color: '#51aadb' },
              { fn: t => 0.5 * Math.sin(3 * t), color: '#db8a23' },
            ]}
            label="sin(t)  and  ½sin(3t) — components" />
          <Graph id="g3b" w={275} h={84}
            curves={[{
              fn: t => (Math.sin(t) + 0.5 * Math.sin(3 * t)) / 1.5,
              color: '#a09078',
            }]}
            label="sin(t) + ½sin(3t) — composite" />
        </div>

        <p>And now two sine waves with frequencies that are a poor match, and don't resonate</p>

        <div className="wg-pair">
          <Graph id="g4a" w={275} h={84}
            curves={[
              { fn: t => Math.sin(t),     color: '#51aadb' },
              { fn: t => Math.sin(2 * t), color: '#db8a23' },
            ]}
            label="sin(t)  and  sin(2t) — mismatched frequencies" />
          <Graph id="g4b" w={275} h={84}
            curves={[{
              fn: t => Math.sin(t) * Math.sin(2 * t),
              color: '#e8d8be',
              split: true,
            }]}
            label="sin(t) · sin(2t) — positive and negative cancel" />
        </div>

        <p>We can see roughly that the peaks and valleys will cancel each other out, making the integral near zero.</p>
      </section>

      <FourierSweep />
    </div>
  )
}
