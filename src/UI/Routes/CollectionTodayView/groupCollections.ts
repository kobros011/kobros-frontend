import { Collection } from '@/domain/Collection';

import { PaymentStatus } from '@/constants/types';

import dayjs, { Dayjs } from 'dayjs';


export type QuotaDisplayKind = 'paid' | 'default' | 'partial' | 'pending';

export interface CollectionKpis {
	totalExpected: number;
	totalCollected: number;
	pendingAmount: number;
	quotaCount: number;
	clientCount: number;
	unpaidQuotaCount: number;
	progressPercent: number;
}

export const getQuotaFixed = (item: Collection): number =>
	item.valueQuotaFixed > 0 ? item.valueQuotaFixed : item.value;

export const getRemainingAmount = (item: Collection): number => {
	const fixed = getQuotaFixed(item);
	const applied = item.applied ?? 0;
	return Math.max(0, fixed - applied);
};

export const isPaid = (item: Collection): boolean => item.status === PaymentStatus.paid;

export const isPartial = (item: Collection): boolean => {
	if (isPaid(item)) return false;
	const applied = item.applied ?? 0;
	const fixed = getQuotaFixed(item);
	return applied > 0 && applied < fixed;
};

export const getOverdueDays = (item: Collection, selectedDate: Dayjs): number => {
	if (isPaid(item)) return 0;
	const due = dayjs(item.payDate).startOf('day');
	const ref = selectedDate.startOf('day');
	return Math.max(0, ref.diff(due, 'day'));
};

export const getQuotaDisplayKind = (item: Collection): QuotaDisplayKind => {
	if (isPaid(item)) return 'paid';
	if (item.status === PaymentStatus.default) return 'default';
	if (isPartial(item)) return 'partial';
	return 'pending';
};

const quotaSortRank = (item: Collection): number => {
	const kind = getQuotaDisplayKind(item);
	if (kind === 'default') return 0;
	if (kind === 'pending') return 1;
	if (kind === 'partial') return 2;
	return 3;
};

export const sortQuotasInGroup = (items: Collection[], selectedDate: Dayjs): Collection[] => {
	return [...items].sort((a, b) => {
		const rankDiff = quotaSortRank(a) - quotaSortRank(b);
		if (rankDiff !== 0) return rankDiff;
		if (quotaSortRank(a) === 0) {
			return getOverdueDays(b, selectedDate) - getOverdueDays(a, selectedDate);
		}
		return a.quotaNumber - b.quotaNumber;
	});
};

export const groupCollectionsByClient = (
	collection: Collection[],
	selectedDate: Dayjs,
): Collection[][] => {
	const sorted = [...collection].sort((a, b) => a.order - b.order);
	const map = new Map<string, Collection[]>();
	for (const item of sorted) {
		const prev = map.get(item.clientId) ?? [];
		map.set(item.clientId, [...prev, item]);
	}
	const groups = Array.from(map.values());
	groups.sort((a, b) => Math.min(...a.map(i => i.order)) - Math.min(...b.map(i => i.order)));
	return groups.map(g => sortQuotasInGroup(g, selectedDate));
};

export const computeGroupBalance = (items: Collection[]): number =>
	items.filter(i => !isPaid(i)).reduce((sum, i) => sum + getRemainingAmount(i), 0);

export const computeCollectionKpis = (collection: Collection[]): CollectionKpis => {
	const clientIds = new Set(collection.map(c => c.clientId));
	const totalExpected = collection.reduce((s, i) => s + i.value, 0);
	const totalCollected = collection.reduce((s, i) => s + (i.applied ?? 0), 0);
	const pendingAmount = Math.max(0, totalExpected - totalCollected);
	const unpaidQuotaCount = collection.filter(i => !isPaid(i)).length;
	const progressPercent =
		totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

	return {
		totalExpected,
		totalCollected,
		pendingAmount,
		quotaCount: collection.length,
		clientCount: clientIds.size,
		unpaidQuotaCount,
		progressPercent,
	};
};

export const getGroupHeaderBadges = (items: Collection[]) => {
	const unpaid = items.filter(i => !isPaid(i));
	const paidToday = items.filter(i => isPaid(i));
	const mora = unpaid.filter(i => i.status === PaymentStatus.default);
	return {
		pendingCount: unpaid.length,
		moraCount: mora.length,
		paidCount: paidToday.length,
	};
};

export const getGroupFooterText = (items: Collection[]): string => {
	const loanIds = new Set(items.map(i => i.loanId));
	if (loanIds.size === 1) {
		const agreed = items[0]?.agreedQuotas ?? items.length;
		return `Mostrando ${items.length} de ${agreed} cuotas registradas`;
	}
	return `Mostrando ${items.length} cuotas · ${loanIds.size} créditos`;
};
