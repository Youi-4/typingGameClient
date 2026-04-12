import React from 'react';

interface HistoryPoint {
    wpm: number;
    mode: string;
}

interface WpmHistoryChartProps {
    data: HistoryPoint[];
}

const MODE_COLOR: Record<string, string> = {
    multiplayer: '#0366d6',
    practice: '#e67e22',
    challenge: '#28a745',
};

const WpmHistoryChart: React.FC<WpmHistoryChartProps> = ({ data }) => {
    const W = 500;
    const H = 260;
    const pad = { top: 24, right: 24, bottom: 50, left: 56 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    const n = data.length;
    const maxWpm = Math.max(...data.map(d => d.wpm), 10);

    const tickStep = maxWpm <= 30 ? 5 : maxWpm <= 80 ? 10 : maxWpm <= 150 ? 25 : 50;
    const yTicks: number[] = [];
    for (let v = 0; v <= Math.ceil(maxWpm / tickStep) * tickStep; v += tickStep) {
        yTicks.push(v);
    }

    const xScale = (i: number) => n <= 1 ? cW / 2 : (i / (n - 1)) * cW;
    const yScale = (w: number) => cH - (w / (yTicks[yTicks.length - 1] || 1)) * cH;

    const polyPoints = data.map((d, i) => `${xScale(i)},${yScale(d.wpm)}`).join(' ');

    const areaPath =
        n > 0
            ? `M${xScale(0)},${cH} ` +
            data.map((d, i) => `L${xScale(i)},${yScale(d.wpm)}`).join(' ') +
            ` L${xScale(n - 1)},${cH} Z`
            : '';

    // Show x-axis tick every 5 races, always show last
    const xTickIndices = data
        .map((_, i) => i)
        .filter(i => i === 0 || (i + 1) % 5 === 0 || i === n - 1);

    return (
        <svg className="wpm-svg" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
            <defs>
                <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0366d6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0366d6" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            <g transform={`translate(${pad.left},${pad.top})`}>
                {yTicks.map(tick => (
                    <line key={tick} x1={0} y1={yScale(tick)} x2={cW} y2={yScale(tick)} stroke="#e1e4e8" strokeWidth={1} />
                ))}

                {areaPath && <path d={areaPath} fill="url(#historyAreaGrad)" />}

                {n > 1 && (
                    <polyline points={polyPoints} fill="none" stroke="#0366d6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                )}

                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={xScale(i)}
                        cy={yScale(d.wpm)}
                        r={4}
                        fill={MODE_COLOR[d.mode] ?? '#0366d6'}
                        stroke="#fff"
                        strokeWidth={1.5}
                    />
                ))}

                <line x1={0} y1={0} x2={0} y2={cH} stroke="#d1d9e0" strokeWidth={1.5} />
                <line x1={0} y1={cH} x2={cW} y2={cH} stroke="#d1d9e0" strokeWidth={1.5} />

                {yTicks.map(tick => (
                    <g key={tick}>
                        <line x1={-4} y1={yScale(tick)} x2={0} y2={yScale(tick)} stroke="#d1d9e0" />
                        <text x={-10} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#586069">{tick}</text>
                    </g>
                ))}

                {xTickIndices.map(i => (
                    <g key={i}>
                        <line x1={xScale(i)} y1={cH} x2={xScale(i)} y2={cH + 4} stroke="#d1d9e0" />
                        <text x={xScale(i)} y={cH + 16} textAnchor="middle" fontSize={11} fill="#586069">{i + 1}</text>
                    </g>
                ))}

                <text transform={`rotate(-90) translate(${-cH / 2},${-44})`} textAnchor="middle" fontSize={12} fill="#586069" fontWeight="600">WPM</text>
                <text x={cW / 2} y={cH + 40} textAnchor="middle" fontSize={12} fill="#586069" fontWeight="600">Race #</text>
            </g>
        </svg>
    );
};

export default WpmHistoryChart;
