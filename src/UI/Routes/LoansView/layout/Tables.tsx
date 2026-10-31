import { MODULESNAME } from '@/constants/MODULESNAME';
import { LoanFullRead } from '@/domain/Loan';
import { getListLoans } from '@/infrastructure/querys/Loan';
import CustomTable from '@/UI/Components/Table';
import { FC } from 'react';
import { getColumns } from './Columns';
import { filtersStore } from '@/infrastructure/context/FiltersStore';

interface TableLoansProps {
	isSearching: boolean,
}

export const TablesLoans: FC<TableLoansProps> = ({ isSearching }) => {
	const moduleName = MODULESNAME.loans;
	const filters = filtersStore(state => state.filtersMap[moduleName]) ?? {};

	const { loans, isRefetching, isLoading, isFetching } = getListLoans(filters, isSearching);

	return (
		<CustomTable<LoanFullRead>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={loans}
			columns={getColumns()}    
		/>
	);
};