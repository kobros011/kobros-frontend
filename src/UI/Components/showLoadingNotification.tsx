import { Flex, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { type NotificationInstance, type ArgsProps } from 'antd/es/notification/interface';

interface LoadingNotificationConfig extends Pick<ArgsProps, 'key' | 'description'> {
	notification: NotificationInstance;
}

/**
 * Muestra una notificación de carga que puede permanecer abierta hasta por 1 minuto.
 * Si no se proporciona una 'key', se genera una automáticamente.
 * 
 * Nota: La 'key' generada o proporcionada permite actualizar la notificación de carga al asignarla como valor de la propiedad 'key' en
 * el objeto de configuración de otra notificación, o destruirla usando notification.destroy(key).
 * 
 * @param notification Instancia de notificación de Ant Design.
 * @param key (Opcional) Clave única para identificar la notificación.
 * @param description (Opcional) Descripción de la notificación.
 * @returns (key) La clave única de la notificación generada o proporcionada.
 */
export const showLoadingNotification = ({ notification, key, description = 'Cargando' }: LoadingNotificationConfig) => {
	let notificationKey = key;

	if (!notificationKey) {
		const timestamp = Date.now();
		notificationKey = `loadingNotification${timestamp}`;
	}

	notification.open({
		key: notificationKey,
		message: (
			<Flex justify='center'>
				<Spin indicator={<LoadingOutlined />} />
			</Flex>
		),
		description: <Flex justify='center'>{description}</Flex>,
		duration: 60, // Mantiene la notificación abierta por 1 minuto
	});

	return notificationKey;
};