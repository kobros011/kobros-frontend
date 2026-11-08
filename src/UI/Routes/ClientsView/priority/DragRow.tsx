import { DragEvent, FC, useState } from 'react';
import { Button, Popover, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, HolderOutlined } from '@ant-design/icons';
import { ClientRoute } from '@/domain/ClientRoute';
import { PriorityBadge } from './PriorityChip';
import { PriorityStepper } from './PriorityStepper';

export type RowMark = 'none' | 'dragging' | 'moved' | 'shifted';

interface DragRowProps {
	item: ClientRoute
	position: number
	total: number
	originalPosition: number
	mark: RowMark
	dropLabel?: string
	disabled?: boolean
	highlighted?: boolean
	onDragStart: () => void
	onDragOver: (event: DragEvent<HTMLElement>) => void
	onDrop: () => void
	onDragEnd: () => void
	onMoveUp: () => void
	onMoveDown: () => void
	onMoveTo: (position: number) => void
}

/** "Mover a #": hoja con el stepper (reemplaza el `prompt()` del mockup, usable con el dedo). */
const MoveToButton: FC<{ position: number, total: number, onMoveTo: (position: number) => void, disabled?: boolean }> = ({ position, total, onMoveTo, disabled }) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(position);
	return (
		<Popover
			open={open}
			onOpenChange={next => { setOpen(next); if (next) setValue(position); }}
			trigger="click"
			title="Mover a la posición"
			content={(
				<div style={{ display: 'grid', gap: 10 }}>
					<PriorityStepper value={value} max={total} onChange={setValue} />
					<Button type="primary" size="small" onClick={() => { onMoveTo(value); setOpen(false); }}>Mover aquí</Button>
				</div>
			)}
		>
			<Button size="small" disabled={disabled} aria-label={`Mover a otra posición (hoy #${position})`} className="kb-mono" style={{ minWidth: 40, height: 40 }}>#</Button>
		</Popover>
	);
};

/** Una fila de "Ordenar ruta": asa de arrastre, número, datos del cliente y ▲ ▼ # (alternativa al arrastre, también táctil). */
export const DragRow: FC<DragRowProps> = ({ item, position, total, originalPosition, mark, dropLabel, disabled, highlighted, onDragStart, onDragOver, onDrop, onDragEnd, onMoveUp, onMoveDown, onMoveTo }) => {
	const delta = position - originalPosition;
	const hint = mark === 'moved' ? `(Antes era #${originalPosition})` : mark === 'shifted' ? `(Desplazado ${delta > 0 ? '+' : ''}${delta})` : '';
	return (
		<>
			{dropLabel && <div className="pr-drop" aria-hidden><span>{dropLabel}</span></div>}
			<article
				id={`pr-row-${item.id}`}
				className={`pr-row${mark === 'dragging' ? ' is-dragging' : ''}${mark === 'moved' ? ' is-moved' : ''}${item.clientActive ? '' : ' is-inactive'}`}
				draggable={!disabled}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDrop={event => { event.preventDefault(); onDrop(); }}
				onDragEnd={onDragEnd}
				style={highlighted ? { borderColor: 'var(--kb-primary)', boxShadow: '0 0 0 2px color-mix(in srgb, var(--kb-primary) 35%, transparent)' } : undefined}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
					<HolderOutlined aria-hidden style={{ color: 'var(--kb-muted)', fontSize: 18 }} />
					<PriorityBadge order={position} state={mark === 'dragging' ? 'moving' : mark === 'moved' ? 'moved' : 'default'} />
					<div style={{ minWidth: 0 }}>
						<div style={{ fontWeight: 600, fontSize: 13, overflowWrap: 'anywhere' }}>
							{item.fullName}
							{mark === 'moved' && <Tag color="green" style={{ marginLeft: 8, borderRadius: 6 }}>Movido</Tag>}
						</div>
						<div className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>
							{item.neighborhood || 'Sin barrio'} · Cel: {item.currentMobile || '—'} {hint}
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
					<Tag color={item.clientActive ? 'success' : 'default'} style={{ borderRadius: 6, margin: 0 }}>{item.clientActive ? 'Activo' : 'Inactivo'}</Tag>
					<Button size="small" aria-label="Subir una posición" icon={<ArrowUpOutlined />} disabled={disabled || position <= 1} onClick={onMoveUp} style={{ width: 40, height: 40 }} />
					<Button size="small" aria-label="Bajar una posición" icon={<ArrowDownOutlined />} disabled={disabled || position >= total} onClick={onMoveDown} style={{ width: 40, height: 40 }} />
					<MoveToButton position={position} total={total} onMoveTo={onMoveTo} disabled={disabled} />
				</div>
			</article>
		</>
	);
};
