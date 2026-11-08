import { FC, ReactNode } from 'react';
import dayjs from 'dayjs';
import { Area, AreaChart, Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCOP, formatCompactCOP } from './format';
import { Pill, Tone } from './ui';

export const toneVar = (tone: Tone) => `var(--kb-${tone === 'neutral' ? 'muted' : tone})`;

/** Tono según porcentaje de cumplimiento (≥90 ok, ≥83 advertencia, menor peligro). */
export const toneByCompliance = (percent: number): Tone => (percent >= 90 ? 'ok' : percent >= 83 ? 'warn' : 'danger');

/* ---------- Área: cobro diario vs meta ---------- */

export interface DailyPoint { date: string; collected: number; goal: number }

const AreaTooltip: FC<{ active?: boolean; payload?: { payload: DailyPoint }[] }> = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="kb-card kb-mono" style={{ padding: '8px 12px', fontSize: 12, borderColor: 'var(--kb-primary)' }}>
			<div style={{ color: 'var(--kb-muted)', marginBottom: 4 }}>{dayjs(point.date).format('DD MMMM YYYY')}</div>
			<div><strong>Recaudado:</strong> <span style={{ color: 'var(--kb-primary)' }}>{formatCOP(point.collected)} COP</span></div>
			<div style={{ color: 'var(--kb-muted)' }}>Meta: {formatCOP(point.goal)} COP</div>
		</div>
	);
};

export const CollectionAreaChart: FC<{ data: DailyPoint[]; height?: number }> = ({ data, height = 260 }) => {
	const averageGoal = data.length ? data.reduce((sum, point) => sum + point.goal, 0) / data.length : 0;
	const axisStyle = { fontSize: 11, fill: 'var(--kb-muted)', fontFamily: 'JetBrains Mono, monospace' };
	const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	return (
		<div role="img" aria-label="Gráfico de cobro diario frente a la meta">
			<div className="kb-legend" style={{ justifyContent: 'flex-end', marginBottom: 6 }}>
				<span><span className="kb-dot" style={{ ['--kb-tone' as string]: 'var(--kb-primary)' }} /> Recaudado real</span>
				<span>- - Meta diaria ({formatCompactCOP(averageGoal)})</span>
			</div>
			<ResponsiveContainer width="100%" height={height}>
				<AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="kbCollected" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="var(--kb-primary)" stopOpacity={0.45} />
							<stop offset="100%" stopColor="var(--kb-primary)" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid stroke="var(--kb-border)" strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="date" tickFormatter={(value: string) => dayjs(value).format('DD MMM')} tick={axisStyle} axisLine={false} tickLine={false} minTickGap={24} />
					<YAxis tickFormatter={formatCompactCOP} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
					<Tooltip content={<AreaTooltip />} cursor={{ stroke: 'var(--kb-border)' }} />
					{averageGoal > 0 && <ReferenceLine y={averageGoal} stroke="var(--kb-muted)" strokeDasharray="5 4" />}
					<Area
						type="monotone"
						dataKey="collected"
						stroke="var(--kb-primary)"
						strokeWidth={2.5}
						fill="url(#kbCollected)"
						dot={{ r: 3.5, fill: 'var(--kb-primary)', strokeWidth: 0 }}
						activeDot={{ r: 5 }}
						isAnimationActive={!reduceMotion}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

/* ---------- Dona: composición de cartera ---------- */

export interface DonutSegment { label: string; value: number; tone: Tone }

export const PortfolioDonut: FC<{ segments: DonutSegment[]; centerLabel?: string }> = ({ segments, centerLabel = 'TOTAL CARTERA' }) => {
	const total = segments.reduce((sum, segment) => sum + segment.value, 0);
	const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	return (
		<div>
			<div style={{ position: 'relative', height: 190 }} role="img" aria-label="Composición de la cartera por estado de riesgo">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={segments.filter(segment => segment.value > 0)}
							dataKey="value"
							nameKey="label"
							innerRadius="68%"
							outerRadius="92%"
							paddingAngle={2}
							stroke="none"
							isAnimationActive={!reduceMotion}
						>
							{segments.filter(segment => segment.value > 0).map(segment => (
								<Cell key={segment.label} fill={toneVar(segment.tone)} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', textAlign: 'center' }}>
					<div>
						<div className="kb-kpi-label" style={{ fontSize: 10 }}>{centerLabel}</div>
						<div className="kb-kpi-value" style={{ fontSize: 22 }}>{formatCompactCOP(total)}</div>
						<div className="kb-kpi-sub">100%</div>
					</div>
				</div>
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
				{segments.map(segment => (
					<div key={segment.label} className="kb-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span className={`kb-dot kb-tone-${segment.tone}`} />
						<span style={{ flex: 1, fontSize: 13 }}>{segment.label}</span>
						<strong className="kb-mono" style={{ fontSize: 12 }}>{formatCompactCOP(segment.value)}</strong>
						<Pill tone="neutral">{total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0.0'}%</Pill>
					</div>
				))}
			</div>
		</div>
	);
};

/* ---------- Barras ---------- */

/** Barra apilada activa (primario) + mora (peligro). */
export const StackedBar: FC<{ active: number; delinquency: number }> = ({ active, delinquency }) => {
	const total = active + delinquency;
	const delinquencyShare = total > 0 ? (delinquency / total) * 100 : 0;
	return (
		<div className="kb-bar" role="img" aria-label={`${delinquencyShare.toFixed(1)}% en mora`}>
			<span style={{ width: `${100 - delinquencyShare}%`, background: 'var(--kb-primary)' }} />
			<span style={{ width: `${delinquencyShare}%`, background: 'var(--kb-danger)' }} />
		</div>
	);
};

/** Barra de progreso coloreada por tono. */
export const RankBar: FC<{ percent: number; tone: Tone }> = ({ percent, tone }) => (
	<div className="kb-bar" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
		<span style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: toneVar(tone), borderRadius: 999 }} />
	</div>
);

/* ---------- Gauge circular ---------- */

export const RadialGauge: FC<{ percent: number; size?: number; tone?: Tone; children?: ReactNode }> = ({ percent, size = 64, tone = 'primary', children }) => {
	const stroke = 7;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.min(100, Math.max(0, percent));

	return (
		<div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`${clamped.toFixed(0)}%`}>
			<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--kb-border)" strokeWidth={stroke} />
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={toneVar(tone)}
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * (1 - clamped / 100)}
				/>
			</svg>
			<div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: size > 56 ? 12 : 10, fontWeight: 700 }}>
				{children ?? `${clamped.toFixed(0)}%`}
			</div>
		</div>
	);
};

