# 08 · Reportes

**Roles:** Admin, Super, Socio
**Objetivo:** Analizar cartera, recaudo, mora y utilidad por ruta, cobrador y período.
**Datos demo:** Datos demo del día; una ruta en USD para ver los bloques por moneda.
**Salida:** `pdf/08-reportes.pdf` · capturas en `img/reportes/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Resumen operativo
- **URL:** `/srv1/home/reportes/resumen`
- **Preparar:** Abrir Reportes > Resumen.
- **Archivo:** `img/reportes/01-resumen.png`
- **Explicación:** KPIs de cartera, mora, clientes y efectividad, cobro diario y composición por riesgo. Con más de una moneda hay un bloque 'Valores en COP' y otro 'Valores en USD' (o elige una con el selector).

### 02 · Un bloque por moneda
- **URL:** `/srv1/home/reportes/resumen`
- **Preparar:** Desplazar hasta 'Valores en USD'.
- **Archivo:** `img/reportes/02-bloques.png`
- **Explicación:** Cuando la marca usa más de una moneda, el resumen muestra un bloque por moneda con sus propias cifras; nunca se suman monedas distintas. Con el selector Todas · COP · USD se deja un solo bloque.

### 03 · Reporte semanal
- **URL:** `/srv1/home/reportes/semanal`
- **Preparar:** Abrir la pestaña Semanal.
- **Archivo:** `img/reportes/03-semanal.png`
- **Explicación:** Recaudo, gastos y utilidad de la semana, con gráfica diaria y detalle por día.

### 04 · Reporte anual
- **URL:** `/srv1/home/reportes/anual`
- **Preparar:** Abrir la pestaña Anual.
- **Archivo:** `img/reportes/04-anual.png`
- **Explicación:** Lo mismo por mes del año, con margen de utilidad.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
