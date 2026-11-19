import FormFooter from '@/UI/Components/FormFooter';
import { FC, useEffect, useRef, useState } from 'react';
import useUnsavedChangesGuard from '@/infrastructure/hooks/useUnsavedChangesGuard';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { CheckOutlined, SettingOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Empty, Flex, Result, Space } from 'antd';
import ResponsiveCard from '@/UI/Components/ResponsiveCard';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useSettingsBrandStore from '@/infrastructure/context/SettingsBrandStore';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { TypeUser } from '@/constants/types';
import routePaths from '@/constants/routePaths';
import { getPermission } from '@/infrastructure/utils/Permissions';
import PageTitle from '@/UI/Components/PageTitle';
import SettingsTabs from '../SettingsTabs';
import ModuleSelector, { ConfigModule, MODULE_KEY } from './ModuleSelector';
import useFormsDraft from './useFormsDraft';
import FieldsTable from './FieldsTable';
import SectionsCard from './SectionsCard';
import CustomFieldsCard from './CustomFieldsCard';
import CustomFieldModal, { CustomFieldEditorState } from './CustomFieldModal';
import DefaultFieldsDrawer from './DefaultFieldsDrawer';
import { DefaultFieldPreset, presetToDraft } from './defaultFields';
import { checkLimits, MODULE_COPY } from './helpers';
import { CustomFieldDef, DEFAULT_FORM_CONFIG, FormConfig } from '@/domain/Settings';
import { queryKeySettings } from '@/constants/queryKeys';
import { getSettings, updateFormConfig } from '@/infrastructure/querys/Settings';
import { handleError } from '@/infrastructure/utils/handleError';

