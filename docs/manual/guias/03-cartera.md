# 03 · Cartera y mora

> Subtítulo: Guía paso a paso — Módulo de Cartera y mora
> Roles: Superusuario, administrador y socio
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 03`.

## Introducción

Cartera muestra cuánto hay por cobrar y qué créditos están atrasados. Cuando la marca usa más de una moneda, los totales se muestran por separado, nunca sumados.

## Pasos

### 1 · Ver la cartera activa
> URL: `/srv1/home/cartera`
> Preparar: Abrir Cartera desde la barra inferior.

Arriba aparece el total en cartera y el número de créditos, con un renglón por moneda.

- Debajo está la lista de créditos con valor, pagado, saldo y fecha de vencimiento.
- Con varias monedas aparece el selector **Todas · COP · USD** para ver una sola.
- **Más filtros** acota por ruta.

![Cartera activa con totales por moneda](img/cartera/01-cartera.png)

### 2 · Ver la cartera en mora
> URL: `/srv1/home/cartera/mora`
> Preparar: Pulsar la pestaña 'Cartera en mora'.

Solo muestra los créditos con cuotas vencidas, con su saldo en mora y los días de atraso.

- Desde cada fila se abre el crédito para registrar el cobro.

![Cartera en mora](img/cartera/02-mora.png)

### 3 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/cartera`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de cartera](img/vistas/cartera-tabla.jpg)
![Vista de tarjetas de cartera](img/vistas/cartera-tarjetas.jpg)

## Notas importantes

- El total de cada moneda se calcula por separado.
