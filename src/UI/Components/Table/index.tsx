import { ConfigProvider, Flex, Table } from 'antd';
import { ReactNode, useMemo } from 'react';
import { IRecord, PropsTables } from './types';
import LoadingComponent from '../LoadingComponent';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useTableViewStore from '@/infrastructure/context/TableViewStore';
import { DEFAULT_CARD_FIELDS_COUNT, getConfigurableFields, mergeFieldPrefs } from './fieldCatalog';
import ViewSwitcher from './ViewSwitcher';
import FieldSettingsPopover from './FieldSettingsPopover';
import CardListView from './CardListView';
import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';

function CustomTable<
	RecordType extends IRecord = IRecord,
>({ dataSource, loading, onRow, columns = [], moduleName, titleField, onRowClick, cardFooterBadge, pagination, ...props }: PropsTables<RecordType>) {
	const { isMobile } = useUserModeStore(state => state);

	const modulePrefs = useTableViewStore(state => (moduleName ? state.modules[moduleName] : undefined));
	const setViewMode = useTableViewStore(state => state.setViewMode);
	const setTableFields = useTableViewStore(state => state.setTableFields);
	const setCardFields = useTableViewStore(state => state.setCardFields);

	const viewMode = modulePrefs?.viewMode ?? 'table';
	const fields = useMemo(() => getConfigurableFields(columns), [columns]);
	const tableFieldPrefs = useMemo(
		() => mergeFieldPrefs(fields, modulePrefs?.tableFields ?? []),
		[fields, modulePrefs?.tableFields],
	);
	const cardFieldPrefs = useMemo(
		() => mergeFieldPrefs(fields, modulePrefs?.cardFields ?? [], DEFAULT_CARD_FIELDS_COUNT),
		[fields, modulePrefs?.cardFields],
	);

	const actionsColumn = columns.find(column => column.key === 'actions');

	const visibleColumns = useMemo(() => {
		if (!moduleName) return columns;

		const byKey = new Map(columns.map(column => [String(column.key ?? (column as { dataIndex?: string }).dataIndex ?? ''), column]));
		const ordered = tableFieldPrefs
			.filter(pref => pref.visible)
			.map(pref => byKey.get(pref.key))
			.filter((column): column is NonNullable<typeof column> => Boolean(column));

		return actionsColumn ? [...ordered, actionsColumn] : ordered;
	}, [moduleName, columns, tableFieldPrefs, actionsColumn]);

	const loadingIndicator = props.isLoading
		? { indicator: <LoadingComponent />, style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }
		: false;

	const table = (
		<ConfigProvider>
			<Table
				{ ...props }
				dataSource={dataSource}
				loading={loadingIndicator}
				columns={moduleName ? visibleColumns : columns}
				size="small"
				pagination={pagination ? {
					current: pagination.page,
					pageSize: pagination.pageSize,
					total: pagination.total,
					onChange: pagination.onChange,
					showSizeChanger: !isMobile,
					pageSizeOptions: PAGE_SIZE_OPTIONS,
					simple: isMobile,
					size: 'small',
					hideOnSinglePage: pagination.total <= PAGE_SIZE_OPTIONS[0],
				} : false}
				scroll={{ x: props.scrollX ?? 'max-content', y: props.scrollY ?? (isMobile ? 'calc(100dvh - 200px)' : 'calc(100vh - 260px)') }}
				rowKey={(record) => record.id ? record.id.toString() : record.name || ''}
				bordered
			/>
		</ConfigProvider>
	);

	if (!moduleName) {
		return table;
	}

	return (
		<Flex vertical gap={8} style={{ height: '100%', minHeight: 0 }}>
			<Flex
				justify="space-between"
				align="center"
				wrap="wrap"
				gap={8}
			>
				<ViewSwitcher value={viewMode} onChange={mode => setViewMode(moduleName, mode)} />
				{viewMode === 'table' ? (
					<FieldSettingsPopover
						title="Columnas"
						fields={fields}
						prefs={tableFieldPrefs}
						onChange={prefs => setTableFields(moduleName, prefs)}
					/>
				) : (
					<FieldSettingsPopover
						title="Tarjeta"
						fields={fields}
						prefs={cardFieldPrefs}
						onChange={prefs => setCardFields(moduleName, prefs)}
					/>
				)}
			</Flex>

			{viewMode === 'table' ? (
				table
			) : (
				// Sin contenedor de scroll propio: la vista de tarjetas fluye con el scroll normal
				// de la página (como la tabla no lo necesita por su scroll interno, un segundo
				// scroll anidado aquí solo recortaba las tarjetas contra un límite de altura falso).
				<CardListView<RecordType>
					dataSource={dataSource as readonly RecordType[]}
					fields={fields}
					prefs={cardFieldPrefs}
					titleField={titleField}
					isLoading={props.isLoading}
					renderActions={actionsColumn?.render ? record => actionsColumn.render!(record, record, 0) as ReactNode : undefined}
					onCardClick={onRowClick}
					footerBadge={cardFooterBadge}
					pagination={pagination}
					isMobile={isMobile}
				/>
			)}
		</Flex>
	);
}

export default CustomTable;
