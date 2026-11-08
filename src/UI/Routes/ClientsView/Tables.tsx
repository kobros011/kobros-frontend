import { formatRouteMoney } from '@/infrastructure/utils/money';
import { MODULESNAME } from '@/constants/MODULESNAME';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { Tag } from 'antd';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getColumns } from './columns';
import { getPageClients } from '@/infrastructure/querys/Client';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { Client } from '@/domain/Client';

interface TableClientsProps {
	isSearching: boolean
	actions: OnClickActions<Client>
	/** Selección masiva (solo administración): clientes elegidos, incluso de otras páginas. */
	selection?: { clients: Client[], onChange: (clients: Client[]) => void }
	type: 'active' | 'inactive'
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableClients: FC<TableClientsProps> = ({ isSearching, actions, type, setCount, selection }) => {
	const moduleName = MODULESNAME.clients;
	const filters = filtersStore(state => state.filtersMap[moduleName]);

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters ?? {}));
	const routeId = (filters as { routeId?: string } | undefined)?.routeId;

	const { clients, total, isLoading, isRefetching, isFetching } = getPageClients(
		{
			...filters,
			active: type == 'active' ? true : false,
		},
		{ page, pageSize },
		isSearching,
	);

	useEffect(() => {
		setCount((state) => {
			if (type == 'active') {
				return {
					inactive: state.inactive,
					active: total,
				};
			}

			return {
				active: state.active,
				inactive: total,
			};
		});
	}, [total]);

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	return (
		<CustomTable<Client>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={clients}
			columns={getColumns(actions, routeId, new Set(selection?.clients.map(client => client.id)))}
			selection={selection ? {
				keys: selection.clients.map(client => client.id),
				onToggle: (record, checked) => selection.onChange(checked ? [...selection.clients.filter(client => client.id !== record.id), record] : selection.clients.filter(client => client.id !== record.id)),
				onToggleMany: (records, checked) => {
					const ids = new Set(records.map(record => record.id));
					selection.onChange(checked ? [...selection.clients.filter(client => !ids.has(client.id)), ...records] : selection.clients.filter(client => !ids.has(client.id)));
				},
			} : undefined}
			moduleName={moduleName}
			titleField="fullName"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
			cardFooterBadge={(client) => {
				const count = client.activeLoansCount ?? 0;
				if (count === 0 && !(client.beak > 0)) return null;
				return (
					<>
						{count > 0 && (
							<Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
								{count} {count === 1 ? 'crédito activo' : 'créditos activos'}
							</Tag>
						)}
						{client.beak > 0 && (
							<Tag color="success" style={{ borderRadius: 999, margin: 0 }}>
								Saldo a favor {formatRouteMoney(client.beak, client.routeId)}
							</Tag>
						)}
					</>
				);
			}}
		/>
	);
};