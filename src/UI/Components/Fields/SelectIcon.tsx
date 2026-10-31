import React, { FC, useState } from 'react';
import { Select } from 'antd';
import { FaUtensils, FaGasPump, FaHouseDamage, FaShoppingCart, FaBus, FaStethoscope, FaEllipsisH, FaMoneyBillWave, FaRegCreditCard } from 'react-icons/fa';
import { FiSmartphone } from 'react-icons/fi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { SelectProps } from 'antd/lib';

const { Option } = Select;

export const iconMap = {
	FaUtensils: { component: FaUtensils, name: 'Alimentación' },
	FaGasPump: { component: FaGasPump, name: 'Combustible' },
	FaHouseDamage: { component: FaHouseDamage, name: 'Hogar' },
	FaShoppingCart: { component: FaShoppingCart, name: 'Compras' },
	FaBus: { component: FaBus, name: 'Transporte' },
	FaStethoscope: { component: FaStethoscope, name: 'Salud' },
	FiSmartphone: { component: FiSmartphone, name: 'Comunicación' },
	FaMoneyBillWave: { component: FaMoneyBillWave, name: 'General' },
	FaRegCreditCard: { component: FaRegCreditCard, name: 'Pagos' },
	MdOutlineAttachMoney: { component: MdOutlineAttachMoney, name: 'Dinero' },
	FaEllipsisH: { component: FaEllipsisH, name: 'Otros' },
};

type KeyIcon = keyof typeof iconMap;

interface IconSelectorProps extends SelectProps {
	initialkeyIcon?: KeyIcon;
}

const IconSelector: React.FC<IconSelectorProps> = ({ initialkeyIcon, ...props }) => {
	const { isMobile } = useUserModeStore(state => state);
	const [selectedkeyIcon, setSelectedkeyIcon] = useState<KeyIcon | undefined>(initialkeyIcon);

	const handleIconChange = (value: KeyIcon) => {
		setSelectedkeyIcon(value);
	};

	const RenderLabel: FC<{ keyIcon: KeyIcon }> = ({ keyIcon }) => {
		const { component: IconComponent, name } = iconMap[keyIcon as KeyIcon];

		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<IconComponent />
				<span>{name}</span>
			</div>
		);
	};

	const renderSelectedValue = (value: KeyIcon) => {
		const IconComponent = iconMap[value].component;

		if (isMobile) {
			return <IconComponent style={{ fontSize: '18px', verticalAlign: 'middle', marginTop: '-3px' }} />;
		}

		return <RenderLabel keyIcon={value} />;
	};

	return (
		<Select
			placeholder="Selecciona un icono"
			style={{ width: isMobile ? 70 : 180 }}
			onChange={handleIconChange}
			popupMatchSelectWidth={false}
			value={selectedkeyIcon}
			labelRender={(labelRender) => renderSelectedValue(labelRender.value as KeyIcon)}
			{...props}
		>
			{Object.keys(iconMap).map((keyIcon) => {
				return (
					<Option key={keyIcon} value={keyIcon}>
						<RenderLabel keyIcon={keyIcon as KeyIcon}  />
					</Option>
				);
			})}
		</Select>
	);
};

export default IconSelector;
