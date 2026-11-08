import { ReactNode } from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tone } from '@/UI/Components/Dashboard/ui';
import { PaymentHistoryItemDto } from '@/infrastructure/dto/PaymentHistoryDto';

interface StatusView {
	label: string;
	tone: Tone;
	icon: ReactNode;
}

export const formatDate = (value: string | null) => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

/** Una cuota pendiente que además se puede abonar vence hoy (el servidor ya distinguió hoy de futuro). */
export const isDueToday = (item: PaymentHistoryItemDto) => item.status === 'pendiente' && item.can_pay;

/** Etiqueta, tono e icono de una cuota; el estado nunca depende solo del color. */
export const getStatusView = (item: PaymentHistoryItemDto): StatusView => {
	if (item.status === 'pagado') return { label: 'Pagada', tone: 'ok', icon: <CheckCircleOutlined /> };
	if (item.status === 'mora') return { label: 'En mora', tone: 'danger', icon: <CloseCircleOutlined /> };
	if (isDueToday(item)) return { label: 'Vence hoy', tone: 'warn', icon: <FieldTimeOutlined /> };
	return { label: 'Pendiente', tone: 'primary', icon: <ClockCircleOutlined /> };
};

/** Texto secundario de la fecha: días de mora, pago tardío o cuándo vence. */
export const getDelayText = (item: PaymentHistoryItemDto): string | null => {
	if (item.status === 'mora') return `${item.days_overdue} ${item.days_overdue === 1 ? 'día' : 'días'} de mora`;
	if (item.status === 'pagado' && item.paid_late_days > 0) return `Pagó +${item.paid_late_days}d`;
	return null;
};
