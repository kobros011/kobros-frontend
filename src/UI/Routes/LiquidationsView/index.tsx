import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { getLiquidationPage } from '@/infrastructure/querys/Liquidation';
import { TypeUser } from '@/constants/types';
import { ClosingTab } from './ClosingTab';
import { HistoryTab } from './HistoryTab';
import { LiquidationsBanner, LiquidationTab } from './LiquidationsBanner';
import { PendingTab } from './PendingTab';
import './liquidations.css';

const TABS: LiquidationTab[] = ['cierre', 'historial', 'pendientes'];

/** Liquidaciones: Cierre del día · Historial de cierres · Por confirmar (admin). La pestaña vive en la URL (?tab=). */
const LiquidationsView: FC = () => {
	const [params, setParams] = useSearchParams();
	const { typeUser } = useUserStore(state => state.user);
	const role = normalizeTypeUser(typeUser) ?? TypeUser.collector;
	const isAdmin = [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);

	const requested = params.get('tab') as LiquidationTab | null;
	const tab: LiquidationTab = requested && TABS.includes(requested) && (isAdmin || requested !== 'pendientes') ? requested : 'cierre';

	const { page } = getLiquidationPage({ status: 'pendiente' }, { page: 1, pageSize: 1 }, isAdmin);

	return (
		<DashboardShell>
			<LiquidationsBanner tab={tab} isAdmin={isAdmin} pendingCount={page?.total ?? 0} onTabChange={next => setParams({ tab: next })} />
			{tab === 'cierre' && <ClosingTab isAdmin={isAdmin} />}
			{tab === 'historial' && <HistoryTab isAdmin={isAdmin} />}
			{tab === 'pendientes' && isAdmin && <PendingTab />}
		</DashboardShell>
	);
};

export default LiquidationsView;
