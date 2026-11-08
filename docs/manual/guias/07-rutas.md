# 07 · Rutas

**Roles:** Admin, Super
**Objetivo:** Crear y administrar rutas, su moneda y su caja.
**Datos demo:** 3 rutas demo: Centro y Norte en COP, Dólares en USD.
**Salida:** `pdf/07-rutas.pdf` · capturas en `img/rutas/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de rutas
- **URL:** `/srv1/home/rutas`
- **Preparar:** Abrir el módulo.
- **Archivo:** `img/rutas/01-lista.png`
- **Explicación:** Muestra nombre, moneda, valor inicial y fecha de apertura. Las rutas inactivas están en su propia pestaña.

### 02 · Crear una ruta
- **URL:** `/srv1/home/rutas/crear`
- **Preparar:** Pulsar 'Nueva Ruta'.
- **Archivo:** `img/rutas/02-nueva.png`
- **Explicación:** Se digita nombre, valor inicial, gastos iniciales, fecha y los usuarios con acceso. La moneda se elige solo si la marca tiene más de una; con una sola se usa la de la marca. Una vez la ruta tiene créditos, gastos, cierres o movimientos ya no se puede cambiar su moneda.

### 03 · Caja de la ruta
- **URL:** `/srv1/home/rutas/:id/caja`
- **Preparar:** Abrir Ruta Centro (ojo), entrar a 'Caja' y desplegar 'Ver desglose'.
- **Archivo:** `img/rutas/03-caja.png`
- **Explicación:** Saldo de caja, ingresos y retiros acumulados, cobros, gastos y préstamos desembolsados en la moneda de la ruta. Desde aquí se registra el ingreso o retiro de dinero con su motivo.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
