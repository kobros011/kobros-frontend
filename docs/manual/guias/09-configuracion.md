# 09 · Configuración

> Subtítulo: Guía paso a paso — Módulo de Configuración
> Roles: Superusuario y administrador de la marca
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 09`.

## Introducción

Configuración personaliza la marca: sus datos de contacto, su identidad visual (marca blanca), las monedas y el formato con el que se muestran los números. También explica cómo cambiar las vistas de tabla y tarjetas y las columnas en todos los módulos.

## Pasos

### 1 · Información de la organización
> URL: `/srv1/home/configuracion`
> Preparar: Abrir Configuración.

Se editan el nombre de la marca, el correo y el teléfono de contacto.

- El **código** es el que se pide al iniciar sesión.
- Pulsa **Guardar cambios** al final de la página; **Cancelar** descarta los cambios.

![Información de la organización](img/configuracion/01-organizacion.png)

### 2 · Marca blanca: nombre, color y logo
> URL: `/srv1/home/configuracion`
> Preparar: Bajar hasta la tarjeta 'Marca (white label)'.

La marca blanca permite que la aplicación se vea con la identidad de cada cliente en lugar de la de la plataforma.

- **Nombre de la aplicación:** aparece en el título de la pestaña del navegador y acompaña al logo.
- **Color principal:** color de los botones y resaltes de toda la aplicación.
- **Logo:** hay dos cajas independientes, una para el menú expandido y otra para el menú colapsado. Haz clic en una caja para elegir la imagen (PNG, JPG, WEBP o SVG, máximo 5 MB); puedes subir una, la otra o ambas.
- Después de guardar, el logo y el color se ven en todo el menú y en el encabezado de cada pantalla.

![Nombre de la aplicación y color principal](img/configuracion/04-marca-blanca.jpg)
![Logos para el menú expandido y colapsado](img/configuracion/05-logos.jpg)

### 3 · Monedas de la marca
> URL: `/srv1/home/configuracion`
> Preparar: Bajar hasta la tarjeta 'Monedas'.

Se eligen una o varias monedas de la lista; la primera es la principal.

- Si hay más de una, cada ruta escoge la suya al crearse.
- No se puede quitar una moneda que alguna ruta esté usando.

![Monedas de la marca](img/configuracion/02-monedas.png)

### 4 · Formato de números
> URL: `/srv1/home/configuracion`
> Preparar: Bajar hasta 'Formato de números'.

Define cómo se escriben los miles y los decimales: 1,234.56 o 1.234,56.

- También se elige cuántos decimales se muestran por defecto.
- Todos los valores con moneda de la aplicación siguen este formato.

![Formato de números](img/configuracion/03-formato.png)

### 5 · Vistas de tabla, tarjetas y columnas en cada módulo
> URL: `/srv1/home/<módulo>`
> Preparar: Mostrar tabla, tarjetas y el panel de columnas de Clientes, Créditos, Cartera, Gastos, Rutas y Usuarios.

Los listados de Clientes, Créditos, Cartera, Gastos, Rutas y Usuarios se pueden ver de dos maneras, y cada usuario decide cómo.

- **Cambiar de vista:** usa el icono de cuadrícula para la tabla o el icono de lista para las tarjetas.
- **Elegir columnas (tabla):** el botón **Columnas** abre un panel; marca las que quieres ver y arrastra los puntos para ordenarlas.
- **Elegir datos de la tarjeta:** en la vista de tarjetas el botón **Tarjeta** abre el mismo panel para los datos de cada tarjeta.
- **Mostrar todo / Ocultar todo:** cambian todas las opciones de una vez.
- Cada módulo guarda su propia vista y sus propias columnas en el dispositivo.

![Panel Columnas (tabla)](img/vistas/clientes-columnas.png)
![Panel Tarjeta (tarjetas)](img/vistas/clientes-ajustes-tarjeta.png)

### 6 · Clientes, créditos y cartera: tabla y tarjetas
> URL: `/srv1/home/clientes`
> Preparar: Mostrar las vistas de tabla y tarjetas de estos tres módulos.

Así se ven los tres módulos con cada vista. La tabla muestra más columnas a la vez; las tarjetas muestran los datos principales sin desplazarse hacia los lados.

![Clientes · tabla](img/vistas/clientes-tabla.png)
![Clientes · tarjetas](img/vistas/clientes-tarjetas.png)
![Créditos · tabla](img/vistas/creditos-tabla.png)
![Créditos · tarjetas](img/vistas/creditos-tarjetas.jpg)
![Cartera · tabla](img/vistas/cartera-tabla.jpg)
![Cartera · tarjetas](img/vistas/cartera-tarjetas.jpg)

### 7 · Gastos, rutas y usuarios: tabla y tarjetas
> URL: `/srv1/home/gastos`
> Preparar: Mostrar las vistas de tabla y tarjetas de estos tres módulos.

Los otros tres módulos funcionan igual. En las rutas, la columna **Moneda** y el valor inicial muestran la moneda de cada ruta.

![Gastos · tabla](img/vistas/gastos-tabla.jpg)
![Gastos · tarjetas](img/vistas/gastos-tarjetas.jpg)
![Rutas · tabla](img/vistas/rutas-tabla.jpg)
![Rutas · tarjetas](img/vistas/rutas-tarjetas.jpg)
![Usuarios · tabla](img/vistas/usuarios-tabla.jpg)
![Usuarios · tarjetas](img/vistas/usuarios-tarjetas.jpg)

## Notas importantes

- Los cambios de Configuración solo se aplican al pulsar **Guardar cambios**.
- El logo y el color de la marca se ven en toda la aplicación.
- Las vistas y columnas se guardan por usuario en cada dispositivo.
