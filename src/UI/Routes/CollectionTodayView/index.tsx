import { Card, Col, DatePicker, Empty, Row, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { SelectRoute } from '@components/Fields/SelectRoute';
import LoadingComponent from '@components/LoadingComponent';
import ErrorView from '@components/ErrorView';
import { getListCollection } from '@/infrastructure/querys/Collection';
import { ClientGroupCard } from './ClientGroupCard';
import { CollectionTodayKpis } from './CollectionTodayKpis';
import { CollectionTodayShell } from './CollectionTodayShell';
import dayjs, { Dayjs } from 'dayjs';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import {
	computeCollectionKpis,
	groupCollectionsByClient,
} from './groupCollections';
import './collectionToday.css';

const { Title } = Typography;

const CollectionTodayView: FC = () => {
	const [routeId, setRouteId] = useState<string | undefined>(undefined);
	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

	const { routes } = useRoutes();

	useEffect(() => {
		if (routes.length === 1 && !routeId) {
			setRouteId(routes[0].id);
		}
	}, [routes, routeId]);

	const dateStr = selectedDate.format('YYYY-MM-DD');
	const { collection, isLoading, isError, isFetching } = getListCollection(routeId, dateStr);

	const grouped = useMemo(
		() => groupCollectionsByClient(collection, selectedDate),
		[collection, selectedDate],
	);

	const kpis = useMemo(() => computeCollectionKpis(collection), [collection]);

	const showInitialLoading = isLoading && collection.length === 0;

	if (showInitialLoading) {
		return <LoadingComponent fullHeight label="Cargando cobros del día..." />;
	}

	if (isError) {
		return <ErrorView title="Error al cargar los cobros" />;
	}

	return (
		<CollectionTodayShell>
			<Card className="collection-today-module-card" style={{ maxHeight: '90vh' }}>
				<div className="page-header">
					<Title level={2} style={{ margin: 0 }}>
						Cobro del día
					</Title>
				</div>

				<div className="collection-today-page">
					<Row gutter={[8, 8]} className="collection-today-filters">
						<Col xs={24} sm={12} md={8}>
							<SelectRoute
								size="small"
								placeholder="Ruta"
								value={routeId}
								onChange={(val) => setRouteId(val)}
								style={{ width: '100%' }}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<DatePicker
								size="small"
								value={selectedDate}
								onChange={(date) => date && setSelectedDate(date)}
								format="DD/MM/YYYY"
								style={{ width: '100%' }}
								allowClear={false}
							/>
						</Col>
					</Row>

					{!routeId && (
						<Empty description="Selecciona una ruta para ver los cobros" />
					)}

					{routeId && grouped.length === 0 && !isFetching && (
						<Empty description="No hay cobros para esta fecha" />
					)}

					{routeId && collection.length > 0 && (
						<CollectionTodayKpis kpis={kpis} />
					)}

					{routeId && grouped.length > 0 && (
						<div className="collection-today-client-list">
							{grouped.map((items) => (
								<ClientGroupCard
									key={items[0].clientId}
									items={items}
									selectedDate={selectedDate}
								/>
							))}
						</div>
					)}
				</div>
			</Card>
		</CollectionTodayShell>
	);
};

export default CollectionTodayView;
