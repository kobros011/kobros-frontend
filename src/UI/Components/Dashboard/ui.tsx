import { CSSProperties, FC, ReactNode } from 'react';
import { theme } from 'antd';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import './dashboard.css';

export type Tone = 'primary' | 'ok' | 'warn' | 'danger' | 'neutral';

/** Contenedor de todos los dashboards: fuentes + variables CSS derivadas de los tokens reales de antd. */
export const DashboardShell: FC<{ children: ReactNode }> = ({ children }) => {
	const { token } = theme.useToken();
	const darkMode = useUserModeStore(state => state.darkMode);

	const vars = {
		'--kb-primary': token.colorPrimary,
		'--kb-ok': token.colorSuccess,
		'--kb-warn': token.colorWarning,
		'--kb-danger': token.colorError,
		'--kb-info': token.colorInfo,
		'--kb-text': token.colorText,
		'--kb-muted': token.colorTextTertiary,
		'--kb-card-bg': darkMode
			? `color-mix(in srgb, ${token.colorPrimary} 5%, #0e130e)`
			: token.colorBgContainer,
		'--kb-border': darkMode
			? `color-mix(in srgb, ${token.colorPrimary} 20%, transparent)`
			: token.colorBorderSecondary,
	} as CSSProperties;

	return <div className="kb-dash" style={vars}>{children}</div>;
};

export const DashCard: FC<{ children: ReactNode; style?: CSSProperties; className?: string }> = ({ children, style, className }) => (
	<div className={`kb-card ${className ?? ''}`} style={style}>{children}</div>
);

export const IconBox: FC<{ icon: ReactNode; tone?: Tone }> = ({ icon, tone = 'primary' }) => (
	<span className={`kb-iconbox kb-tone-${tone}`} aria-hidden>{icon}</span>
);

export const Pill: FC<{ children: ReactNode; tone?: Tone }> = ({ children, tone = 'neutral' }) => (
	<span className={`kb-pill kb-tone-${tone}`}>{children}</span>
);

interface SectionCardProps {
	icon: ReactNode;
	title: string;
	subtitle?: string;
	tone?: Tone;
	extra?: ReactNode;
	footer?: ReactNode;
	children: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({ icon, title, subtitle, tone = 'primary', extra, footer, children }) => (
	<DashCard>
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
			<div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
				<IconBox icon={icon} tone={tone} />
				<div style={{ minWidth: 0 }}>
					<h3 className="kb-section-title">{title}</h3>
					{subtitle && <div className="kb-section-sub">{subtitle}</div>}
				</div>
			</div>
			{extra}
		</div>
		{children}
		{footer && <div className="kb-footer">{footer}</div>}
	</DashCard>
);

interface KpiCardProps {
	label: string;
	subtitle?: string;
	value: ReactNode;
	unit?: string;
	icon?: ReactNode;
	tone?: Tone;
	valueTone?: Tone;
	pill?: ReactNode;
	aside?: ReactNode;
	footer?: ReactNode;
}

export const KpiCard: FC<KpiCardProps> = ({ label, subtitle, value, unit, icon, tone = 'primary', valueTone, pill, aside, footer }) => (
	<DashCard style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
		<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
			<div style={{ minWidth: 0 }}>
				<div className={`kb-kpi-label ${valueTone ? `kb-tone-${valueTone}` : ''}`} style={valueTone ? { color: 'var(--kb-tone)' } : undefined}>{label}</div>
				{subtitle && <div className="kb-kpi-sub">{subtitle}</div>}
			</div>
			{icon && <IconBox icon={icon} tone={tone} />}
		</div>
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
			<div className={valueTone ? `kb-tone-${valueTone}` : ''}>
				<span className="kb-kpi-value" style={valueTone ? { color: 'var(--kb-tone)' } : undefined}>{value}</span>
				{unit && <span className="kb-kpi-unit">{unit}</span>}
			</div>
			{aside}
		</div>
		{pill && <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--kb-muted)' }}>{pill}</div>}
		{footer && <div style={{ fontSize: 12, color: 'var(--kb-muted)' }}>{footer}</div>}
	</DashCard>
);
