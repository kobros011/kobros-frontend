import { FC } from 'react';
import FormSection from './FormSection';
import { ClientFormConfig, CONTACT_SECTION_LABELS, ContactSectionKind } from '@/domain/Settings';
import ConfigRow from './ConfigRow';
import { normalizeFlags } from './helpers';

const SECTION_DESCRIPTIONS: Record<ContactSectionKind, string> = {
	fiador: 'Personas que respaldan al cliente',
	referencia: 'Contactos familiares o comerciales secundarios',
};

interface SectionsCardProps {
	draft: ClientFormConfig
	onChange: (next: ClientFormConfig) => void
}

/** Fiadores y referencias. "Requerido" significa al menos uno de ese tipo; "Visible" muestra u oculta la sección. */
export const SectionsCard: FC<SectionsCardProps> = ({ draft, onChange }) => {
	const setSection = (kind: ContactSectionKind, patch: { required?: boolean; visible?: boolean }) => {
		const next = normalizeFlags({ ...draft.sections[kind], ...patch });
		onChange({ ...draft, sections: { ...draft.sections, [kind]: next } });
	};

	return (
		<FormSection>
			{(Object.keys(CONTACT_SECTION_LABELS) as ContactSectionKind[]).map(kind => (
				<ConfigRow
					key={kind}
					title={CONTACT_SECTION_LABELS[kind]}
					description={SECTION_DESCRIPTIONS[kind]}
					required={draft.sections[kind].required}
					visible={draft.sections[kind].visible}
					onRequiredChange={required => setSection(kind, { required })}
					onVisibleChange={visible => setSection(kind, { visible })}
				/>
			))}
		</FormSection>
	);
};

export default SectionsCard;
