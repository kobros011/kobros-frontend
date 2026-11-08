import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { Flex, Tag } from 'antd';
import { FC } from 'react';
import { iconMap } from './Fields/SelectIcon';

const getIcon = (keyIcon?: string) => iconMap[keyIcon as keyof typeof iconMap]?.component;

export const TagConcept: FC<{ concept?: ExpensesConcepts }> = ({ concept }) => {
	if (!concept) return null;

	const IconComponent = getIcon(concept.keyIcon);

	return (
		<Tag color={concept.color}>
			{IconComponent && <IconComponent style={{ fontSize: '17px', marginRight: '5px', marginBottom: '-4px' }} />}
			{concept.concept}
		</Tag>
	);
};

export const TagConceptSelect: FC<{ concept?: ExpensesConcepts }> = ({ concept }) => {
	if (!concept) return null;

	const IconComponent = getIcon(concept.keyIcon);

	return (
		<Flex gap={10}>
			{IconComponent && <IconComponent style={{ fontSize: '22px', color: concept.color }} />}
			<Tag color={concept.color}>{concept.concept}</Tag>
		</Flex>
	);
};
