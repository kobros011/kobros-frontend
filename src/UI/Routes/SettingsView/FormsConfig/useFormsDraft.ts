import { useCallback, useEffect, useRef, useState } from 'react';
import { ClientFormConfig, CustomFieldDef } from '@/domain/Settings';
import { sameClientConfig } from './helpers';

/**
 * Borrador local de la configuración de formularios. Se compara con la configuración guardada para saber si hay
 * cambios sin guardar; "Descartar" vuelve al original. El guardado (con la versión) se conecta en T9.
 */
export const useFormsDraft = (saved: ClientFormConfig) => {
	const [original, setOriginal] = useState<ClientFormConfig>(saved);
	const [draft, setDraft] = useState<ClientFormConfig>(saved);

	const dirty = !sameClientConfig(draft, original);

	// La configuración guardada puede llegar o cambiar después de montar (otra marca, carga tardía): si no hay cambios
	// sin guardar, el borrador la sigue; si los hay, se respetan.
	const dirtyRef = useRef(dirty);
	dirtyRef.current = dirty;
	useEffect(() => {
		if (dirtyRef.current) return;
		setOriginal(saved);
		setDraft(saved);
	}, [saved]);

	const discard = useCallback(() => setDraft(original), [original]);

	/** Tras guardar con éxito, el borrador pasa a ser el original. */
	const markSaved = useCallback((next: ClientFormConfig) => {
		setOriginal(next);
		setDraft(next);
	}, []);

	/**
	 * Los campos personalizados se guardan al instante desde su drawer: solo ellos pasan a ser el original, sin tocar
	 * lo que se esté editando en «Campos obligatorios».
	 */
	const markCustomSaved = useCallback((custom: CustomFieldDef[]) => {
		setOriginal(current => ({ ...current, custom }));
		setDraft(current => ({ ...current, custom }));
	}, []);

	return { draft, setDraft, dirty, discard, markSaved, markCustomSaved };
};

export default useFormsDraft;
