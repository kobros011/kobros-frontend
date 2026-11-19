import { FC, ReactNode } from 'react';
import { Flex, Switch, theme, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface ConfigRowProps {
	title: string
	description?: ReactNode
	/** Campo del sistema: no se puede cambiar; se muestra con candado y los interruptores deshabilitados. */
	locked?: boolean
	required: boolean
	visible: boolean
	onRequiredChange?: (required: boolean) => void
	onVisibleChange?: (visible: boolean) => void
	requiredLabel?: string
	visibleLabel?: string
}

/** Fila con dos interruptores (Requerido y Visible). Un campo oculto no puede ser requerido: el interruptor se deshabilita. */
export const ConfigRow: FC<ConfigRowProps> = ({
	title, description, locked = false, required, visible, onRequiredChange, onVisibleChange,
	requiredLabel = 'Requerido', visibleLabel = 'Visible',
}) => {
	const { token } = theme.useToken();
	const requiredDisabled = locked || !visible || !onRequiredChange;
	const visibleDisabled = locked || !onVisibleChange;

	return (
		<Flex className="kb-config-row" align="center" justify="space-between" gap={12} style={{ minHeight: 44, padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
			<Flex vertical gap={2} style={{ minWidth: 0, flex: '1 1 0' }}>
				<Flex align="center" gap={6}>
					{locked && <LockOutlined aria-hidden style={{ color: token.colorTextTertiary }} />}
					<Typography.Text strong>{title}</Typography.Text>
				</Flex>
				{description && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{description}</Typography.Text>}
				{!visible && !locked && (
					<Typography.Text type="secondary" italic style={{ fontSize: 12 }}>Un campo oculto no puede ser requerido</Typography.Text>
				)}
			</Flex>
			<Flex gap={16} align="center" style={{ flex: 'none' }}>
				<Flex vertical align="center" gap={2}>
					<Switch
						size="small"
						aria-label={`${requiredLabel}: ${title}`}
						checked={required}
						disabled={requiredDisabled}
						onChange={onRequiredChange}
					/>
					<Typography.Text type="secondary" style={{ fontSize: 11 }}>{requiredLabel}</Typography.Text>
				</Flex>
				<Flex vertical align="center" gap={2}>
					<Switch
						size="small"
						aria-label={`${visibleLabel}: ${title}`}
						checked={visible}
						disabled={visibleDisabled}
						onChange={onVisibleChange}
					/>
					<Typography.Text type="secondary" style={{ fontSize: 11 }}>{visibleLabel}</Typography.Text>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default ConfigRow;
