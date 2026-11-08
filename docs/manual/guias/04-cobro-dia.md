# 04 · Cobro del día

> Subtítulo: Guía paso a paso — Módulo de Cobro del día
> Roles: Superusuario, administrador, socio y recaudador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 04`.

## Introducción

Cobro del día es la pantalla de trabajo del recaudador: muestra qué clientes visitar en la ruta y permite registrar los pagos que recibe.

## Pasos

### 1 · Elegir la ruta y la fecha
> URL: `/srv1/home/cobro-dia`
> Preparar: Abrir el módulo sin elegir ruta.

Primero se elige la ruta y la fecha del cobro.

- Los recaudadores solo ven las rutas que tienen asignadas.

![Selección de ruta y fecha](img/cobro-dia/01-ruta.png)

### 2 · Ver los clientes a cobrar
> URL: `/srv1/home/cobro-dia`
> Preparar: Elegir la Ruta Centro.

Arriba se ven el valor pendiente, lo cobrado y la meta del día, en la moneda de la ruta.

- Debajo hay una tarjeta por cliente, en el orden de visita, con las etiquetas de cuotas pendientes y en mora.

![Clientes a cobrar en la ruta](img/cobro-dia/02-lista.png)

### 3 · Aplicar un pago
> URL: `/srv1/home/cobro-dia`
> Preparar: Desplegar el cliente con mora (Marta Lucía Rojas).

Cada cuota muestra su fecha, estado, valor y lo abonado.

- Escribe el valor recibido y pulsa **Aplicar**.
- Un abono parcial deja la cuota pendiente por la diferencia.
- El botón verde **Todo** cobra todas las cuotas del cliente de una vez.

![Cuota en mora con campo para abonar](img/cobro-dia/03-cuota.png)

## Notas importantes

- Los pagos de hoy entran automáticamente en el cierre de caja de la ruta.
