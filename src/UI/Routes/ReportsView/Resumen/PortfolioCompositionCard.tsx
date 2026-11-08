import { FC } from 'react';
import { PieChartOutlined } from '@ant-design/icons';
import { SectionCard } from '@/UI/Components/Dashboard/ui';
import { PortfolioDonut } from '@/UI/Components/Dashboard/charts';
import { CompositionDto } from '@/infrastructure/dto/DashboardDto';

export const PortfolioCompositionCard: FC<{ composition: CompositionDto; criticalDays: number }> = ({ composition, criticalDays }) => (
	<SectionCard icon={<PieChartOutlined />} title="Composición de cartera" subtitle="Distribución por estado de riesgo">
		<PortfolioDonut
			segments={[
				{ label: 'Al día (sin mora)', value: composition.up_to_date, tone: 'ok' },
				{ label: `Mora leve (<${criticalDays}d)`, value: composition.mild, tone: 'warn' },
				{ label: `Mora crítica (>${criticalDays}d)`, value: composition.critical, tone: 'danger' },
			]}
		/>
	</SectionCard>
);
