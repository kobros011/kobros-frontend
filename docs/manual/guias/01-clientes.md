# 01 · Clientes

> Subtítulo: Guía paso a paso — Módulo de Clientes
> Roles: Superusuario, administrador, socio y recaudador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 01`.

## Introducción

Clientes es el directorio de las personas a las que se les presta. Aquí se registran sus datos, se consulta su saldo a favor y se define el orden en que el recaudador los visita en cada ruta.

## Pasos

### 1 · Ver la lista de clientes
> URL: `/srv1/home/clientes`
> Preparar: Abrir Clientes desde la barra inferior.

Cada cliente aparece con su nombre, documento, dirección y la ruta en la que está, con su número de visita.

- Usa el buscador para encontrar por nombre o cédula; **Más filtros** acota por ruta.
- Las insignias muestran los créditos activos y el saldo a favor, con la moneda de la ruta.
- Las pestañas **Activos** e **Inactivos** separan a los clientes que ya no tienen movimiento.

![Lista de clientes en tarjetas](img/clientes/01-lista.png)

### 2 · Crear un cliente
> URL: `/srv1/home/clientes/crear`
> Preparar: Pulsar 'Nuevo Cliente'.

Se llenan los datos personales y de contacto del cliente.

- Obligatorios: nombre completo, documento, celular, dirección, barrio y fecha de vinculación.
- Más abajo se pueden agregar los datos del fiador y las referencias, que luego se ven al crear un crédito.
- Elige la ruta (o rutas) del cliente. Un mismo cliente puede estar en varias rutas.

![Formulario Crear cliente](img/clientes/02-nuevo.png)

### 3 · Ordenar la visita en una ruta
> URL: `/srv1/home/clientes/ordenar`
> Preparar: Pulsar 'Ordenar ruta' y elegir la Ruta Centro.

Define el orden en que el recaudador pasa por los clientes de una ruta.

- Arrastra los clientes, usa las flechas o toca el número para saltar a una posición.
- Los números se recalculan solos, sin huecos.
- Pulsa **Guardar orden** para aplicar el cambio; si sales con cambios sin guardar, la app pide confirmar.

![Reordenar la secuencia de visita](img/clientes/03-ordenar.png)

### 4 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/clientes`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de clientes](img/vistas/clientes-tabla.png)
![Vista de tarjetas de clientes](img/vistas/clientes-tarjetas.png)

## Notas importantes

- Un cliente con saldo pendiente no se puede quitar de una ruta.
- El saldo a favor es un solo valor por cliente y se muestra con la moneda de la ruta donde lo consultas.
