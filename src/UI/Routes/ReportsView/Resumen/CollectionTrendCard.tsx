import { FC } from 'react';
import { Empty } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { SectionCard } from '@/UI/Components/Dashboard/ui';
import { CollectionAreaChart } from '@/UI/Components/Dashboard/charts';
import { DailyPointDto } from '@/infrastructure/dto/DashboardDto';

export const CollectionTrendCard: FC<{ data: DailyPointDto[] }> = ({ data }) => (
	<SectionCard icon={<LineChartOutlined />} title="Cobro diario vs. meta esperada" subtitle="Evolución del recaudo día a día (historial disponible)">
		{data.length > 0 ? <CollectionAreaChart data={data} /> : <Empty description="Sin historial de pagos" />}
	</SectionCard>
);
