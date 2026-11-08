# 02 · Créditos

**Roles:** Super, Admin, Cobrador
**Objetivo:** Crear un crédito paso a paso y consultar su ficha y su historial de pagos.
**Datos demo:** Créditos demo: uno en mora, uno al día y uno por vencer.
**Salida:** `pdf/02-creditos.pdf` · capturas en `img/creditos/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de créditos
- **URL:** `/srv1/home/creditos`
- **Preparar:** Abrir el módulo.
- **Archivo:** `img/creditos/01-lista.png`
- **Explicación:** Lista los créditos con cliente, documento y ruta. Se busca por número de crédito o por cliente; el ojo abre la ficha.

### 02 · Crear crédito: info del cliente
- **URL:** `/srv1/home/creditos/crear`
- **Preparar:** Entrar desde 'Crear nuevo crédito' en la ficha de Marta Lucía Rojas.
- **Archivo:** `img/creditos/02-asistente.png`
- **Explicación:** El asistente tiene tres pasos. El primero muestra los datos del cliente, su fiador y referencias, la ruta y la prioridad del cliente en la ruta. Se pueden corregir dirección y celular antes de continuar.

### 03 · Crear crédito: historial y riesgo
- **URL:** `/srv1/home/creditos/crear`
- **Preparar:** Pulsar 'Continuar' dos veces hasta ver el indicador de riesgo.
- **Archivo:** `img/creditos/03-historial.png`
- **Explicación:** Resume los créditos anteriores del cliente (cuotas canceladas, pendientes y mora) y calcula un indicador de riesgo y un monto viable para el nuevo crédito.

### 04 · Crear crédito: datos del crédito
- **URL:** `/srv1/home/creditos/crear`
- **Preparar:** Pulsar 'Continuar' una vez más y desplazar hasta 'Datos del Crédito'.
- **Archivo:** `img/creditos/04-datos-credito.png`
- **Explicación:** Se digitan capital, cuota fija, número de cuotas y forma de pago (diaria, semanal, quincenal o fecha fija). Cada campo de dinero lleva la moneda de la ruta. El resumen calcula utilidad, total, plazo, tasa y fecha final.

### 05 · Ficha del crédito
- **URL:** `/srv1/home/creditos/:id`
- **Preparar:** Abrir el crédito de Marta Lucía Rojas desde la lista.
- **Archivo:** `img/creditos/05-ficha.png`
- **Explicación:** La ficha tiene tres secciones desplegables: información del cliente (con su prioridad en la ruta), datos del crédito e historial de pagos.

### 06 · Resumen calculado del crédito
- **URL:** `/srv1/home/creditos/:id`
- **Preparar:** Desplegar 'Datos del Crédito' y desplazar hasta el resumen.
- **Archivo:** `img/creditos/06-datos.png`
- **Explicación:** Capital prestado, utilidad, total del crédito, plazo, tasa de interés, cuotas canceladas y pendientes, total en mora, pagado y saldo pendiente, todo en la moneda de la ruta.

### 07 · Historial de pagos
- **URL:** `/srv1/home/creditos/:id`
- **Preparar:** Desplegar 'Historial de Pagos'.
- **Archivo:** `img/creditos/07-pagos.png`
- **Explicación:** Cada cuota aparece como pagada, parcial, pendiente o en mora, con su fecha límite. Las cuotas vencidas o que vencen hoy tienen un campo para abonar. Los filtros por estado ayudan a encontrar rápido las cuotas en mora.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
