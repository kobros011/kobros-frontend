import { CheckOutlined } from '@ant-design/icons';
import { Tag, Typography, theme } from 'antd';
import { CSSProperties, FC } from 'react';

const { Text } = Typography;

export type StepStatusTag = 'Completado' | 'En revisión' | 'Pendiente';

interface StepHeaderProps {
	n: number;
	title: string;
	done?: boolean;
	active?: boolean;
	locked?: boolean;
	statusTag?: StepStatusTag;
}

export const StepHeader: FC<StepHeaderProps> = ({
	n,
	title,
	done,
	active,
	locked,
	statusTag,
}) => {
	const { token } = theme.useToken();
	const onLimeHeader = active && !locked;

	const badgeStyle: CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 24,
		height: 24,
		borderRadius: '50%',
		fontSize: 12,
		fontWeight: 700,
		marginRight: 10,
		flexShrink: 0,
	};

	if (done || (active && !locked)) {
		Object.assign(badgeStyle, {
			background: onLimeHeader ? 'rgba(255,255,255,0.25)' : token.colorPrimary,
			color: onLimeHeader ? '#fff' : '#fff',
			border: onLimeHeader ? '1px solid rgba(255,255,255,0.5)' : 'none',
		});
	} else {
		Object.assign(badgeStyle, {
			background: 'transparent',
			border: `2px solid ${locked ? token.colorTextDisabled : token.colorBorder}`,
			color: locked ? token.colorTextDisabled : token.colorTextSecondary,
		});
	}

	const titleColor = onLimeHeader ? '#fff' : locked ? token.colorTextDisabled : undefined;

	return (
		<span className="loan-step-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
			<span className="loan-step-header__badge" style={badgeStyle}>
				{done ? <CheckOutlined style={{ fontSize: 12 }} /> : n}
			</span>
			<Text strong className="loan-step-header__title" style={{ color: titleColor }}>
				{title}
			</Text>
			{statusTag && (
				<Tag
					color={statusTag === 'Completado' ? 'success' : statusTag === 'En revisión' ? 'processing' : 'default'}
					style={{
						margin: 0,
						fontSize: 10,
						...(onLimeHeader ? { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' } : {}),
					}}
				>
					{statusTag}
				</Tag>
			)}
		</span>
	);
};
