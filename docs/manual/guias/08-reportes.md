# 08 · Reportes

> Subtítulo: Guía paso a paso — Módulo de Reportes
> Roles: Superusuario, administrador y socio
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 08`.

## Introducción

Reportes ayuda a analizar la cartera, el recaudo, la mora y la utilidad por ruta, recaudador y período. Cuando la marca usa más de una moneda, hay un bloque por cada una.

## Pasos

### 1 · Leer el resumen operativo
> URL: `/srv1/home/reportes/resumen`
> Preparar: Abrir Reportes > Resumen.

Muestra los indicadores de cartera activa, cartera en mora, base de clientes y efectividad de cobro, además del cobro diario y la composición por riesgo.

- Filtra por **ruta** y por **recaudador**; el botón de actualizar recarga los datos.

![Resumen operativo](img/reportes/01-resumen.png)

### 2 · Ver un bloque por moneda
> URL: `/srv1/home/reportes/resumen`
> Preparar: Bajar hasta 'Valores en USD'.

Con más de una moneda el resumen muestra un bloque por moneda con sus propias cifras; nunca se suman monedas distintas.

- El selector **Todas · COP · USD** deja un solo bloque.

![Bloque de valores en dólares](img/reportes/02-bloques.png)

### 3 · Consultar el reporte semanal
> URL: `/srv1/home/reportes/semanal`
> Preparar: Abrir la pestaña Semanal.

Recaudo, gastos y utilidad de la semana, con una gráfica por día y el detalle.

- Cambia la semana con el selector de fecha.

![Reporte semanal](img/reportes/03-semanal.png)

### 4 · Consultar el reporte anual
> URL: `/srv1/home/reportes/anual`
> Preparar: Abrir la pestaña Anual.

Lo mismo por mes del año, con el margen de utilidad.

- Cambia el año con el selector.

![Reporte anual](img/reportes/04-anual.png)

## Notas importantes

- Las cifras de cada bloque corresponden a una sola moneda.
