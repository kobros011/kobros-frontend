import { Skeleton, theme } from 'antd';
import { FC, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Icon from '@assets/icon.png';
import Logo from '@assets/logo-transparent.png';
import { DEFAULT_APP_NAME } from '@/domain/Settings';
import { queryKeySettings } from '@/constants/queryKeys';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

type LogoTone = 'dark' | 'light' | 'mixed' | null;

export interface BrandLogoInfo {
	// Logo del menú expandido / login.
	logoFullUrl: string | null
	logoFullWidth: number | null
	logoFullHeight: number | null
	logoFullTone: LogoTone
	// Logo (o ícono) del menú colapsado — independiente del anterior; el cliente decide si lo sube.
	logoMarkUrl: string | null
	logoMarkWidth: number | null
	logoMarkHeight: number | null
	logoMarkTone: LogoTone
	appName: string
	/** true una vez que se resolvió la configuración de la marca (con éxito o error). */
	loaded: boolean
}

interface BrandLogoProps extends BrandLogoInfo {
	/** 'full': logo completo (header móvil, sider expandido). 'mark': espacio angosto del sider colapsado. */
	variant: 'full' | 'mark'
	/** Alto de la caja en px; el ancho se calcula según la proporción del logo. */
	height: number
}

// Si no se subió un logo para "mark" y se usa "full" como respaldo: por encima de esta proporción
// (ancho/alto) el logo no cabe bien en el espacio angosto, así que se reemplaza por un monograma.
const WIDE_RATIO_THRESHOLD = 1.6;

const BrandLogo: FC<BrandLogoProps> = ({
	variant, height, appName, loaded,
	logoFullUrl, logoFullWidth, logoFullHeight, logoFullTone,
	logoMarkUrl, logoMarkTone,
}) => {
	const { token } = theme.useToken();
	const darkMode = useUserModeStore(state => state.darkMode);
	const queryClient = useQueryClient();
	const [failed, setFailed] = useState(false);

	const label = appName || DEFAULT_APP_NAME;

	// Resuelve qué imagen mostrar: la propia de la ranura o, en "mark" sin subir, la de "full" como respaldo.
	const usingMarkOwnLogo = variant === 'mark' && !!logoMarkUrl;
	const fallingBackToFull = variant === 'mark' && !logoMarkUrl && !!logoFullUrl;
	const activeUrl = variant === 'full' ? logoFullUrl : (usingMarkOwnLogo ? logoMarkUrl : logoFullUrl);
	const activeTone = variant === 'full' ? logoFullTone : (usingMarkOwnLogo ? logoMarkTone : logoFullTone);
	const fallbackRatio = fallingBackToFull && logoFullWidth && logoFullHeight ? logoFullWidth / logoFullHeight : null;
	const useMonogram = fallingBackToFull && !failed && fallbackRatio !== null && fallbackRatio > WIDE_RATIO_THRESHOLD;

	if (!loaded) {
		return <Skeleton.Avatar active shape="square" size={height} style={{ width: height * (variant === 'full' ? 3 : 1), height, borderRadius: 6 }} />;
	}

	if (useMonogram) {
		return (
			<div
				aria-label={label}
				role="img"
				style={{
					width: height,
					height,
					borderRadius: 6,
					background: token.colorPrimary,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontWeight: 600,
					fontSize: height * 0.45,
					lineHeight: 1,
					flexShrink: 0,
				}}
			>
				{label.trim().charAt(0).toUpperCase() || 'K'}
			</div>
		);
	}

	const src = activeUrl && !failed ? activeUrl : (variant === 'full' ? Logo : Icon);
	// Un logo con fondo transparente puede quedar invisible si su tono choca con el tema (oscuro en dark, claro en light).
	const needsPlate = !!activeUrl && !failed && activeTone && activeTone !== 'mixed' && (
		(darkMode && activeTone === 'dark') || (!darkMode && activeTone === 'light')
	);
	const maxWidth = variant === 'full' ? height * 4 : height * 1.6;

	return (
		<div
			style={{
				height,
				maxWidth,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: needsPlate ? Math.round(height * 0.12) : 0,
				borderRadius: 6,
				background: needsPlate ? (darkMode ? '#f5f5f5' : '#1f1f1f') : 'transparent',
				boxSizing: 'border-box',
				overflow: 'hidden',
				flexShrink: 0,
			}}
		>
			<img
				src={src}
				alt={label}
				// minWidth/minHeight: 0 evita el bug de flexbox donde un <img> no se encoge debajo de su
				// tamaño intrínseco aunque tenga max-width/max-height: 100% (una imagen grande se saldría de la caja).
				style={{ maxHeight: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, objectFit: 'contain', display: 'block' }}
				onError={() => {
					if (failed) return;
					setFailed(true);
					// La URL firmada (SAS) pudo vencer: refresca la configuración para obtener una nueva.
					void queryClient.invalidateQueries({ queryKey: [queryKeySettings.base] });
				}}
			/>
		</div>
	);
};

export default BrandLogo;
