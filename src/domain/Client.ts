import { ClientDto, ClientReferenceDto, ClientRouteInfoDto } from '@/infrastructure/dto/ClientDto';
import { BaseDomain } from './BaseDomain';

export interface ClientReference {
	id?: string
	name: string
	address?: string
	phone?: string
}

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
	guarantorName?: string | null
	guarantorCedula?: string | null
	guarantorPhone?: string | null
	guarantorAddress?: string | null
	references?: ClientReference[]
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
			guarantorName: DTO.guarantor_name ?? null,
			guarantorCedula: DTO.guarantor_cedula ?? null,
			guarantorPhone: DTO.guarantor_phone ?? null,
			guarantorAddress: DTO.guarantor_address ?? null,
			references: (DTO.references ?? []).map((r: ClientReferenceDto) => ({
				id: r.id,
				name: r.name,
				address: r.address,
				phone: r.phone,
			})),
			activeLoansCount: DTO.active_loans_count ?? 0,
		};
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
			guarantor_name: domain.guarantorName ?? undefined,
			guarantor_cedula: domain.guarantorCedula ?? undefined,
			guarantor_phone: domain.guarantorPhone ?? undefined,
			guarantor_address: domain.guarantorAddress ?? undefined,
			references: domain.references?.filter(r => r?.name || r?.phone || r?.address).map(r => ({
				name: r.name,
				address: r.address,
				phone: r.phone,
			})),
		};
	}
}