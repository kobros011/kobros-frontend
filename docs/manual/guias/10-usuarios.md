# 10 · Usuarios

> Subtítulo: Guía paso a paso — Módulo de Usuarios
> Roles: Superusuario y administrador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 10`.

## Introducción

Usuarios permite crear las cuentas de la marca y asignarles un rol. Cada rol ve solo los módulos que le corresponden.

## Pasos

### 1 · Ver la lista de usuarios
> URL: `/srv1/home/usuarios`
> Preparar: Abrir Usuarios desde el menú.

Muestra el nombre, el tipo de usuario (administrador, socio o recaudador) y si está activo.

- Las pestañas separan los usuarios activos de los inactivos.

![Lista de usuarios](img/usuarios/01-lista.png)

### 2 · Crear un usuario
> URL: `/srv1/home/usuarios/crear`
> Preparar: Pulsar 'Nuevo Usuario'.

Se digitan los datos personales, el documento y la fecha de vinculación.

- Más abajo se elige el tipo de usuario y, para socios y recaudadores, las rutas a las que tendrán acceso.

![Formulario Crear usuario](img/usuarios/02-nuevo.png)

### 3 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/usuarios`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de usuarios](img/vistas/usuarios-tabla.jpg)
![Vista de tarjetas de usuarios](img/vistas/usuarios-tarjetas.jpg)

## Notas importantes

- Un recaudador solo ve las rutas que tiene asignadas.
