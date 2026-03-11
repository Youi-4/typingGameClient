import React from 'react';

interface DataPoint {
    elapsed: number;
    wpm: number;
}

interface WpmGraphProps {
    data: DataPoint[];
    finalWpm: number;
}

const WpmGraph: React.FC<WpmGraphProps> = ({ data, finalWpm }) => {
    const W = 500;
    const H = 280;
    const pad = { top: 24, right: 24, bottom: 50, left: 56 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    const maxWpm = Math.max(...data.map(d => d.wpm), 10);
    const maxTime = data[data.length - 1]?.elapsed ?? 1;

    // Nice Y-axis ticks
    const tickStep = maxWpm <= 30 ? 5 : maxWpm <= 80 ? 10 : maxWpm <= 150 ? 25 : 50;
    const yTicks: number[] = [];
    for (let v = 0; v <= Math.ceil(maxWpm / tickStep) * tickStep; v += tickStep) {
        yTicks.push(v);
    }

    // Nice X-axis ticks: show every 10s, always show last
    const xTicks = data
        .filter(d => d.elapsed % 10 === 0 || d.elapsed === maxTime)
        .map(d => d.elapsed);

    const xScale = (t: number) => (t / maxTime) * cW;
    const yScale = (w: number) => cH - (w / (yTicks[yTicks.length - 1] || 1)) * cH;

    const polyPoints = data.map(d => `${xScale(d.elapsed)},${yScale(d.wpm)}`).join(' ');

    // Area fill path
    const areaPath =
        data.length > 0
            ? `M${xScale(data[0].elapsed)},${cH} ` +
              data.map(d => `L${xScale(d.elapsed)},${yScale(d.wpm)}`).join(' ') +
              ` L${xScale(data[data.length - 1].elapsed)},${cH} Z`
            : '';

    return (
        <div className="wpm-modal">
                <div className="wpm-modal-header">
                    <h2 className="wpm-modal-title">Race Complete!</h2>
                    <div className="wpm-final-stat">
                        <span className="wpm-final-label">Final WPM</span>
                        <span className="wpm-final-value">{finalWpm}</span>
                    </div>
                </div>

                <svg
                    className="wpm-svg"
                    viewBox={`0 0 ${W} ${H}`}
                    width="100%"
                    style={{ maxWidth: W }}
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0366d6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0366d6" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    <g transform={`translate(${pad.left},${pad.top})`}>
                        {/* Horizontal grid lines */}
                        {yTicks.map(tick => (
                            <line
                                key={tick}
                                x1={0} y1={yScale(tick)}
                                x2={cW} y2={yScale(tick)}
                                stroke="#e1e4e8" strokeWidth={1}
                            />
                        ))}

                        {/* Area fill */}
                        {areaPath && (
                            <path d={areaPath} fill="url(#areaGrad)" />
                        )}

                        {/* Line */}
                        {data.length > 1 && (
                            <polyline
                                points={polyPoints}
                                fill="none"
                                stroke="#0366d6"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}

                        {/* Dots */}
                        {data.map((d, i) => (
                            <circle
                                key={i}
                                cx={xScale(d.elapsed)}
                                cy={yScale(d.wpm)}
                                r={3}
                                fill="#0366d6"
                            />
                        ))}

                        {/* Axes */}
                        <line x1={0} y1={0} x2={0} y2={cH} stroke="#d1d9e0" strokeWidth={1.5} />
                        <line x1={0} y1={cH} x2={cW} y2={cH} stroke="#d1d9e0" strokeWidth={1.5} />

                        {/* Y ticks + labels */}
                        {yTicks.map(tick => (
                            <g key={tick}>
                                <line x1={-4} y1={yScale(tick)} x2={0} y2={yScale(tick)} stroke="#d1d9e0" />
                                <text
                                    x={-10} y={yScale(tick)}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    fontSize={11}
                                    fill="#586069"
                                >
                                    {tick}
                                </text>
                            </g>
                        ))}

                        {/* X ticks + labels */}
                        {xTicks.map(t => (
                            <g key={t}>
                                <line x1={xScale(t)} y1={cH} x2={xScale(t)} y2={cH + 4} stroke="#d1d9e0" />
                                <text
                                    x={xScale(t)} y={cH + 16}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fill="#586069"
                                >
                                    {t}s
                                </text>
                            </g>
                        ))}

                        {/* Axis labels */}
                        <text
                            transform={`rotate(-90) translate(${-cH / 2},${-44})`}
                            textAnchor="middle"
                            fontSize={12}
                            fill="#586069"
                            fontWeight="600"
                        >
                            WPM
                        </text>
                        <text
                            x={cW / 2} y={cH + 40}
                            textAnchor="middle"
                            fontSize={12}
                            fill="#586069"
                            fontWeight="600"
                        >
                            Time (seconds)
                        </text>
                    </g>
                </svg>

        </div>
    );
};

export default WpmGraph;