/* ---------- Combinado: recaudo, gastos y utilidad por período ---------- */

export interface PeriodPoint { label: string; collected: number; expenses: number; profit: number }

const PeriodTooltip: FC<{ active?: boolean; payload?: { payload: PeriodPoint }[] }> = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="kb-card kb-mono" style={{ padding: '8px 12px', fontSize: 12, borderColor: 'var(--kb-primary)' }}>
			<div style={{ color: 'var(--kb-muted)', marginBottom: 4 }}>{point.label}</div>
			<div style={{ color: 'var(--kb-primary)' }}>Recaudo: {formatCOP(point.collected)}</div>
			<div style={{ color: 'var(--kb-warn)' }}>Gastos: {formatCOP(point.expenses)}</div>
			<div style={{ color: point.profit < 0 ? 'var(--kb-danger)' : 'var(--kb-ok)' }}><strong>Utilidad: {formatCOP(point.profit)}</strong></div>
		</div>
	);
};

export const PeriodChart: FC<{ data: PeriodPoint[]; height?: number }> = ({ data, height = 280 }) => {
	const axisStyle = { fontSize: 11, fill: 'var(--kb-muted)', fontFamily: 'JetBrains Mono, monospace' };
	const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	return (
		<div role="img" aria-label="Gráfico de recaudo, gastos y utilidad del período">
			<ResponsiveContainer width="100%" height={height}>
				<ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
					<CartesianGrid stroke="var(--kb-border)" strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
					<YAxis tickFormatter={formatCompactCOP} tick={axisStyle} axisLine={false} tickLine={false} width={56} />
					<Tooltip content={<PeriodTooltip />} cursor={{ fill: 'var(--kb-border)', opacity: 0.4 }} />
					<Legend wrapperStyle={{ fontSize: 12, color: 'var(--kb-muted)' }} />
					<Bar name="Recaudo" dataKey="collected" fill="var(--kb-primary)" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
					<Bar name="Gastos" dataKey="expenses" fill="var(--kb-warn)" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
					<Line name="Utilidad" type="monotone" dataKey="profit" stroke="var(--kb-ok)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={!reduceMotion} />
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
};
