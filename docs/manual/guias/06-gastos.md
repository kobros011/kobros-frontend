# 06 · Gastos

> Subtítulo: Guía paso a paso — Módulo de Gastos
> Roles: Superusuario, administrador y recaudador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 06`.

## Introducción

Gastos registra el dinero que se gasta en la operación de la ruta (combustible, transporte). Los gastos del día descuentan automáticamente en el cierre de caja.

## Pasos

### 1 · Ver la lista de gastos
> URL: `/srv1/home/gastos`
> Preparar: Abrir Gastos desde el menú.

Cada gasto muestra su concepto, nombre, fecha, ruta y valor con la moneda.

- **Conceptos** administra las categorías de gasto.

![Lista de gastos](img/gastos/01-lista.png)

### 2 · Registrar un gasto
> URL: `/srv1/home/gastos/crear`
> Preparar: Pulsar 'Registrar'.

Se elige la fecha, la ruta, el valor, el nombre y el concepto del gasto.

- La moneda del valor es la de la ruta elegida.
- **Registrar** guarda y deja el formulario abierto; **Registrar y salir** guarda y vuelve a la lista.

![Formulario Registrar gasto](img/gastos/02-nuevo.png)

### 3 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/gastos`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de gastos](img/vistas/gastos-tabla.jpg)
![Vista de tarjetas de gastos](img/vistas/gastos-tarjetas.jpg)

## Notas importantes

- Un gasto registrado no se vuelve a contar cuando ya entró en un cierre.
