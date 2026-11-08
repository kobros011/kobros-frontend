import { MODULESNAME } from '@/constants/MODULESNAME';
import routePaths from '@/constants/routePaths';
import { LoanFullRead } from '@/domain/Loan';
import { getPageLoans } from '@/infrastructure/querys/Loan';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getColumns } from './Columns';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { usePagination } from '@/infrastructure/hooks/usePagination';

interface TableLoansProps {
	isSearching: boolean,
}

export const TablesLoans: FC<TableLoansProps> = ({ isSearching }) => {
	const moduleName = MODULESNAME.loans;
	const filters = filtersStore(state => state.filtersMap[moduleName]) ?? {};
	const navigate = useNavigate();

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters));

	const { loans, total, isRefetching, isLoading, isFetching } = getPageLoans(filters, { page, pageSize }, isSearching);

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	const seeLoan = (record: LoanFullRead) => void navigate(
		`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${record.id}`,
		{ state: { clientId: record?.clientId, routesIds: [record?.routeId] } },
	);

	return (
		<CustomTable<LoanFullRead>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={loans}
			columns={getColumns(seeLoan)}
			moduleName={moduleName}
			titleField="fullName"
			onRowClick={seeLoan}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};
