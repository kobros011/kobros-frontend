# 02 · Créditos

> Subtítulo: Guía paso a paso — Módulo de Créditos
> Roles: Superusuario, administrador, socio y recaudador
> Cómo crear este PDF: abre cada URL en vista móvil (390x844), deja la pantalla como indica «Preparar», toma la captura con el nombre indicado y ejecuta `python docs/manual/scripts/build_pdfs.py 02`.

## Introducción

Créditos permite crear un préstamo paso a paso y consultar su ficha y su historial de pagos. Todos los valores se muestran con la moneda de la ruta del crédito.

## Pasos

### 1 · Ver la lista de créditos
> URL: `/srv1/home/creditos`
> Preparar: Abrir Créditos desde la barra inferior.

Lista los créditos con el cliente, su documento y la ruta.

- Busca por número de crédito o por cliente.
- El icono del ojo abre la ficha del crédito.

![Lista de créditos](img/creditos/01-lista.png)

### 2 · Crear un crédito: datos del cliente
> URL: `/srv1/home/creditos/crear`
> Preparar: Entrar desde 'Crear nuevo crédito' en la ficha de Marta Lucía Rojas.

El asistente tiene tres pasos. El primero muestra los datos del cliente, su fiador y referencia principales, la ruta y su prioridad en ella. Ahí mismo se pueden corregir la dirección y el celular, y con **Editar contactos** cambiar o agregar fiadores y referencias sin salir del asistente. **Editar cliente** abre el cajón para cambiar cualquier otro dato.

- Puedes corregir la dirección y el celular antes de continuar.
- Pulsa **Continuar** para pasar al historial.
- Para un cliente **nuevo** no hace falta pasar por aquí: al crear el cliente también puedes llenar los datos del crédito y se crea en el mismo paso.

![Paso 1: información del cliente](img/creditos/02-asistente.png)

### 3 · Crear un crédito: historial y riesgo
> URL: `/srv1/home/creditos/crear`
> Preparar: Pulsar 'Continuar' dos veces hasta ver el indicador de riesgo.

Resume los créditos anteriores del cliente: cuotas canceladas, pendientes y total en mora.

- El indicador de riesgo (bajo, medio o alto) ayuda a decidir.
- El monto viable es una sugerencia de cuánto prestar según su historial.

![Paso 2: historial, riesgo y monto viable](img/creditos/03-historial.png)

### 4 · Crear un crédito: datos del crédito
> URL: `/srv1/home/creditos/crear`
> Preparar: Pulsar 'Continuar' una vez más y desplazar hasta 'Datos del Crédito'.

Se digitan el capital, la cuota fija, el número de cuotas y la forma de pago (diaria, semanal, quincenal o fecha fija).

Bajo el capital aparece **Disponible en caja hoy**: la base de la ruta más las cuotas cobradas, menos los gastos y los créditos ya entregados hoy. Si el capital supera ese valor se muestra una alerta y, al guardar, se pide confirmación.

- Cada campo de dinero muestra la moneda de la ruta.
- El resumen calcula la utilidad, el total a pagar, el plazo, la tasa y la fecha final.
- Si el cliente paga algo ese mismo día, escríbelo en **Valor pagado hoy**.

![Paso 3: datos del crédito y resumen](img/creditos/04-datos-credito.png)

### 5 · Consultar la ficha del crédito
> URL: `/srv1/home/creditos/:id`
> Preparar: Abrir el crédito de Marta Lucía Rojas desde la lista.

La ficha tiene tres secciones desplegables: información del cliente, datos del crédito e historial de pagos.

- En la información del cliente se ve su prioridad en la ruta y se puede cambiar.

![Ficha del crédito](img/creditos/05-ficha.png)

### 6 · Leer el resumen calculado
> URL: `/srv1/home/creditos/:id`
> Preparar: Desplegar 'Datos del Crédito' y bajar hasta el resumen.

Muestra capital prestado, utilidad, total del crédito, plazo, tasa de interés, cuotas canceladas y pendientes, total en mora, pagado y saldo pendiente.

![Resumen calculado del crédito](img/creditos/06-datos.png)

### 7 · Revisar el historial de pagos
> URL: `/srv1/home/creditos/:id`
> Preparar: Desplegar 'Historial de Pagos'.

Cada cuota aparece como pagada, parcial, pendiente o en mora, con su fecha límite.

- Las cuotas vencidas o que vencen hoy tienen un campo para abonar.
- Los filtros por estado ayudan a encontrar rápido las cuotas en mora.

![Historial de pagos de un crédito](img/creditos/07-pagos.png)

### 8 · Cambiar la vista y elegir columnas
> URL: `/srv1/home/creditos`
> Preparar: Alternar entre los iconos de tabla y lista sobre el listado.

Cada lista se puede ver como tabla o como tarjetas. Usa los dos iconos que están sobre la lista para cambiar de vista.

- Icono de cuadrícula: vista de **tabla**, con una fila por registro y desplazamiento lateral si hay muchas columnas.
- Icono de lista: vista de **tarjetas**, pensada para el celular, con los datos apilados.
- En tabla, el botón **Columnas** abre un panel donde marcas qué columnas mostrar y arrastras para reordenarlas; en tarjetas, el botón **Tarjeta** hace lo mismo con los datos de cada tarjeta.
- Usa **Mostrar todo** u **Ocultar todo** para cambiar todas de una vez. La vista y las columnas que elijas se recuerdan en este dispositivo.

![Vista de tabla de créditos](img/vistas/creditos-tabla.png)
![Vista de tarjetas de créditos](img/vistas/creditos-tarjetas.jpg)

## Notas importantes

- El número real del crédito lo asigna el servidor al guardarlo.
- Una cuota pagada de más genera saldo a favor para el cliente.
