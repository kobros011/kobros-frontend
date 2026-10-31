import React, { FC, ReactNode } from 'react';
import { Typography } from 'antd';
import { type ParagraphProps } from 'antd/es/typography/Paragraph';
import { type EllipsisConfig } from 'antd/es/typography/Base';
import useUserModeStore from '../context/User/UserModeStore';

interface Props extends ParagraphProps,
	Pick<EllipsisConfig, 'rows'> {
	text: ReactNode;
	width: string | number;
	isLink?: boolean;
	styles?: React.CSSProperties; // Se añade esta prop para no afectar los estilos ya establecidos en linea 27
}

const TypographyParagraph: FC<Props> = ({ text, width, isLink = false, rows = 1, styles, ...props }) => {
	const darkMode = useUserModeStore(state => state.darkMode);

	return (
		<Typography.Paragraph
			ellipsis={{
				rows,
				tooltip: {
					mouseEnterDelay: 0.5,
					overlayInnerStyle: { maxHeight: '30vh', overflow: 'auto' },
				},
			}}
			style={{ margin: 0, width, ...(isLink ? { color: darkMode ? '#1668dc' : '#1677ff', cursor: 'pointer' } : {}), ...(styles ?? {}) }}
			{...props}
		>
			{text}
		</Typography.Paragraph>
	);
};

export default TypographyParagraph;