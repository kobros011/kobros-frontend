# 05 · Liquidaciones

> Subtítulo: Guía paso a paso — Módulo de Liquidaciones
> Roles: Superusuario y administrador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 05`.

## Introducción

Liquidaciones sirve para cerrar la caja del día de cada ruta y cobrador, y para confirmar los arqueos. El sistema calcula solo el recaudo, los gastos y los créditos nuevos.

## Pasos

### 1 · Abrir el cierre del día
> URL: `/srv1/home/liquidaciones`
> Preparar: Elegir la Ruta Centro.

Con la ruta elegida se muestran el recaudo del día, los créditos nuevos entregados y la meta de cobranza.

- Puedes elegir el cobrador, o dejar la consolidada de toda la ruta.

![Cierre del día de la ruta](img/liquidaciones/01-cierre.png)

### 2 · Cuadrar la caja
> URL: `/srv1/home/liquidaciones`
> Preparar: Bajar hasta 'Datos de cierre' y escribir base 2.500.000 y efectivo 120.000.

Efectivo esperado = base + recaudo - gastos - créditos nuevos.

- Al escribir el efectivo contado se muestra la diferencia: cuadrado, faltante o sobrante.
- Si hay diferencia, la nota es obligatoria.
- En monedas con decimales, como el dólar, se aceptan centavos.
- Pulsa **Cerrar caja del día** y confirma.

![Cuadre operativo con diferencia en cero](img/liquidaciones/02-cuadre.png)

### 3 · Confirmar los cierres pendientes
> URL: `/srv1/home/liquidaciones?tab=pendientes`
> Preparar: Abrir la pestaña 'Por confirmar'.

Lista los cierres que esperan la confirmación del administrador.

- Confirmar deja el cierre en firme.
- Reabrir permite recalcularlo si hubo cobros nuevos.

![Cierres por confirmar](img/liquidaciones/03-por-confirmar.png)

### 4 · Consultar el historial
> URL: `/srv1/home/liquidaciones?tab=historial`
> Preparar: Abrir 'Historial de cierres'.

Registro de los arqueos por ruta, cobrador y fecha.

- Con varias monedas hay un selector **Todas · COP · USD** y un total por moneda.

![Historial de cierres](img/liquidaciones/04-historial.png)

## Notas importantes

- Un cierre incluye solo los cobros y gastos que aún no se habían liquidado.
- Si hay cobros nuevos después del cierre, queda marcado como desactualizado y se puede reabrir.
