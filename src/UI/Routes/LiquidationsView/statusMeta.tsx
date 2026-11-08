import { ReactNode } from 'react';

import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, RollbackOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import { Tone } from '@/UI/Components/Dashboard/ui';

import { LiquidationStatus } from '@/infrastructure/dto/LiquidationDto';


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
export const getDifferenceView = (difference: number, format: (value: number) => string): View & { text: string } => {
	if (Math.abs(difference) < 0.5) return { label: 'Cuadrado', text: `Cuadrado (${format(0)})`, tone: 'ok', icon: <CheckCircleOutlined /> };
	if (difference < 0) return { label: 'Faltante', text: `Faltante ${format(Math.abs(difference))}`, tone: 'danger', icon: <ExclamationCircleOutlined /> };
	return { label: 'Sobrante', text: `Sobrante ${format(difference)}`, tone: 'warn', icon: <ExclamationCircleOutlined /> };
};
