import { Payment } from './Payment';
import { CollectionTodayDto } from '@/infrastructure/dto/CollectionDto';

export interface Collection extends Payment {
	order: number;
	idDocument: string;
	clientAddress: string | null;
	clientMobile: string | null;
	loanNumber: number;
}

export class CollectionModel {
	static ToDomain(dto: CollectionTodayDto): Collection {
		return {
			id: dto.id,
			payDate: dto.pay_date,
			paymentDate: dto.payment_date,
			quotaNumber: dto.quota_number,
			value: dto.value,
			creditValue: dto.credit_value,
			status: dto.status,
			loanId: dto.loan_id,
			pendingQuotas: dto.pending_quotas,
			canceledQuotas: dto.canceled_quotas,
			agreedQuotas: dto.agreed_quotas,
			totalDefault: dto.total_default,
			valueCapital: dto.value_capital,
			valueQuotaFixed: dto.value_quota_fixed,
			applied: dto.applied,
			paymentMethod: dto.payment_method,
			valueTotalLoan: dto.value_total_loan,
			clientId: dto.client_id,
			routeId: dto.route_id,
			clientFullName: dto.client_full_name,
			active: dto.active,
			createdAt: dto.created_at,
			updatedAt: dto.updated_at,
			order: dto.order,
			idDocument: dto.id_document,
			clientAddress: dto.client_address,
			clientMobile: dto.client_mobile,
			loanNumber: dto.loan_number,
		};
	}
}
