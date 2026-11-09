import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { Button, Flex } from 'antd';
import  React, { FC } from 'react';

type ActionsButtonProps = {
	hiddenSaveAndExit?: boolean
	hiddenSave?: boolean
	isLoading?: boolean
	textAction: string
	onClickCancel: () => void
	onClickSave: () => void
	onClickSaveExit: () => void
};

const ActionsButton: FC<ActionsButtonProps> = ({ hiddenSave, hiddenSaveAndExit, isLoading, onClickCancel, onClickSave, onClickSaveExit, textAction = 'Crear' }) => {
	const isMobile = useUserModeStore(state => state.isMobile);

	return (
		<Flex gap={16} wrap="wrap" justify={isMobile ? 'center' : 'flex-end'} style={{ marginTop: 12 }}>
			<Button onClick={onClickCancel} loading={isLoading} type="primary" danger>Cancelar</Button>
			{!hiddenSave && <Button onClick={onClickSave} loading={isLoading} type="primary" ghost>{textAction}</Button>}
			{!hiddenSaveAndExit && <Button onClick={onClickSaveExit} loading={isLoading} type="primary">{textAction} y salir</Button>}
		</Flex>
	);
};

export default ActionsButton;