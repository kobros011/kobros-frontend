# 04 · Cobro del día

**Roles:** Cobrador, Admin, Super
**Objetivo:** Registrar los pagos que se recaudan en la ruta durante el día.
**Datos demo:** Ruta Centro con Marta (mora) y Jorge (paga hoy).
**Salida:** `pdf/04-cobro-dia.pdf` · capturas en `img/cobro-dia/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Elegir ruta y fecha
- **URL:** `/srv1/home/cobro-dia`
- **Preparar:** Abrir el módulo sin elegir ruta.
- **Archivo:** `img/cobro-dia/01-ruta.png`
- **Explicación:** Primero se elige la ruta y la fecha. Los cobradores solo ven las rutas asignadas.

### 02 · Clientes a cobrar
- **URL:** `/srv1/home/cobro-dia`
- **Preparar:** Elegir 'Ruta Centro'.
- **Archivo:** `img/cobro-dia/02-lista.png`
- **Explicación:** Arriba: pendiente, cobrado y meta del día en la moneda de la ruta. Debajo, una tarjeta por cliente con el orden de visita, y las etiquetas de cuotas pendientes y en mora.

### 03 · Aplicar un pago
- **URL:** `/srv1/home/cobro-dia`
- **Preparar:** Desplegar el cliente con mora (Marta Lucía Rojas).
- **Archivo:** `img/cobro-dia/03-cuota.png`
- **Explicación:** Cada cuota muestra fecha, estado, valor y lo abonado. Escribe el valor recibido y pulsa Aplicar; los abonos parciales quedan registrados y la cuota sigue pendiente por la diferencia. El botón verde 'Todo' cobra todas las cuotas del cliente.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
