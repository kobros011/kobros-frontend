# 07 · Rutas

> Subtítulo: Guía paso a paso — Módulo de Rutas
> Roles: Superusuario y administrador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 07`.

## Introducción

Rutas permite crear y administrar las rutas de cobro, su moneda y su caja. Cada ruta tiene una sola moneda.

## Pasos

### 1 · Ver la lista de rutas
> URL: `/srv1/home/rutas`
> Preparar: Abrir Rutas desde el menú.

Muestra el nombre, la moneda, el valor inicial y la fecha de apertura de cada ruta.

- Las rutas inactivas están en su propia pestaña.

![Lista de rutas con su moneda](img/rutas/01-lista.png)

### 2 · Crear una ruta
> URL: `/srv1/home/rutas/crear`
> Preparar: Pulsar 'Nueva Ruta'.

Se escribe el nombre, el valor inicial, los gastos iniciales, la fecha de apertura y los usuarios con acceso.

- La **moneda** se elige solo si la marca tiene más de una; con una sola se usa la de la marca.
- Una vez la ruta tiene créditos, gastos, cierres o movimientos ya no se puede cambiar su moneda.

![Formulario Crear ruta](img/rutas/02-nueva.png)

### 3 · Revisar la caja de la ruta
> URL: `/srv1/home/rutas/:id/caja`
> Preparar: Abrir la Ruta Centro (ojo), entrar a 'Caja' y desplegar 'Ver desglose'.

Muestra el saldo de caja, los ingresos y retiros acumulados, el valor inicial, los cobros, los gastos y los préstamos desembolsados.

- Desde aquí se registra el ingreso o retiro de dinero de la ruta con su motivo.

![Caja de la ruta con su desglose](img/rutas/03-caja.png)

### 4 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/rutas`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de rutas](img/vistas/rutas-tabla.jpg)
![Vista de tarjetas de rutas](img/vistas/rutas-tarjetas.jpg)

## Notas importantes

- El saldo de caja puede quedar negativo si se entregan más créditos que la base disponible; registra un ingreso para corregirlo.
