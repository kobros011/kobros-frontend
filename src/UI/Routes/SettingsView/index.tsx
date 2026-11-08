import { Alert, App, Button, Card, Col, ColorPicker, Divider, Empty, Flex, Form, Input, Radio, Row, Select, Typography } from 'antd';
import type { ColorPickerProps } from 'antd';
import { ChangeEvent, FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BrandLogo, { BrandLogoInfo } from '@/UI/Components/BrandLogo';
import { DEFAULT_APP_NAME, LogoVariant, Settings, SettingsForm } from '@/domain/Settings';
import { queryKeySettings } from '@/constants/queryKeys';
import { TypeUser } from '@/constants/types';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { getListBrands } from '@/infrastructure/querys/Brand';
import { deleteLogo, getSettings, updateSettings, uploadLogo } from '@/infrastructure/querys/Settings';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { handleError } from '@/infrastructure/utils/handleError';

const { Title, Text } = Typography;

type Color = Parameters<NonNullable<ColorPickerProps['onChange']>>[0];
type SizeType = 'small' | 'middle';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

/** Luminancia relativa (0 = negro, 1 = blanco): avisa si el color no contrasta con el texto blanco de los botones. */
const getRelativeLuminance = (hex: string): number | null => {
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
	if (!match) return null;
	const [r, g, b] = [match[1], match[2], match[3]].map(part => parseInt(part, 16) / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Caja cuadrada/rectangular clickable y enfocable que sirve a la vez de input de archivo y de vista previa. */
const LogoPickerBox: FC<{
	width: number
	height: number
	disabled: boolean
	onActivate: () => void
	children: ReactNode
}> = ({ width, height, disabled, onActivate, children }) => (
	<div
		role="button"
		tabIndex={disabled ? -1 : 0}
		aria-label="Cambiar logo"
		aria-disabled={disabled}
		title={disabled ? undefined : 'Haz clic para elegir un logo'}
		onClick={disabled ? undefined : onActivate}
		onKeyDown={(event) => {
			if (disabled) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				onActivate();
			}
		}}
		style={{
			width,
			height,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			border: '1px dashed #8c8c8c',
			borderRadius: 8,
			padding: 8,
			cursor: disabled ? 'not-allowed' : 'pointer',
			opacity: disabled ? 0.5 : 1,
			overflow: 'hidden',
			flexShrink: 0,
			boxSizing: 'border-box',
		}}
	>
		{children}
	</div>
);

/**
 * Editor de UNA ranura de logo (full o mark), completamente independiente de la otra: su propio
 * input de archivo, su propia vista previa local y su propio Guardar/Cancelar/Quitar — el cliente
 * decide si sube una, otra o ambas.
 */
const LogoSlotEditor: FC<{
	variant: LogoVariant
	label: string
	boxWidth: number
	boxHeight: number
	previewHeight: number
	ownLogoUrl: string | null
	logoInfo: BrandLogoInfo
	canPick: boolean
	size: SizeType
	uploadMutation: ReturnType<typeof uploadLogo>
	deleteMutation: ReturnType<typeof deleteLogo>
	onSaved: (data: Settings, successMessage: string) => void
	onError: (error: unknown, fallbackMessage: string) => void
}> = ({ variant, label, boxWidth, boxHeight, previewHeight, ownLogoUrl, logoInfo, canPick, size, uploadMutation, deleteMutation, onSaved, onError }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

	useEffect(() => () => {
		if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
	}, [pendingPreviewUrl]);

	// Si cambia la marca cargada (selector del dev) o se recarga la configuración, descarta lo elegido sin guardar.
	useEffect(() => {
		setPendingFile(null);
		setPendingPreviewUrl((current) => {
			if (current) URL.revokeObjectURL(current);
			return null;
		});
	}, [logoInfo.loaded]);

	const openPicker = () => {
		if (!canPick || uploadMutation.isPending) return;
		fileInputRef.current?.click();
	};

	const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = ''; // permite volver a elegir el mismo archivo si se cancela y se reintenta
		if (!file) return;
		if (!LOGO_TYPES.includes(file.type)) {
			onError(null, 'Formato no permitido: usa PNG, JPG, WEBP o SVG');
			return;
		}
		if (file.size > MAX_LOGO_BYTES) {
			onError(null, 'El logo debe pesar menos de 5 MB');
			return;
		}
		setPendingPreviewUrl((current) => {
			if (current) URL.revokeObjectURL(current);
			return URL.createObjectURL(file);
		});
		setPendingFile(file);
	};

	const discardPending = () => {
		setPendingFile(null);
		setPendingPreviewUrl((current) => {
			if (current) URL.revokeObjectURL(current);
			return null;
		});
	};

	const onSave = () => {
		if (!pendingFile) return;
		uploadMutation.mutate({ file: pendingFile, variant }, {
			onSuccess: (data) => {
				onSaved(data, 'Logo guardado correctamente');
				discardPending();
			},
			onError: (error) => onError(error, 'No se pudo guardar el logo'),
		});
	};

	const onRemove = () => {
		deleteMutation.mutate(variant, {
			onSuccess: (data) => onSaved(data, 'Logo eliminado correctamente'),
			onError: (error) => onError(error, 'No se pudo eliminar el logo'),
		});
	};

	return (
		<Flex align="center" gap={16} wrap style={{ width: '100%' }}>
			<input
				ref={fileInputRef}
				type="file"
				accept={LOGO_TYPES.join(',')}
				style={{ display: 'none' }}
				onChange={onFileSelected}
			/>
			<LogoPickerBox width={boxWidth} height={boxHeight} disabled={!canPick} onActivate={openPicker}>
				{pendingPreviewUrl ? (
					<img
						src={pendingPreviewUrl}
						alt={`Vista previa del logo (${label})`}
						// minWidth/minHeight: 0 es necesario para que max-width/max-height funcionen dentro de un
						// flex container — por defecto un <img> no se encoge debajo de su tamaño intrínseco (bug
						// clásico de flexbox) y una foto grande se sale de la caja aunque tenga max-width: 100%.
						style={{ maxHeight: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, objectFit: 'contain', display: 'block' }}
					/>
				) : (
					<BrandLogo key={`${variant}-${logoInfo.logoFullUrl ?? ''}-${logoInfo.logoMarkUrl ?? ''}`} variant={variant} height={previewHeight} {...logoInfo} />
				)}
			</LogoPickerBox>

			<Flex vertical gap={4} style={{ minWidth: 160, flex: 1 }}>
				<Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>

				{pendingFile ? (
					<>
						<Text type="secondary" style={{ fontSize: 11, wordBreak: 'break-all' }}>
							{pendingFile.name} · {Math.max(1, Math.round(pendingFile.size / 1024))} KB
						</Text>
						<Flex gap={6} wrap>
							<Button type="primary" size={size} loading={uploadMutation.isPending} onClick={onSave}>
								Guardar logo
							</Button>
							<Button size={size} disabled={uploadMutation.isPending} onClick={discardPending}>
								Cancelar
							</Button>
						</Flex>
					</>
				) : (
					ownLogoUrl && (
						<Button size="small" danger type="text" loading={deleteMutation.isPending} onClick={onRemove} style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>
							Quitar logo
						</Button>
					)
				)}
			</Flex>
		</Flex>
	);
};

const toForm = (settings?: Settings): SettingsForm => ({
	brandName: settings?.brandName ?? '',
	brandCode: settings?.brandCode ?? '',
	contactEmail: settings?.contactEmail ?? '',
	contactPhone: settings?.contactPhone ?? '',
	appName: settings?.appName ?? '',
	primaryColor: settings?.primaryColor ?? null,
	numberFormatStyle: settings?.numberFormatStyle ?? 'comma-thousands',
	numberDecimals: settings?.numberDecimals ?? 2,
});

const SettingsView: FC = () => {
	const { notification } = App.useApp();
	const queryClient = useQueryClient();
	const isMobile = useUserModeStore(state => state.isMobile);
	const size: SizeType = isMobile ? 'small' : 'middle';

	const { typeUser, brandId: ownBrandId } = useUserStore(state => state.user);
	const isDev = normalizeTypeUser(typeUser) === TypeUser.dev;

	const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
	const brandId = isDev ? selectedBrand : ownBrandId || undefined;
	const canLoad = !isDev || !!selectedBrand;

	const { brands } = getListBrands({ active: true }, isDev);
	const { settings, isLoading } = getSettings(brandId, canLoad);

	const [form] = Form.useForm<SettingsForm>();
	const primaryColor = Form.useWatch('primaryColor', form);
	const [dirty, setDirty] = useState(false);

	const updateMutation = updateSettings(brandId);
	const uploadMutation = uploadLogo(brandId);
	const deleteMutation = deleteLogo(brandId);

	const brandOptions = useMemo(
		() => (brands ?? []).map(brand => ({ label: `${brand.name} (${brand.code})`, value: brand.id })),
		[brands],
	);

	useEffect(() => {
		form.setFieldsValue(toForm(canLoad ? settings : undefined));
		setDirty(false);
	}, [settings, canLoad]);

	const refresh = (data: Settings) => {
		queryClient.setQueryData([queryKeySettings.base, useUserStore.getState().user.id, brandId ?? 'own'], data);
		void queryClient.invalidateQueries({ queryKey: [queryKeySettings.base] });
	};

	const onSave = (values: SettingsForm) => {
		updateMutation.mutate(values, {
			onSuccess: (data) => {
				refresh(data);
				setDirty(false);
				notification.success({ message: 'Configuración guardada correctamente' });
			},
			onError: (error) => notification.error({ message: handleError(error, 'No se pudo guardar la configuración') }),
		});
	};

	const onLogoSaved = (data: Settings, successMessage: string) => {
		refresh(data);
		notification.success({ message: successMessage });
	};

	const onLogoError = (error: unknown, fallbackMessage: string) => {
		notification.error({ message: error ? handleError(error as Error, fallbackMessage) : fallbackMessage });
	};

	const canPickLogo = !!settings?.logoEnabled && !isLoading;

	const logoInfo: BrandLogoInfo = {
		logoFullUrl: settings?.logoFullUrl ?? null,
		logoFullWidth: settings?.logoFullWidth ?? null,
		logoFullHeight: settings?.logoFullHeight ?? null,
		logoFullTone: settings?.logoFullTone ?? null,
		logoMarkUrl: settings?.logoMarkUrl ?? null,
		logoMarkWidth: settings?.logoMarkWidth ?? null,
		logoMarkHeight: settings?.logoMarkHeight ?? null,
		logoMarkTone: settings?.logoMarkTone ?? null,
		appName: settings?.appName ?? '',
		loaded: !isLoading,
	};

	const luminance = primaryColor ? getRelativeLuminance(primaryColor) : null;
	const primaryTooLight = luminance !== null && luminance > 0.75;

	return (
		<Card>
			<div className="page-header">
				<Title level={2} style={{ marginBottom: 0 }}>Configuración</Title>
				<Text type="secondary">Personaliza la marca y el formato con el que se muestran los datos.</Text>
			</div>

			<Divider />

			{isDev && (
				<Flex vertical gap={4} style={{ marginBottom: 24, maxWidth: 420 }}>
					<Text strong>Marca a configurar</Text>
					<Select
						showSearch
						optionFilterProp="label"
						placeholder="Elige una marca"
						value={selectedBrand}
						onChange={setSelectedBrand}
						options={brandOptions}
						size={size}
					/>
				</Flex>
			)}

			{!canLoad ? (
				<Empty description="Elige una marca para ver y editar su configuración" />
			) : (
				<Form
					form={form}
					layout="vertical"
					disabled={isLoading}
					initialValues={toForm(settings)}
					onFinish={onSave}
					onValuesChange={() => setDirty(true)}
				>
					<Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
						<Col xs={24}>
							<Card type="inner" title="Información de la organización">
								<Row gutter={16}>
									<Col xs={24} md={12}>
										<Form.Item label="Nombre" name="brandName" rules={[{ required: true, whitespace: true, message: 'El nombre es requerido' }]}>
											<Input maxLength={80} />
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item
											label="Código"
											name="brandCode"
											rules={[{ required: true, whitespace: true, message: 'El código es requerido' }]}
											extra="Es el código de verificación que se pide al iniciar sesión."
										>
											<Input maxLength={20} />
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item
											label="Correo de contacto"
											name="contactEmail"
											rules={[{ type: 'email', message: 'Ingresa un correo válido' }]}
										>
											<Input type="email" placeholder="contacto@organizacion.com" maxLength={120} />
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item label="Teléfono" name="contactPhone">
											<Input inputMode="tel" placeholder="Teléfono de contacto" maxLength={40} />
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>

					<Row gutter={[24, 24]}>
						<Col xs={24} lg={12}>
							<Card type="inner" title="Marca (white label)">
								<Form.Item
									label="Nombre de la aplicación"
									name="appName"
									extra="Aparece en el título de la pestaña y, si no subes un logo propio, en vez del logo de Kobros."
								>
									<Input placeholder={DEFAULT_APP_NAME} maxLength={40} />
								</Form.Item>

								<Form.Item label="Color principal">
									<Flex align="center" gap={10} wrap>
										<Form.Item name="primaryColor" noStyle getValueFromEvent={(color: Color) => color.toHexString()}>
											<ColorPicker showText />
										</Form.Item>
										{primaryColor && (
											<Button
												size="small"
												onClick={() => {
													form.setFieldValue('primaryColor', null);
													setDirty(true);
												}}
											>
												Usar el verde de Kobros
											</Button>
										)}
									</Flex>
									{primaryTooLight && (
										<Alert
											style={{ marginTop: 8 }}
											type="warning"
											showIcon
											message="Este color es muy claro: el texto blanco de los botones puede verse difícil de leer sobre él."
										/>
									)}
								</Form.Item>

								<Form.Item label="Logo" extra="Haz clic en una caja para elegir su logo. Son independientes: puedes subir uno, el otro o ambos — PNG, JPG, WEBP o SVG, máximo 5 MB.">
									<Flex vertical gap={20}>
										<LogoSlotEditor
											variant="full"
											label="Menú expandido"
											boxWidth={96}
											boxHeight={64}
											previewHeight={44}
											ownLogoUrl={settings?.logoFullUrl ?? null}
											logoInfo={logoInfo}
											canPick={canPickLogo}
											size={size}
											uploadMutation={uploadMutation}
											deleteMutation={deleteMutation}
											onSaved={onLogoSaved}
											onError={onLogoError}
										/>
										<Divider style={{ margin: 0 }} />
										<LogoSlotEditor
											variant="mark"
											label="Menú colapsado"
											boxWidth={64}
											boxHeight={64}
											previewHeight={40}
											ownLogoUrl={settings?.logoMarkUrl ?? null}
											logoInfo={logoInfo}
											canPick={canPickLogo}
											size={size}
											uploadMutation={uploadMutation}
											deleteMutation={deleteMutation}
											onSaved={onLogoSaved}
											onError={onLogoError}
										/>
									</Flex>
									{settings && !settings.logoEnabled && (
										<Alert style={{ marginTop: 8 }} type="info" showIcon message="El almacenamiento de archivos no está configurado en el servidor: no se puede subir el logo." />
									)}
								</Form.Item>
							</Card>
						</Col>

						<Col xs={24} lg={12}>
							<Card type="inner" title="Formato de números">
								<Form.Item label="Separador de miles y decimales" name="numberFormatStyle">
									<Radio.Group
										optionType="button"
										options={[
											{ label: '1,234.56', value: 'comma-thousands' },
											{ label: '1.234,56', value: 'dot-thousands' },
										]}
									/>
								</Form.Item>

								<Form.Item
									label="Decimales por defecto"
									name="numberDecimals"
									extra="Una columna que ya define su propia cantidad de decimales no se ve afectada por este ajuste."
								>
									<Radio.Group
										optionType="button"
										options={[
											{ label: 'Sin decimales (1,235)', value: 0 },
											{ label: 'Dos decimales (1,234.57)', value: 2 },
										]}
									/>
								</Form.Item>
							</Card>
						</Col>
					</Row>

					<Flex justify="end" gap={8} style={{ marginTop: 24 }}>
						<Button
							danger
							size={size}
							disabled={!dirty}
							onClick={() => {
								form.setFieldsValue(toForm(settings));
								setDirty(false);
							}}
						>
							Cancelar
						</Button>
						<Button type="primary" htmlType="submit" size={size} disabled={!dirty} loading={updateMutation.isPending}>
							Guardar cambios
						</Button>
					</Flex>
				</Form>
			)}
		</Card>
	);
};

export default SettingsView;
