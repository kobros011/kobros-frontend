import { FC } from 'react';
import { App, Button, Space } from 'antd';
import { CheckOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import { useConfirmLiquidation, useDeleteLiquidation, useReopenLiquidation } from '@/infrastructure/querys/Liquidation';
import { handleError } from '@/infrastructure/utils/handleError';
import { LiquidationStatus } from '@/infrastructure/dto/LiquidationDto';

interface LiquidationActionsProps {
	id: string;
	status: LiquidationStatus;
	outdated?: boolean;
	isAdmin: boolean;
	onDone?: () => void;
}

/** Confirmar / Reabrir (admin) y Eliminar (pendiente). Todas piden confirmación y muestran el motivo del servidor si fallan. */
export const LiquidationActions: FC<LiquidationActionsProps> = ({ id, status, outdated = false, isAdmin, onDone }) => {
	const { modal, notification } = App.useApp();
	const confirm = useConfirmLiquidation();
	const reopen = useReopenLiquidation();
	const remove = useDeleteLiquidation();

	const run = (title: string, content: string, okText: string, action: () => Promise<unknown>, done: string) => {
		void modal.confirm({
			title,
			content,
			okText,
			cancelText: 'Cancelar',
			centered: true,
			width: 360,
			okButtonProps: { size: 'small' },
			cancelButtonProps: { size: 'small', danger: true },
			onOk: async () => {
				try {
					await action();
					notification.success({ message: done });
					onDone?.();
				} catch (error) {
					notification.error({ message: 'No se pudo completar la acción', description: handleError(error as Error, 'Ocurrió un error') });
				}
			},
		});
	};

	if (status === 'reabierta') return null;
	const canConfirm = isAdmin && status === 'pendiente' && !outdated;
	const canReopen = isAdmin && (status === 'confirmada' || outdated);
	const canDelete = status === 'pendiente';

	return (
		<Space wrap size={6}>
			{canConfirm && (
				<Button type="primary" size="small" icon={<CheckOutlined />} loading={confirm.isPending}
					onClick={() => run('Confirmar liquidación', 'Al confirmar, el cierre queda bloqueado. Si luego hay cobros o gastos nuevos, un admin deberá reabrirlo.', 'Confirmar', () => confirm.mutateAsync(id), 'Liquidación confirmada')}>
					Confirmar
				</Button>
			)}
			{canReopen && (
				<Button size="small" icon={<RollbackOutlined />} loading={reopen.isPending}
					onClick={() => run('Reabrir liquidación', 'Se liberan los cobros y gastos del cierre para volver a cerrarlo con las cifras actuales.', 'Reabrir', () => reopen.mutateAsync(id), 'Liquidación reabierta')}>
					Reabrir / Recalcular
				</Button>
			)}
			{canDelete && (
				<Button size="small" danger icon={<DeleteOutlined />} loading={remove.isPending}
					onClick={() => run('Eliminar liquidación', 'Se elimina el cierre y se liberan sus cobros y gastos.', 'Eliminar', () => remove.mutateAsync(id), 'Liquidación eliminada')}>
					Eliminar
				</Button>
			)}
		</Space>
	);
};