/** Pantalla "Configuración › Formularios". Solo dev y super (`hasManageSettings`). */
const FormsConfigView: FC = () => {
	const { tab } = useParams();
	const [module, setModule] = useState<ConfigModule>('clientes');
	const moduleKey = MODULE_KEY[module];
	const activeTab = tab === 'personalizados' ? 'personalizados' : 'obligatorios';
	const typeUser = useUserStore(state => state.user.typeUser);
	const { hasManageSettings } = getPermission(typeUser);
	const isMobile = useUserModeStore(state => state.isMobile);
	const hasBrandLogo = useAppSettingsStore(state => !!(state.logoFullUrl || state.logoMarkUrl));
	const showCardTitle = !isMobile || hasBrandLogo;
	const userId = useUserStore(state => state.user.id);
	const isDev = normalizeTypeUser(typeUser) === TypeUser.dev;
	const navigate = useNavigate();
	// El desarrollador configura la marca elegida en «General»; los demás perfiles, la suya (ya cargada en el layout).
	const selectedBrand = useSettingsBrandStore(state => state.brandId);
	const brandId = isDev ? selectedBrand : undefined;
	const { settings: brandSettings } = getSettings(brandId, isDev && !!selectedBrand);
	const ownConfig = useAppSettingsStore(state => state.formConfig);
	const savedConfig: FormConfig = isDev ? (brandSettings?.formConfig ?? DEFAULT_FORM_CONFIG) : ownConfig;
	const savedVersion = savedConfig.version;
	const savedClients = savedConfig.clients;
	const latest = useRef(savedConfig);
	latest.current = savedConfig;
	const { draft, setDraft, dirty, discard, markSaved, markCustomSaved } = useFormsDraft(savedClients);
	// Lista de campos personalizados del módulo elegido: Clientes pasa por el borrador; los demás se guardan al instante.
	const customList: CustomFieldDef[] = moduleKey === 'clients' ? draft.custom : savedConfig[moduleKey].custom;
	useUnsavedChangesGuard(dirty);
	const queryClient = useQueryClient();
	const saveMutation = updateFormConfig(brandId);
	const [conflict, setConflict] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [editor, setEditor] = useState<CustomFieldEditorState | null>(null);
	const [libraryOpen, setLibraryOpen] = useState(false);
	const { notification } = App.useApp();

	// Si hay cambios sin guardar, el navegador pide confirmación antes de cerrar o recargar la pestaña.
	useEffect(() => {
		if (!dirty) return undefined;
		const warn = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = '';
		};
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [dirty]);

	/** Deja la respuesta del servidor como la configuración vigente: la propia (store) o la de la marca elegida (consulta). */
	const applySaved = (data: { formConfig: FormConfig }) => {
		if (isDev) queryClient.setQueryData([queryKeySettings.base, userId, brandId ?? 'own'], (current: unknown) => ({ ...(current as object), ...data }));
		else useAppSettingsStore.getState().setFormConfig(data.formConfig);
		void queryClient.invalidateQueries({ queryKey: [queryKeySettings.base] });
	};

	const onSave = () => {
		setSaveError(null);
		saveMutation.mutate({ config: { ...savedConfig, clients: draft }, expectedVersion: savedVersion }, {
			onSuccess: (data) => {
				const next = data.formConfig;
				markSaved(next.clients);
				applySaved(data);
				notification.success({ message: `Configuración guardada · Versión ${next.version}` });
			},
			onError: (error) => {
				if ((error as AxiosError).response?.status === 409) {
					setConflict(true);
					return;
				}
				setSaveError(handleError(error, 'No se pudo guardar la configuración'));
			},
		});
	};

	/**
	 * Los campos personalizados se guardan al instante (crear, editar, archivar, reordenar): se envía la configuración
	 * ya guardada con la lista nueva, sin arrastrar lo que se esté editando en «Campos obligatorios».
	 */
	const persistCustom = (custom: CustomFieldDef[], onDone?: () => void) => {
		const current = latest.current;
		const isClients = moduleKey === 'clients';
		const previous = isClients ? current.clients.custom : current[moduleKey].custom;
		setSaveError(null);
		if (isClients) setDraft(draftNow => ({ ...draftNow, custom }));
		const config: FormConfig = isClients
			? { ...current, clients: { ...current.clients, custom } }
			: { ...current, [moduleKey]: { custom } };
		saveMutation.mutate({ config, expectedVersion: current.version }, {
			onSuccess: (data) => {
				const next = data.formConfig;
				applySaved(data);
				if (isClients) markCustomSaved(next.clients.custom);
				onDone?.();
			},
			onError: (error) => {
				if (isClients) setDraft(draftNow => ({ ...draftNow, custom: previous }));
				if ((error as AxiosError).response?.status === 409) {
					setConflict(true);
					return;
				}
				notification.error({ message: handleError(error, 'No se pudo guardar el cambio') });
			},
		});
	};

	const saveField = (field: CustomFieldDef) => {
		const isNew = editor?.mode === 'create';
		const next = isNew
			? [...customList, field]
			: customList.map(item => (item.key === field.key ? field : item));
		const limit = checkLimits(next);
		if (limit) {
			notification.error({ message: limit });
			return;
		}
		persistCustom(next, () => setEditor(null));
	};

	if (!hasManageSettings) {
		return (
			<ResponsiveCard>
				<Result status="403" title="No tienes permiso para configurar formularios" subTitle="Solo el administrador de la plataforma y el super usuario pueden cambiar esta configuración." />
			</ResponsiveCard>
		);
	}

	if (isDev && !selectedBrand) {
		return (
			<Card className="kb-form-card" title={showCardTitle ? <PageTitle icon={<SettingOutlined />} title="Configuración" /> : undefined}>
				<SettingsTabs active={activeTab} />
				<Empty description="Elige una marca en General para configurar sus campos">
					<Button type="primary" onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}`)}>Ir a General</Button>
				</Empty>
			</Card>
		);
	}

	return (
		<Card
			className="kb-form-card"
			title={showCardTitle ? <PageTitle icon={<SettingOutlined />} title="Configuración" /> : undefined}
		>
			<SettingsTabs active={activeTab} />
			<Flex vertical gap={16}>
				{conflict && (
					<Alert
						type="warning"
						showIcon
						message="Conflicto de versión detectado"
						description="La configuración cambió mientras la editabas. Recarga la página para ver la versión más reciente y vuelve a aplicar tus cambios."
						action={(
							<Space direction="vertical" size={8}>
								<Button size="small" type="primary" onClick={() => window.location.reload()}>Recargar</Button>
								<Button size="small" onClick={() => setConflict(false)}>Ver mis cambios</Button>
							</Space>
						)}
					/>
				)}
				{saveError && (
					<Alert type="error" showIcon closable onClose={() => setSaveError(null)} message={saveError} />
				)}

				<ModuleSelector value={module} onChange={setModule} />

				{activeTab === 'obligatorios' && module !== 'clientes' ? (
					<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`Los campos de ${MODULE_COPY[moduleKey].plural} son fijos: solo puedes agregar campos personalizados`} />
				) : activeTab === 'obligatorios' ? (
					<>
						<FieldsTable draft={draft} onChange={setDraft} />
						<SectionsCard draft={draft} onChange={setDraft} />
					</>
				) : (
					<CustomFieldsCard
						custom={customList}
						onChange={persistCustom}
						busy={saveMutation.isPending}
						plural={MODULE_COPY[moduleKey].plural}
						onCreate={() => setEditor({ mode: 'create' })}
						onAddDefault={module === 'clientes' ? () => setLibraryOpen(true) : undefined}
						onEdit={key => { const field = customList.find(item => item.key === key); if (field) setEditor({ mode: 'edit', field }); }}
					/>
				)}
			</Flex>

			{activeTab === 'obligatorios' && module === 'clientes' && (
				<FormFooter>
					<Button type="primary" danger ghost disabled={!dirty || saveMutation.isPending} onClick={discard}>
						Cancelar
					</Button>
					<Button type="primary" icon={<CheckOutlined />} disabled={!dirty || conflict} loading={saveMutation.isPending} onClick={onSave}>
						Guardar cambios
					</Button>
				</FormFooter>
			)}

			<DefaultFieldsDrawer
				open={libraryOpen}
				existing={customList}
				onClose={() => setLibraryOpen(false)}
				onAdd={(preset: DefaultFieldPreset) => { setLibraryOpen(false); setEditor({ mode: 'create', preset: presetToDraft(preset) }); }}
				onCreate={() => { setLibraryOpen(false); setEditor({ mode: 'create' }); }}
			/>
			<CustomFieldModal module={moduleKey} state={editor} existing={customList} onSave={saveField} onClose={() => setEditor(null)} saving={saveMutation.isPending} />
		</Card>
	);
};

export default FormsConfigView;
