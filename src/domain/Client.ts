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

	static ToDto(domain: Client): Partial<ClientDto> {
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