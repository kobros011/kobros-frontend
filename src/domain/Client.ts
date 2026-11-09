import { ClientContactDto, ClientDto, ClientRouteInfoDto } from '@/infrastructure/dto/ClientDto';
import { BaseDomain } from './BaseDomain';

export type ContactKind = 'fiador' | 'referencia';

export const CONTACT_KIND_LABEL: Record<ContactKind, string> = { fiador: 'Fiador', referencia: 'Referencia' };

/** Fiador o referencia del cliente (nombre y celular obligatorios). Puede haber varios de cada tipo. */
export interface ClientContact {
	id?: string
	kind: ContactKind
	name: string
	phone: string
	address?: string | null
}

/** Principal de cada tipo = el primero de su tipo; el resto son datos informativos. Fiadores antes que referencias. */
export const principalContacts = (contacts: ClientContact[] = []) => {
	const fiadores = contacts.filter(contact => contact.kind === 'fiador');
	const referencias = contacts.filter(contact => contact.kind === 'referencia');
	return {
		fiador: fiadores[0],
		referencia: referencias[0],
		others: [...fiadores.slice(1), ...referencias.slice(1)],
	};
};

/** Lugar del contacto dentro de su tipo (1 = principal). */
export const contactPosition = (contacts: ClientContact[], index: number) =>
	contacts.slice(0, index + 1).filter(contact => contact?.kind === contacts[index]?.kind).length;

/** Etiqueta de un contacto según su lugar en la lista: "Fiador", "Fiador 2", "Referencia 3"… */
export const contactLabel = (contacts: ClientContact[], index: number) => {
	const kind = contacts[index]?.kind;
	if (!kind) return '';
	const position = contactPosition(contacts, index);
	return position === 1 ? CONTACT_KIND_LABEL[kind] : `${CONTACT_KIND_LABEL[kind]} ${position}`;
};

/** Prioridad (1 = primero en visitarse) de un cliente en una de sus rutas. */
export interface ClientRouteInfo {
	routeId: string
	routeName: string
	clientRouteId: string
	order: number
	routeTotal: number
}

/** Ruta elegida al crear el cliente y su prioridad (vacía = al final de la ruta). */
export interface ClientRouteAssignment {
	routeId: string
	order?: number
}

/** Primer crédito que se crea junto con el cliente (valores tal como salen del formulario). */
export interface ClientLoanDraft {
	routeId: string
	valueCapital: string | number
	valueQuotaFixed: string | number
	agreedQuotas: string | number
	paymentMethod: string
	dateFirstQuota?: string
	fixedPaymentDay?: string | number
	valuePayment?: string | number
}

export interface Client extends BaseDomain {
	fullName: string
	idDocument: string
	currentAddress: string
	currentPhone: string
	currentMobile: string
	neighborhood: string
	linkingDate: string
	beak: number
	brandId: string
	routesIds?: string[]
	/** Solo al crear: rutas con su prioridad. */
	routeAssignments?: ClientRouteAssignment[]
	/** Solo al crear: crédito opcional que se crea con el cliente. */
	loan?: ClientLoanDraft
	/** Respuesta al crear con crédito. */
	loanNumber?: number
	routes?: ClientRouteInfo[]
	routeId?: string,
	routeName?: string,
	order?: number,
	contacts?: ClientContact[]
	activeLoansCount?: number
}


export class ClientModel {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	static ToDomain(DTO: ClientDto): Client {
		return {
			id: DTO.id,
			fullName: DTO.full_name,
			idDocument: DTO.id_document,
			currentPhone: DTO.current_phone,
			currentAddress: DTO.current_address,
			beak: Number(DTO.beak ?? 0),
			currentMobile: DTO.current_mobile,
			linkingDate: DTO.linking_date,
			neighborhood: DTO.neighborhood,
			brandId: DTO.brand_id,
			order: DTO.order,
			routeId: DTO.route_id,
			routeName: DTO.route_name,
			routesIds: DTO.routes_ids,
			routes: (DTO.routes ?? []).map((r: ClientRouteInfoDto) => ({
				routeId: r.route_id,
				routeName: r.route_name,
				clientRouteId: r.clientroute_id,
				order: r.order,
				routeTotal: r.route_total,
			})),
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
			contacts: (DTO.contacts ?? []).map((c: ClientContactDto) => ({
				id: c.id,
				kind: c.kind,
				name: c.name,
				phone: c.phone,
				address: c.address ?? null,
			})),
			activeLoansCount: DTO.active_loans_count ?? 0,
		};
	}

	/** Contactos para enviar: se descartan las filas totalmente vacías (las incompletas las rechaza la validación). */
	static contactsToDto(contacts: ClientContact[]) {
		return contacts
			.filter(contact => contact?.name?.trim() || contact?.phone?.trim() || contact?.address?.trim())
			.map(contact => ({ kind: contact.kind, name: (contact.name ?? '').trim(), phone: (contact.phone ?? '').trim(), address: contact.address?.trim() || null }));
	}

	private static loanToDto(loan: ClientLoanDraft): Record<string, unknown> {
		const num = (value: string | number | undefined) => (value === undefined || value === '' ? undefined : Number(String(value).replace(/,/g, '')));
		return {
			route_id: loan.routeId,
			value_capital: num(loan.valueCapital),
			value_quota_fixed: num(loan.valueQuotaFixed),
			agreed_quotas: num(loan.agreedQuotas),
			payment_method: loan.paymentMethod,
			date_first_quota: loan.dateFirstQuota,
			...(loan.fixedPaymentDay ? { fixed_payment_day: num(loan.fixedPaymentDay) } : {}),
			...(loan.valuePayment ? { value_payment: num(loan.valuePayment) } : {}),
		};
	}

	static ToDto(domain: Client): Omit<Partial<ClientDto>, 'routes'> & { routes?: { route_id: string, order?: number }[], loan?: Record<string, unknown> } {
		return {
			full_name: domain.fullName,
			id_document: domain.idDocument,
			current_address: domain.currentAddress ?? '',
			current_phone: domain.currentPhone ?? '',
			current_mobile: domain.currentMobile ?? '',
			neighborhood: domain.neighborhood ?? '',
			linking_date: domain.linkingDate,
			brand_id: domain.brandId,
			...(domain.routesIds ? { routes_ids: domain.routesIds } : {}),
			...(domain.routeAssignments ? { routes: domain.routeAssignments.map(item => ({ route_id: item.routeId, ...(item.order ? { order: item.order } : {}) })) } : {}),
			...(domain.loan ? { loan: ClientModel.loanToDto(domain.loan) } : {}),
			...(domain.id ? { id: domain.id } : {}),
			...(domain.contacts ? { contacts: ClientModel.contactsToDto(domain.contacts) } : {}),
		};
	}
}