export abstract class ImplementationBase {
	protected readonly baseUrl: string = '';

	buildUrl({ id = '', method = '' }: { id?: string | number; method?: string }) {
		return `${this.baseUrl}${id ? `${id}/` : ''}${method ? `${method}/` : ''}`;
	}
}