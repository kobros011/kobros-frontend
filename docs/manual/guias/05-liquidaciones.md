# 05 · Liquidaciones

**Roles:** Admin, Super
**Objetivo:** Cerrar la caja del día de cada ruta y cobrador y confirmar los arqueos.
**Datos demo:** Un cierre confirmado (Ruta Norte) y uno pendiente con faltante (Ruta Dólares).
**Salida:** `pdf/05-liquidaciones.pdf` · capturas en `img/liquidaciones/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Cierre del día
- **URL:** `/srv1/home/liquidaciones`
- **Preparar:** Elegir 'Ruta Centro'.
- **Archivo:** `img/liquidaciones/01-cierre.png`
- **Explicación:** Con la ruta elegida el sistema calcula solo el recaudo, los gastos y los créditos nuevos del día y la meta de cobranza.

### 02 · Cuadre de caja
- **URL:** `/srv1/home/liquidaciones`
- **Preparar:** Desplazar hasta 'Datos de cierre' y digitar base 2.500.000 y efectivo 120.000.
- **Archivo:** `img/liquidaciones/02-cuadre.png`
- **Explicación:** Efectivo esperado = base + recaudo − gastos − créditos nuevos. Al digitar el efectivo contado se muestra la diferencia (faltante o sobrante); si hay diferencia la nota es obligatoria. En USD se aceptan centavos.

### 03 · Por confirmar
- **URL:** `/srv1/home/liquidaciones?tab=pendientes`
- **Preparar:** Abrir la pestaña 'Por confirmar'.
- **Archivo:** `img/liquidaciones/03-por-confirmar.png`
- **Explicación:** Lista los cierres que esperan la confirmación del administrador. Confirmar deja el cierre en firme; reabrir permite recalcularlo si hubo cobros nuevos.

### 04 · Historial de cierres
- **URL:** `/srv1/home/liquidaciones?tab=historial`
- **Preparar:** Abrir 'Historial de cierres'.
- **Archivo:** `img/liquidaciones/04-historial.png`
- **Explicación:** Registro de arqueos por ruta, cobrador y fecha, con selector de moneda cuando la marca tiene varias y un total por moneda.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
