/** Misma regla que el servidor (`ClientRouteRepository.bulk_move`): los movidos conservan su orden relativo y los demás se recorren. */
export type MoveTarget = 'start' | 'end' | 'position';

export interface RouteRow {
	id: string
	name: string
	order: number
}

export interface PreviewRow extends RouteRow {
	newOrder: number
	status: 'moved' | 'shifted' | 'same'
}

export const computeMove = (rows: RouteRow[], movingIds: string[], target: MoveTarget, position = 1): PreviewRow[] => {
	const sorted = [...rows].sort((a, b) => a.order - b.order);
	const chosen = new Set(movingIds);
	const moved = sorted.filter(row => chosen.has(row.id));
	const rest = sorted.filter(row => !chosen.has(row.id));

	let result: RouteRow[];
	if (target === 'start') result = [...moved, ...rest];
	else if (target === 'end') result = [...rest, ...moved];
	else {
		const index = Math.min(Math.max(position, 1) - 1, rest.length);
		result = [...rest.slice(0, index), ...moved, ...rest.slice(index)];
	}

	return result.map((row, index) => ({
		...row,
		newOrder: index + 1,
		status: chosen.has(row.id) ? 'moved' : index + 1 !== row.order ? 'shifted' : 'same',
	}));
};

/** Ventana corta de la secuencia: un vecino antes del primer movido, los movidos y un vecino después. */
export const previewWindow = (rows: PreviewRow[], maxRows = 7): PreviewRow[] => {
	const first = rows.findIndex(row => row.status === 'moved');
	if (first < 0) return rows.slice(0, maxRows);
	const lastMoved = rows.map(row => row.status).lastIndexOf('moved');
	const start = Math.max(0, first - 1);
	const end = Math.min(rows.length, Math.max(lastMoved + 2, start + 4));
	return rows.slice(start, Math.min(end, start + maxRows));
};

/** Posición válida (1..total) a partir de lo que escribe el usuario. */
export const clampPosition = (value: number | null | undefined, total: number) => Math.min(Math.max(Math.trunc(value ?? 1), 1), Math.max(total, 1));

export const pluralClients = (count: number) => `${count} ${count === 1 ? 'cliente' : 'clientes'}`;
