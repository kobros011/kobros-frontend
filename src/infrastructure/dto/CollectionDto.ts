import { PaymentDto } from './PaymentDto';

export interface CollectionTodayDto extends PaymentDto {
	order: number;
	id_document: string;
	client_address: string | null;
	client_mobile: string | null;
	client_beak: number;
	loan_number: number;
}
