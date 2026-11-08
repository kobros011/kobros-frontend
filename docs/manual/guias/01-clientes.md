# 01 · Clientes

**Roles:** Super, Admin, Cobrador
**Objetivo:** Registrar y consultar clientes, ver su saldo a favor y definir el orden de visita en cada ruta.
**Datos demo:** 7 clientes demo repartidos en 3 rutas.
**Salida:** `pdf/01-clientes.pdf` · capturas en `img/clientes/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de clientes
- **URL:** `/srv1/home/clientes`
- **Preparar:** Abrir el módulo; mostrar la lista en tarjetas.
- **Archivo:** `img/clientes/01-lista.png`
- **Explicación:** Cada tarjeta muestra el nombre, el documento, el celular, la ruta y las insignias de créditos activos y saldo a favor (con la moneda de la ruta). Usa el buscador para encontrar por nombre o cédula.

### 02 · Crear un cliente
- **URL:** `/srv1/home/clientes/crear`
- **Preparar:** Pulsar el botón de nuevo cliente; dejar el formulario vacío visible.
- **Archivo:** `img/clientes/02-nuevo.png`
- **Explicación:** El formulario pide datos personales, dirección, celular y la ruta (o rutas) del cliente. Un cliente puede estar en varias rutas. Al guardar queda listo para crearle un crédito.

### 03 · Ordenar clientes de una ruta
- **URL:** `/srv1/home/clientes/ordenar`
- **Preparar:** Elegir la Ruta Centro.
- **Archivo:** `img/clientes/03-ordenar.png`
- **Explicación:** Define el orden en que el cobrador visita a los clientes. Arrastra o usa los controles para cambiar la prioridad; al salir con cambios sin guardar el sistema pide confirmar.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
