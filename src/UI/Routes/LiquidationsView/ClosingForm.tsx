import { FC, useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Input, Modal } from 'antd';
import { LockOutlined, ToolOutlined } from '@ant-design/icons';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { DashCard, Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { useCreateLiquidation } from '@/infrastructure/querys/Liquidation';
import { handleError } from '@/infrastructure/utils/handleError';
import { LiquidationPreviewDto } from '@/infrastructure/dto/LiquidationDto';
import { getDifferenceView, signedCOP } from './statusMeta';

interface ClosingFormProps {
	preview: LiquidationPreviewDto;
	/** Solo cuando el admin cierra a nombre de un cobrador. */
	collectorId?: string;
}

const toNumber = (value?: string) => (value === undefined || value === '' ? null : Number(value));

/** Datos que digita quien cierra + cuadre en vivo (esperado = base + recaudo − gastos − créditos nuevos). */
export const ClosingForm: FC<ClosingFormProps> = ({ preview, collectorId }) => {
	const { notification } = App.useApp();
	const create = useCreateLiquidation();
	const [base, setBase] = useState<string | undefined>();
	const [cash, setCash] = useState<string | undefined>();
	const [note, setNote] = useState('');
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string>();

	// La base sugerida (la del último cierre) se aplica al cambiar de ruta, fecha o cobrador.
	useEffect(() => {
		setBase(String(preview.suggested_base));
		setCash(undefined);
		setNote('');
	}, [preview.route_id, preview.date, preview.collector_id, preview.suggested_base]);

	const baseValue = toNumber(base) ?? 0;
	const cashValue = toNumber(cash);
	const expected = useMemo(
		() => baseValue + preview.collected_total - preview.expenses_total - preview.new_loans_total,
		[baseValue, preview],
	);
	const difference = cashValue === null ? null : cashValue - expected;
	const diffView = difference === null ? null : getDifferenceView(difference);
	const needsNote = difference !== null && Math.abs(difference) >= 0.5 && note.trim().length === 0;
	const canClose = cashValue !== null && !needsNote;

	const submit = () => {
		setError(undefined);
		create.mutate({
			route_id: preview.route_id,
			date: preview.date,
			value_base_delivered: baseValue,
			cash_delivered: cashValue ?? 0,
			note: note.trim() || undefined,
			collector_id: collectorId,
		}, {
			onSuccess: () => {
				setOpen(false);
				notification.success({ message: 'Caja cerrada exitosamente' });
			},
			onError: err => setError(handleError(err, 'No se pudo cerrar la caja')),
		});
	};

	return (
		<>
			<SectionCard icon={<ToolOutlined />} title="Datos de cierre por el cobrador" subtitle="Paso final">
				<div className="lq-fields">
					<label className="lq-field">
						<span className="kb-section-sub">Base entregada <Pill tone="neutral">Sugerido</Pill></span>
						<InputNumber aria-label="Base entregada" thousandsSeparator precision={0} size="small" value={base} onChange={value => setBase(value as string)} prefix="$" />
						<span className="kb-section-sub">Último cierre: {formatCOP(preview.suggested_base)}</span>
					</label>
					<label className="lq-field">
						<span className="kb-section-sub">Efectivo entregado</span>
						<InputNumber aria-label="Efectivo entregado" thousandsSeparator precision={0} size="small" value={cash} onChange={value => setCash(value as string)} prefix="$" />
						<span className="kb-section-sub">Cuenta billete por billete</span>
					</label>
				</div>
				<label className="lq-field" style={{ marginTop: 8 }}>
					<span className="kb-section-sub">Nota / observación {difference !== null && Math.abs(difference) >= 0.5 ? '(obligatoria: hay diferencia)' : '(opcional)'}</span>
					<Input.TextArea aria-label="Nota" rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="Detalla novedades o justifica la diferencia…" />
				</label>
			</SectionCard>

			<DashCard className="lq-cuadre">
				<div className="kb-section-sub">CUADRE OPERATIVO · fórmula automática</div>
				<div className="kb-section-sub" style={{ marginTop: 6 }}>Efectivo esperado en caja</div>
				<div><span className="kb-kpi-value">{signedCOP(expected)}</span><span className="kb-kpi-unit">COP</span></div>
				<div className="kb-section-sub kb-mono" style={{ margin: '4px 0 10px' }}>
					{formatCOP(baseValue)} (base) + {formatCOP(preview.collected_total)} (recaudo) − {formatCOP(preview.expenses_total)} (gastos) − {formatCOP(preview.new_loans_total)} (nuevos)
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<div>
						<div className="kb-section-sub">Entregado / contado</div>
						<strong className="kb-mono">{cashValue === null ? '—' : formatCOP(cashValue)}</strong>
					</div>
					<div style={{ textAlign: 'right' }}>
						<div className="kb-section-sub">Diferencia</div>
						{diffView ? <Pill tone={diffView.tone}>{diffView.icon} {diffView.text}</Pill> : <span className="kb-section-sub">Ingresa el efectivo</span>}
					</div>
				</div>
				<Button type="primary" size="small" block icon={<LockOutlined />} style={{ marginTop: 14 }} disabled={!canClose} onClick={() => setOpen(true)}>
					Cerrar caja del día
				</Button>
				{needsNote && <div className="kb-section-sub" style={{ marginTop: 6, color: 'var(--kb-warn)' }}>Escribe una nota que justifique la diferencia.</div>}
			</DashCard>

			<Modal
				open={open}
				centered
				width={420}
				title="Confirmar cierre de caja"
				onCancel={() => setOpen(false)}
				confirmLoading={create.isPending}
				okText="Confirmar cierre"
				cancelText="Cancelar"
				onOk={submit}
				okButtonProps={{ size: 'small' }}
				cancelButtonProps={{ size: 'small', danger: true }}
			>
				{error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}
				<ClosingSummary preview={preview} base={baseValue} cash={cashValue ?? 0} expected={expected} difference={difference ?? 0} />
			</Modal>
		</>
	);
};

const Line: FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
	<div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
		<span style={{ color: 'var(--kb-muted, inherit)' }}>{label}</span>
		{strong ? <strong>{value}</strong> : <span>{value}</span>}
	</div>
);

const ClosingSummary: FC<{ preview: LiquidationPreviewDto; base: number; cash: number; expected: number; difference: number }> = ({ preview, base, cash, expected, difference }) => (
	<div>
		<Line label="Ruta" value={`${preview.route_name}${preview.collector_name ? ` · ${preview.collector_name}` : ' · consolidado'}`} />
		<Line label="Base entregada" value={formatCOP(base)} />
		<Line label={`Recaudo (${preview.receipts_count} recibos)`} value={formatCOP(preview.collected_total)} />
		<Line label="Gastos" value={`−${formatCOP(preview.expenses_total)}`} />
		<Line label="Créditos nuevos" value={`−${formatCOP(preview.new_loans_total)}`} />
		<Line label="Efectivo esperado" value={signedCOP(expected)} strong />
		<Line label="Efectivo entregado" value={formatCOP(cash)} strong />
		<Line label="Diferencia" value={getDifferenceView(difference).text} strong />
	</div>
);
