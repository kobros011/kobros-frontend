# 06 · Gastos

**Roles:** Admin, Cobrador, Super
**Objetivo:** Registrar los gastos de la ruta (combustible, transporte) para que descuenten en el cierre.
**Datos demo:** 2 gastos demo (Gasolina moto en COP, Transporte en USD).
**Salida:** `pdf/06-gastos.pdf` · capturas en `img/gastos/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de gastos
- **URL:** `/srv1/home/gastos`
- **Preparar:** Abrir el módulo.
- **Archivo:** `img/gastos/01-lista.png`
- **Explicación:** Cada gasto muestra concepto, nombre, fecha, ruta y valor con su moneda.

### 02 · Registrar un gasto
- **URL:** `/srv1/home/gastos/crear`
- **Preparar:** Pulsar crear gasto; mostrar el formulario.
- **Archivo:** `img/gastos/02-nuevo.png`
- **Explicación:** Se elige ruta, concepto, fecha y valor. Los gastos del día entran automáticamente en el cierre de caja de esa ruta.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
