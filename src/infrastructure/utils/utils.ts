import { Option } from '@/constants/types';
import { theme } from 'antd';

export const getBorderedStyle = (isEmpty: boolean) => {
	const { token } = theme.useToken();

	return { border: `1px solid ${isEmpty ? token.colorPrimary : token.colorBgContainer }` };
};

export const filterOption = (input: string, option?: { label: string; value: number }) => {
	if (!option) return false;
	const label = option?.label.toString().toLocaleLowerCase();
	const search = input.toLowerCase();
	return label?.includes(search) || label?.includes(search);
};

export function filterSortByString(a: Option, b: Option) {
	const labelA = a?.label.toString();
	const labelB = b?.label.toString();

	return labelA.localeCompare(labelB);
}

export function filterSortByOrder(optionA: { label: string; value: number | undefined; }, optionB: { label: string; value: number | undefined; })  {
	const numA = Number(optionA.value);
	const numB = Number(optionB.value);
	return numA - numB;
}