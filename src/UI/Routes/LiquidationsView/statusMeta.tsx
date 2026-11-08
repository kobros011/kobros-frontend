import { ReactNode } from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tone } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { LiquidationStatus } from '@/infrastructure/dto/LiquidationDto';

/** Pesos con signo delante del símbolo: −$47.014.667 (formatCOP pone el signo después del $). */
export const signedCOP = (value: number) => (value < 0 ? `−${formatCOP(-value)}` : formatCOP(value));

export const formatDay = (value: string) => dayjs(value).format('DD/MM/YYYY');

interface View {
	label: string;
	tone: Tone;
	icon: ReactNode;
}

/** Estado del cierre (nunca solo color: siempre icono y texto). `outdated` solo aplica a cierres vigentes. */
export const getStatusView = (status: LiquidationStatus, outdated = false): View => {
	if (status === 'reabierta') return { label: 'Reabierta', tone: 'neutral', icon: <RollbackOutlined /> };
	if (outdated) return { label: 'Desactualizada', tone: 'warn', icon: <ExclamationCircleOutlined /> };
	if (status === 'confirmada') return { label: 'Confirmada', tone: 'ok', icon: <CheckCircleOutlined /> };
	return { label: 'Pendiente de confirmación', tone: 'primary', icon: <ClockCircleOutlined /> };
};

/** Diferencia del cuadre: cuadrado, faltante (entregó menos de lo esperado) o sobrante. */
export const getDifferenceView = (difference: number): View & { text: string } => {
	if (Math.abs(difference) < 0.5) return { label: 'Cuadrado', text: 'Cuadrado ($0)', tone: 'ok', icon: <CheckCircleOutlined /> };
	if (difference < 0) return { label: 'Faltante', text: `Faltante ${formatCOP(Math.abs(difference))}`, tone: 'danger', icon: <ExclamationCircleOutlined /> };
	return { label: 'Sobrante', text: `Sobrante ${formatCOP(difference)}`, tone: 'warn', icon: <ExclamationCircleOutlined /> };
};
