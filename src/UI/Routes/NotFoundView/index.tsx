import { Card, Result } from 'antd';
import { FC } from 'react';

const App: FC = () => (
	<Card style={{ width: '100%', height: '100vh' }}>
		<Result
			status={'404'}
			title="404 Pagina no encontrada"
		/>
	</Card>
);

export default App;