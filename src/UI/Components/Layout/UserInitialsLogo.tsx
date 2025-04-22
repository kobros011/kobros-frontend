import { FC, useEffect } from 'react';
import randomColor from 'randomcolor';
import './layout.css';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

const UserInitialsLogo: FC<{ name: string, lastName: string }> = ({ name, lastName }) => {
	const { setColors, backgroundColor, textColor } = useUserModeStore(state => state);
	// Separar el nombre completo en palabras
	const firstNameInitial = name?.charAt(0).toUpperCase() || '';
	const lastNameInitial = lastName?.charAt(0).toUpperCase() || '';

	const initials = `${firstNameInitial}${lastNameInitial}`;

	const hues = ['red', 'green', 'blue', 'purple', 'monochrome'];
	const selectedHue = hues[Math.floor(Math.random() * hues.length)];

	const backgroundColorDefined = randomColor({
		hue: selectedHue,
		luminosity: 'dark',
	});
	
	const colorTextDefined = randomColor({
		hue: selectedHue,
		luminosity: 'light',
	});

	useEffect(() => {
		if (backgroundColor == '' && textColor == '') {
			setColors(colorTextDefined, backgroundColorDefined);
		}
	}, []);


	return (
		<div className='logo-container' style={{ background: backgroundColor, color: textColor }}>
			<span style={{ userSelect: 'none' }}>{initials}</span>
		</div>
	);
};

export default UserInitialsLogo;
