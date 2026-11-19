import { CSSProperties, FC } from 'react';
import { Flex, Segmented, Tabs, theme, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { getPermission } from '@/infrastructure/utils/Permissions';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { TypeUser } from '@/constants/types';
import useSettingsBrandStore from '@/infrastructure/context/SettingsBrandStore';

export type SettingsTabKey = 'general' | 'obligatorios' | 'personalizados';

/** Una línea que explica qué se configura en cada sección. */
const DESCRIPTIONS: Record<SettingsTabKey, string> = {
	general: 'Organización, marca, monedas y formato de números.',
	obligatorios: 'Qué datos se piden y cuáles son obligatorios al registrar.',
	personalizados: 'Campos propios de tu marca para capturar información extra.',
};

const LABELS: Record<SettingsTabKey, string> = {
	general: 'General',
	obligatorios: 'Campos obligatorios',
	personalizados: 'Campos personalizados',
};

const PATHS: Record<SettingsTabKey, string> = {
	general: `/${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}`,
	obligatorios: `/${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}/${routePaths.SETTINGS_FIELDS}/obligatorios`,
	personalizados: `/${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}/${routePaths.SETTINGS_FIELDS}/personalizados`,
};

const KEYS: SettingsTabKey[] = ['general', 'obligatorios', 'personalizados'];

/**
 * Secciones de Configuración: «General» (organización, marca, monedas y números), «Campos obligatorios» (qué datos
 * se piden en cada formulario) y «Campos personalizados» (campos a la medida de la marca).
 *
 * Escritorio: pestañas subrayadas. Móvil: selector segmentado a todo el ancho con el texto completo en dos líneas
 * (las pestañas de Ant Design mandan las que no caben al menú «…» y «General» quedaba oculta). Solo se muestra a quien
 * puede administrar la configuración.
 */
export const SettingsTabs: FC<{ active: SettingsTabKey }> = ({ active }) => {
	const navigate = useNavigate();
	const isMobile = useUserModeStore(state => state.isMobile);
	const { token } = theme.useToken();
	const typeUser = useUserStore(state => state.user.typeUser);
	const { hasManageSettings } = getPermission(typeUser);
	const hasBrand = useSettingsBrandStore(state => !!state.brandId);
	// El desarrollador no tiene marca propia: hasta elegir una en «General», los campos no se pueden configurar.
	const needsBrand = normalizeTypeUser(typeUser) === TypeUser.dev && !hasBrand;

	if (!hasManageSettings) return null;

	return (
		<>
			{isMobile ? (
				<Segmented<SettingsTabKey>
					block
					className="kb-section-switch"
					value={active}
					onChange={key => void navigate(PATHS[key])}
					options={KEYS.map(key => ({ value: key, label: LABELS[key], disabled: key !== 'general' && needsBrand }))}
					style={{ '--kb-primary': token.colorPrimary } as CSSProperties}
				/>
			) : (
				<Tabs
					activeKey={active}
					onChange={key => void navigate(PATHS[key as SettingsTabKey])}
					items={KEYS.map(key => ({ key, label: LABELS[key], disabled: key !== 'general' && needsBrand }))}
					tabBarStyle={{ marginBottom: 0 }}
				/>
			)}
			<Flex align="center" gap={8} style={{ margin: '12px 0 16px' }}>
				<InfoCircleOutlined aria-hidden style={{ color: token.colorPrimary }} />
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>{DESCRIPTIONS[active]}</Typography.Text>
			</Flex>
		</>
	);
};

export default SettingsTabs;
