# 03 · Cartera y mora

**Roles:** Super, Admin, Socio
**Objetivo:** Ver cuánto hay por cobrar y qué créditos están atrasados.
**Datos demo:** Créditos con y sin mora en COP y USD.
**Salida:** `pdf/03-cartera.pdf` · capturas en `img/cartera/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Cartera activa
- **URL:** `/srv1/home/cartera`
- **Preparar:** Abrir Cartera; mostrar los totales y la tabla.
- **Archivo:** `img/cartera/01-cartera.png`
- **Explicación:** Arriba, el total en cartera y el número de créditos, un renglón por moneda. Debajo, la tabla con valor del crédito, pagado, saldo y fecha de vencimiento. Con varias monedas aparece el selector Todas · COP · USD.

### 02 · Cartera en mora
- **URL:** `/srv1/home/cartera/mora`
- **Preparar:** Pulsar la pestaña 'Cartera en mora'.
- **Archivo:** `img/cartera/02-mora.png`
- **Explicación:** Solo los créditos con cuotas vencidas: saldo en mora y días de atraso. Desde la acción de cada fila se abre el crédito para cobrar.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
