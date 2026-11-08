# Prompt para Stitch — Prioridad de clientes por ruta (Kobros)

> Pega este texto completo en Stitch. Pídele **cada pantalla en dos versiones: escritorio (1440 px) y móvil (375 px)**. Genera todas las pantallas del listado en un mismo proyecto para que compartan estilo.

---

## 1. Contexto del producto

**Kobros** es una app de microfinanzas y cobranza "gota a gota" en Colombia. Los **cobradores** recorren **rutas** cobrando cuotas diarias; los **administradores** crean clientes, créditos y organizan las rutas. Se usa sobre todo en el celular, en la calle (mobile-first), y en escritorio para la administración.

**Concepto nuevo — Prioridad:** cada cliente tiene un número de prioridad **por cada ruta** en la que está (1 = primero en visitarse). Un mismo cliente puede estar en varias rutas y tener una prioridad distinta en cada una (ej.: `Ruta Norte · #3` y `Ruta Centro · #12`). La prioridad define el orden en que aparece el cliente en "Cobro del día". Al mover un cliente a otra posición, **los demás se recorren automáticamente** (nunca hay números repetidos ni huecos).

Quién puede cambiarla: Super usuario y Administrador. El Recaudador (cobrador) y el Socio **solo ven** los números, sin acciones de edición.

## 2. Lenguaje visual (respetar, no inventar uno nuevo)

