import { Button, Drawer, Flex, Menu, MenuProps, theme, Typography } from 'antd';
import { FC, useState } from 'react';
import MenuItem from './MenuItem';
import useGuardedNavigate from '../useGuardedNavigate';
import routePaths from '@/constants/routePaths';
import { Link, useLocation } from 'react-router-dom';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getPermission } from '@/infrastructure/utils/Permissions';
import { AppstoreOutlined } from '@ant-design/icons';
import {
	ADMIN_SECTION_LABEL,
	ItemTypeWithKey,
	OPERATION_SECTION_LABEL,
	adminItems,
	operationalItems,
} from './menuItems';

const MOBILE_PRIMARY_COUNT = 4;

/** Clic con Ctrl, Cmd, Mayús o botón del medio: se deja al navegador (abrir en otra pestaña). */
const isModifiedClick = (event: { metaKey: boolean, ctrlKey: boolean, shiftKey: boolean, button?: number }) =>
	event.metaKey || event.ctrlKey || event.shiftKey || (event.button !== undefined && event.button !== 0);

const SectionLabel: FC<{ children: string }> = ({ children }) => (
	<Typography.Text
		type="secondary"
		style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}
	>
		{children}
	</Typography.Text>
);

export const ModulesMenu: FC<{ collapsed: boolean, mobile?: boolean }> = ({ collapsed, mobile = false }) => {

	const { token: { colorBgContainer, colorPrimary, colorPrimaryBgHover } } = theme.useToken();
	const { typeUser } = useUserStore(state => state.user);
	const { hasShowViewsKeys } = getPermission(typeUser);
	const [moreOpen, setMoreOpen] = useState(false);
	// Toda navegación del menú pasa por aquí: pregunta antes de salir de un formulario con cambios sin guardar.
	const go = useGuardedNavigate();

	const location = useLocation();
	const pattern = new RegExp(`${routePaths.DEFAULT_HOME}/([^/]+)`); // Expresión regular construida dinámicamente
	const locationKey = location.pathname.match(pattern)?.[1];

	const operationalFiltered = operationalItems.filter(item => hasShowViewsKeys.includes(item.key));
	const adminFiltered = adminItems.filter(item => hasShowViewsKeys.includes(item.key));
	const menuItemsFiltered = [...operationalFiltered, ...adminFiltered];

	if (!mobile) {
		// El enlace conserva su href (abrir en otra pestaña); el clic normal lo maneja el menú, que navega con o sin confirmación.
		const toMenuItem = ({ label, to, ...item }: ItemTypeWithKey) => ({
			label: <Link to={to} onClick={event => { if (!isModifiedClick(event)) event.preventDefault(); }}>{label}</Link>,
			...item,
		});
		const pathByKey = new Map([...operationalFiltered, ...adminFiltered].map(item => [item.key, `/${item.to}`]));
		const operationChildren = operationalFiltered.map(toMenuItem);
		const adminChildren = adminFiltered.map(toMenuItem);

		// Con el menú angosto antd oculta los títulos de grupo: ahí se separa con un divider.
		const items: MenuProps['items'] = collapsed
			? [
				...operationChildren,
				...(adminChildren.length > 0 ? [{ type: 'divider' as const, key: 'admin-divider' }] : []),
				...adminChildren,
			]
			: [
				...(operationChildren.length > 0 ? [{
					type: 'group' as const,
					key: 'group-operation',
					label: <SectionLabel>{OPERATION_SECTION_LABEL}</SectionLabel>,
					children: operationChildren,
				}] : []),
				...(adminChildren.length > 0 ? [{
					type: 'group' as const,
					key: 'group-admin',
					label: <SectionLabel>{ADMIN_SECTION_LABEL}</SectionLabel>,
					children: adminChildren,
				}] : []),
			];

		return (
			<Menu
				mode='inline'
				items={items}
				inlineCollapsed={collapsed}
				selectedKeys={[ locationKey ?? routePaths.INICIO ]}
				onClick={({ key, domEvent }) => {
					const path = pathByKey.get(key);
					if (path && !isModifiedClick(domEvent)) go(path);
				}}
			/>
		);
	}

	const primaryItems = menuItemsFiltered.slice(0, MOBILE_PRIMARY_COUNT);
	const overflowItems = menuItemsFiltered.slice(MOBILE_PRIMARY_COUNT);
	const hasOverflow = overflowItems.length > 0;
	const moreIsActive = overflowItems.some(item => locationKey === item.key);

	const adminKeys = new Set(adminFiltered.map(item => item.key));
	const overflowSections = [
		{ title: OPERATION_SECTION_LABEL, items: overflowItems.filter(item => !adminKeys.has(item.key)) },
		{ title: ADMIN_SECTION_LABEL, items: overflowItems.filter(item => adminKeys.has(item.key)) },
	].filter(section => section.items.length > 0);

	return (
		<>
			<Flex className={'menu'} style={{ background: colorBgContainer }}>
				{primaryItems.map(({ isShow, key, ...item }) => (
					<MenuItem isActive={locationKey == key} key={key} {...item} mobile={mobile} onNavigate={go} />
				))}
				{hasOverflow && (
					<Flex justify="center" align="center" vertical style={{ flex: '0 1 auto', minWidth: 0 }}>
						<Button
							type="text"
							onClick={() => setMoreOpen(true)}
							style={{
								height: 'auto',
								minHeight: 44,
								minWidth: 44,
								flex: 1,
								paddingTop: 5,
								paddingInline: 10,
								border: 'none',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: moreIsActive ? colorPrimaryBgHover : 'inherit',
							}}
						>
							<Flex
								justify="center"
								align="center"
								vertical
								className="flex-menu-item"
								style={{ color: moreIsActive ? colorPrimary : 'inherit' }}
							>
								<AppstoreOutlined style={{ fontSize: 18 }} />
								<span style={{ color: moreIsActive ? colorPrimary : 'inherit', fontSize: 11 }}>Más</span>
							</Flex>
						</Button>
					</Flex>
				)}
			</Flex>

			<Drawer
				title="Más opciones"
				placement="bottom"
				height="auto"
				open={moreOpen}
				onClose={() => setMoreOpen(false)}
				styles={{ body: { padding: 0, background: colorBgContainer }, mask: { backdropFilter: 'blur(4px)' } }}
			>
				{overflowSections.map(section => (
					<div key={section.title}>
						<div style={{ padding: '12px 16px 4px' }}>
							<SectionLabel>{section.title}</SectionLabel>
						</div>
						{section.items.map(({ label, icon, to, key }) => (
							<Link
								key={key}
								to={`/${to}`}
								onClick={event => {
									if (isModifiedClick(event)) return;
									event.preventDefault();
									setMoreOpen(false);
									go(`/${to}`);
								}}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									padding: '12px 16px',
									minHeight: 48,
									color: locationKey === key ? colorPrimary : 'inherit',
									background: locationKey === key ? colorPrimaryBgHover : undefined,
								}}
							>
								{icon}
								<span>{label}</span>
							</Link>
						))}
					</div>
				))}
			</Drawer>
		</>
	);
};
