import { Button } from 'antd';
import FormFooter from './FormFooter';
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
	return (
		<FormFooter>
			<Button onClick={onClickCancel} loading={isLoading} type="primary" danger ghost>Cancelar</Button>
			{!hiddenSave && <Button onClick={onClickSave} loading={isLoading} type="primary" ghost>{textAction}</Button>}
			{!hiddenSaveAndExit && <Button onClick={onClickSaveExit} loading={isLoading} type="primary">{textAction} y salir</Button>}
		</FormFooter>
	);
};

export default ActionsButton;