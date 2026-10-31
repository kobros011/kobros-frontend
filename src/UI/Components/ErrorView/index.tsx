import { Card, Result } from 'antd';
import { FC } from 'react';

interface Props {
	title?: string;
	subTitle?: string;
}

const App: FC<Props> = (props) => (
	<Card style={{ width: '100%', height: '100vh' }}>
		<Result
			status={'500'}
			title={props.title ?? '500 Error'}
			subTitle={props.subTitle}
		/>
	</Card>
);

export default App;