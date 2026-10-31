import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { Flex, Tag } from 'antd';
import { FC } from 'react';
import { iconMap } from './Fields/SelectIcon';

export const TagConcept: FC<{ concept: ExpensesConcepts }> = ({ concept }) => {
	const IconComponent = iconMap[concept.keyIcon as keyof typeof iconMap].component;
    
	return (
		<Tag color={concept.color}><IconComponent style={{ fontSize: '17px', marginRight: '5px', marginBottom: '-4px' }} />{concept.concept}</Tag>
	);
};

export const TagConceptSelect: FC<{ concept: ExpensesConcepts }> = ({ concept }) => {
	const IconComponent = iconMap[concept.keyIcon as keyof typeof iconMap].component;
    

	return (
		<Flex gap={10}>
			<IconComponent style={{ fontSize: '22px', color: concept.color }} />
			<Tag color={concept.color}>{concept.concept}</Tag>
		</Flex>
	);
};