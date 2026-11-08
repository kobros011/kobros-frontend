import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/domain/Pagination';

/**
 * Estado de paginación del servidor para un listado.
 * - `resetKey`: al cambiar (filtros, búsqueda…) vuelve a la página 1.
 * - `clampToTotal(total)`: si la página actual queda fuera de rango (p. ej. se desactivó el
 *   último registro de la última página), retrocede a la última página válida. Se llama con
 *   el `total` que devuelve la propia query: `useEffect(() => clampToTotal(total), [total, clampToTotal])`.
 */
export const usePagination = (resetKey: unknown) => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	useEffect(() => {
		setPage(1);
	}, [resetKey]);

	const clampToTotal = useCallback((total: number) => {
		if (total > 0 && (page - 1) * pageSize >= total) {
			setPage(Math.ceil(total / pageSize));
		}
	}, [page, pageSize]);

	const onChange = (nextPage: number, nextPageSize: number) => {
		if (nextPageSize !== pageSize) {
			setPageSize(nextPageSize);
			setPage(1);
			return;
		}
		setPage(nextPage);
	};

	return { page, pageSize, onChange, clampToTotal };
};
