import { TableOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Segmented, Tooltip } from 'antd';
import { FC } from 'react';
import { ViewMode } from '@/infrastructure/context/TableViewStore';

interface ViewSwitcherProps {
	value: ViewMode;
	onChange: (mode: ViewMode) => void;
	size?: 'small' | 'middle';
}

/** Selector Tabla/Lista: mismo patrón que Notion, Airtable o Linear usan para cambiar entre vista de datos. */
export const ViewSwitcher: FC<ViewSwitcherProps> = ({ value, onChange, size = 'middle' }) => {
	return (
		<Segmented<ViewMode>
			size={size}
			value={value}
			onChange={onChange}
			options={[
				{
					value: 'table',
					icon: (
						<Tooltip title="Vista de tabla">
							<TableOutlined />
						</Tooltip>
					),
				},
				{
					value: 'list',
					icon: (
						<Tooltip title="Vista de lista">
							<UnorderedListOutlined />
						</Tooltip>
					),
				},
			]}
		/>
	);
};

export default ViewSwitcher;
