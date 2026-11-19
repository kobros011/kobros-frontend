import { FC, ReactNode } from 'react';
import { Button, Flex, Typography } from 'antd';
import { BranchesOutlined, CreditCardOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

import type { FormModule } from '@/domain/Settings';

export type ConfigModule = 'clientes' | 'creditos' | 'gastos' | 'rutas';

/** Clave del módulo en la configuración del backend. */
export const MODULE_KEY: Record<ConfigModule, FormModule> = { clientes: 'clients', creditos: 'loans', gastos: 'expenses', rutas: 'routes' };

/** Módulos con campos configurables: Clientes (obligatorios y personalizados) y los demás (solo personalizados). */
export const CONFIG_MODULES: { key: ConfigModule; label: string; icon: ReactNode }[] = [
	{ key: 'clientes', label: 'Clientes', icon: <UserOutlined /> },
	{ key: 'creditos', label: 'Créditos', icon: <CreditCardOutlined /> },
	{ key: 'gastos', label: 'Gastos', icon: <FileTextOutlined /> },
	{ key: 'rutas', label: 'Rutas', icon: <BranchesOutlined /> },
];

interface ModuleSelectorProps {
	value: ConfigModule
	onChange: (module: ConfigModule) => void
}

/** Selector del módulo cuyos campos se configuran (chips; los que no caben pasan a la línea siguiente). */
export const ModuleSelector: FC<ModuleSelectorProps> = ({ value, onChange }) => (
	<Flex vertical gap={8}>
		<Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
			Módulo a configurar
		</Typography.Text>
		<Flex gap={8} wrap role="group" aria-label="Módulo a configurar">
			{CONFIG_MODULES.map(module => (
				<Button
					key={module.key}
					type={module.key === value ? 'primary' : 'default'}
					icon={module.icon}
					aria-pressed={module.key === value}
					onClick={() => onChange(module.key)}
				>
					{module.label}
				</Button>
			))}
		</Flex>
	</Flex>
);

export default ModuleSelector;