- **Tema oscuro** como principal: fondo casi negro (#0E0E0E–#141414), tarjetas con borde de 1 px en verde lima muy tenue (20 % de opacidad) y fondo apenas teñido de verde (5 %).
- **Color primario: verde lima #8BBB11** (en la app real es configurable por marca; úsalo como "color de marca"). Estados: rojo #E5484D (peligro/cancelar), naranja #F5A623 (aviso), azul #3B82F6 (información), verde de éxito para confirmaciones. Nunca usar solo el color para comunicar: siempre icono + texto.
- **Tipografía:** *Space Grotesk* para textos y títulos; *JetBrains Mono* para cifras y números de prioridad (#3, #12). Tamaños: título de pantalla 20–22, sección 16, cuerpo 13–14, apoyo 11–12.
- **Formas:** radios de 10–12 px, tarjetas planas (sin sombras pesadas), chips tipo "píldora" con icono, iconos de línea finos (estilo Ant Design / Lucide).
- **Botones pequeños** (altura ~28–32 px). El botón **Cancelar siempre en rojo** (outline o sólido rojo); la acción principal en verde lima con texto oscuro.
- **Composición de referencia:** igual que la pantalla "Liquidaciones y cuadre de rutas": banner superior con icono en caja verde + título + subtítulo + pestañas, fila de filtros en píldoras, contenido en tarjetas; **panel lateral derecho (drawer) de 480 px en escritorio y hoja inferior al 85 % de la altura en móvil**.
- **Navegación móvil:** barra inferior con 5 accesos (Rutas, Usuarios, Clientes, Créditos, Más) y menú superior con el usuario (ej. "Admin Lugo · Administrador").
- **Textos en español colombiano**, dinero con el signo antes del símbolo (−$450.000), fechas DD/MM/AAAA. Usa datos realistas (nombres como Juan Pérez, Amelia Ortiz, Diego Cardona; rutas "Ruta Norte", "Ruta Centro", "Ruta Sur"; barrios; celulares 300 111 2233).

## 3. Pantallas a generar (todas en escritorio y móvil)

### Pantalla 1 — Clientes: lista con prioridad por ruta
Banner "Clientes" con subtítulo "Titulares, rutas y prioridad de visita" y botón primario **Nuevo cliente** + botón secundario **Ordenar ruta**. Filtros en píldoras: Ruta (Todas las rutas / Ruta Norte…), Estado (Activos 38 / Inactivos 4), búsqueda. Tabla en escritorio con columnas: Nombre completo, Documento, Celular, Barrio, **Rutas y prioridad**, Estado, Acciones (ver, editar, prioridad). La columna *Rutas y prioridad* muestra **chips** `Ruta Norte · #3` en `JetBrains Mono`; verde lima lleno si la prioridad es 1–3, neutro (borde tenue) si es mayor; un cliente en varias rutas muestra varios chips y `+2` si no caben. Cuando se filtra por una ruta, la tabla se ordena por prioridad y aparece una primera columna con el número grande `#1, #2, #3…`. En móvil: tarjetas con nombre, celular, barrio y los chips de ruta/prioridad abajo; cambio de vista tabla/tarjetas con selector segmentado.

### Pantalla 2 — Clientes: modo selección masiva
Al tocar "Seleccionar" aparece un **checkbox** por fila/tarjeta y un "Seleccionar todos los de esta ruta". Se muestra una **barra de acciones flotante** (abajo en móvil, fija sobre la barra de navegación) con "**3 seleccionados** · [Mover…] · [Cancelar]". Mostrar el estado con 0, 3 y "todos" seleccionados, y la tabla con filas resaltadas en verde tenue. Si hay clientes de varias rutas seleccionados, la barra muestra un aviso: "Elige una ruta para mover".

### Pantalla 3 — Mover clientes (modal en escritorio / hoja inferior en móvil)
Título "Mover 3 clientes". Campos: **Ruta** (obligatorio si el cliente tiene varias; muestra la posición actual de cada uno en esa ruta), **Destino**: control segmentado *Al inicio · Al final · A la posición* con un número editable (stepper `−  8  +`). **Vista previa "Antes → Después"** con las 5–6 filas afectadas (número + nombre) y las filas movidas resaltadas en verde; texto de apoyo "Los demás clientes se recorren automáticamente". Botones: **Cancelar** (rojo) y **Mover clientes** (verde). Incluir variante de error ("No se pudo mover: la ruta cambió, actualiza").

### Pantalla 4 — Ordenar ruta (arrastrar y soltar)
Pantalla completa con banner "Ordenar Ruta Norte · 38 clientes". Lista vertical: cada fila con **asa de arrastre** (⠿), **número de prioridad grande** en mono (#1…), nombre, barrio, celular y estado (activo / inactivo en gris). Mostrar una fila **siendo arrastrada** (elevada, borde verde, sombra mínima) y la línea de inserción. Indicador "**5 cambios sin guardar**" y botones **Descartar** (rojo) / **Guardar orden** (verde). Buscador para saltar a un cliente. En móvil, junto al asa: botones **▲ ▼** y "Mover a #" para quienes no pueden arrastrar (accesibilidad), y encabezado fijo con los botones de guardar.

### Pantalla 5 — Prioridad de un cliente en cada ruta (drawer)
Se abre desde el icono de prioridad de la fila/tarjeta. Cabecera con nombre, documento y celular. Una **tarjeta por ruta** del cliente con: nombre de la ruta, "**Posición actual #4 de 38**", cliente anterior y siguiente (ej. "↑ #3 Ana Gómez · ↓ #5 Luis Rojas"), control "**Mover a #**" con stepper + botones *Inicio* y *Final*, y botón **Guardar** por tarjeta (deshabilitado hasta que cambie). Mostrar dos versiones: cliente con **1 ruta** y cliente con **3 rutas** (tarjetas apiladas, cada una independiente). Pie con **Cerrar**.

### Pantalla 6 — Crédito: prioridad dentro del asistente "Nuevo crédito" (paso Cliente)
En el paso de datos del cliente agregar el bloque **"Prioridad en Ruta Norte"**: posición actual (#7), selector de **nueva posición** (lista con los clientes y su número) y una **vista previa** "Quedará entre **Ana #7** y **Luis #8**"; opción "Mantener posición". Si el cliente está en varias rutas, un selector de **ruta del crédito** arriba, y el bloque cambia con la ruta elegida. Mantener el estilo compacto del asistente (campos `small`, tarjetas por paso).

### Pantalla 7 — Crédito: ficha / detalle
En la ficha de un crédito existente, una tarjeta **"Prioridad"**: número grande `#4` en mono, "de 38 en Ruta Norte", y botón **Cambiar prioridad** (solo administración) que abre el drawer de la Pantalla 5. Variante para Recaudador: solo el número, sin botón.

### Pantalla 8 — Formulario de cliente (crear / actualizar)
Nueva sección **"Rutas y prioridad"** debajo de los datos básicos: lista de rutas asignadas como filas `Ruta Norte · #3` con acciones *Cambiar prioridad* y *Quitar*; botón **Agregar a otra ruta** (selector de ruta + "Posición inicial: al final" editable). Al quitar una ruta que tiene créditos activos mostrar aviso naranja "Esta ruta tiene 1 crédito activo; no se puede quitar" (botón deshabilitado) y, si no los tiene, confirmación con Cancelar en rojo.

### Pantalla 9 — Cobro del día
Mostrar la tarjeta de un cliente de la lista de cobro con el **número de prioridad destacado** (círculo verde con #3 en mono) al inicio del nombre, y en el menú "⋯" de la tarjeta la opción **Cambiar prioridad** (solo admin). Una vista con 4 clientes en orden 1–4 para ver la jerarquía.

### Pantalla 10 — Estados y mensajes (hoja de componentes)
Un tablero con: esqueleto de carga de la lista; ruta sin clientes ("Esta ruta aún no tiene clientes" + botón Nuevo cliente); error de red con **Reintentar**; aviso de **conflicto** ("Alguien más reordenó esta ruta · Actualizar"); notificación de éxito ("3 clientes movidos a #1–#3"); vista de **permisos** (Recaudador/Socio ven los números sin acciones, con un candado discreto en el botón Ordenar); diálogo de confirmación para quitar un cliente de una ruta.

## 4. Reglas de diseño que no se pueden romper
1. Mismo sistema visual que Liquidaciones (tokens, tipografías, tarjetas, drawer/hoja inferior).
2. Prioridad siempre visible como **#número en JetBrains Mono**, nunca solo con color.
3. Botones pequeños; **Cancelar siempre rojo**; acción principal en verde lima.
4. Móvil primero: áreas táctiles ≥ 40 px, sin scroll horizontal, acciones masivas en barra inferior.
5. Accesibilidad: contraste AA, foco visible, alternativa a arrastrar (▲▼ y "Mover a #").
6. Todo el texto en español colombiano; datos de ejemplo realistas, sin "Lorem ipsum".
