import { CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Tooltip } from 'antd';
import { FC, ReactNode } from 'react';

export const ACTION_COLUMN_WIDTH = 112;

export interface OnClickActions<T> {
	see: (record: T) => void
	edit: (record: T) => void
	delete: (record: T) => void
	inactiveTab?: boolean
	/** Por defecto true. En false se oculta el botón de editar. */
	canEdit?: boolean
	/** Por defecto true. En false se oculta la acción de desactivar/activar. */
	canDelete?: boolean
	moreActions?: { label: string, key: number | string, action: (record: T) => void, icon: ReactNode }[]
}

type IconActionProps = {
	title: string
	icon: ReactNode
	onClick: () => void
	ghost?: boolean
	danger?: boolean
};

export const IconActionButton: FC<IconActionProps> = ({ title, icon, onClick, ghost, danger }) => (
	<Tooltip title={title}>
		<Button
			size="small"
			type="primary"
			ghost={ghost}
			danger={danger}
			icon={icon}
			onClick={onClick}
		/>
	</Tooltip>
);

export const useRowActions = <T extends object>(actions: OnClickActions<T>, width?: number)=> {

	const getMoreItems = (record: T) => {
		return [
			...(actions.canDelete === false ? [] : [{
				key: 'toggle',
				icon: actions.inactiveTab ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
				label: actions.inactiveTab ? 'Activar' : 'Desactivar',
				onClick: () => actions.delete(record),
			}]),
			...(actions?.moreActions?.map((item) => ({
				key: item.key,
				label:item.label,
				icon: item.icon,
				onClick: () => item.action(record),
			})) ?? []),
		];
	};

	const RowActions: FC<{ record: T }> = ({ record }) => {
		const toggleTitle = actions.inactiveTab ? 'Activar' : 'Desactivar';
		const toggleIcon = actions.inactiveTab ? <CheckCircleOutlined /> : <CloseCircleOutlined />;

		return (
			<Space.Compact style={{ display: 'inline-flex' }}>
				<IconActionButton
					title="Ver"
					icon={<EyeOutlined />}
					onClick={() => actions.see(record)}
					ghost
				/>
				{!actions.inactiveTab && actions.canEdit !== false && (
					<IconActionButton
						title="Editar"
						icon={<EditOutlined />}
						onClick={() => actions.edit(record)}
					/>
				)}
				{((actions.moreActions?.length ?? 0) === 0) && actions.canDelete !== false && (
					<IconActionButton
						title={toggleTitle}
						icon={toggleIcon}
						onClick={() => actions.delete(record)}
						danger={!actions.inactiveTab}
					/>
				)}
				{((actions.moreActions?.length ?? 0) > 0) && (
					<Dropdown trigger={['click']} menu={{ items: getMoreItems(record) }}>
						<Tooltip title="Más acciones">
							<Button size="small" type="primary" icon={<MoreOutlined />} />
						</Tooltip>
					</Dropdown>
				)}
			</Space.Compact>
		);
	};

	const columnActions: CustomColumn<T>  = {
		key: 'actions',
		title: 'Acciones',
		width: width ?? ACTION_COLUMN_WIDTH,
		render: (record: T) => {
			return <RowActions record={record} />;
		},
	};

	return { columnActions };
};
