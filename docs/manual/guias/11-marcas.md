# 11 · Marcas

**Roles:** Solo desarrollador (Dev)
**Objetivo:** Administrar las marcas (clientes del sistema): alta, código y límite de rutas.
**Datos demo:** Visible solo con rol desarrollador. El usuario Super no ve este módulo (devuelve 404), por eso este PDF se genera sin capturas.
**Salida:** `pdf/11-marcas.pdf` · capturas en `img/marcas/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de marcas
- **URL:** `/srv1/home/marcas`
- **Preparar:** Abrir el módulo (rol Dev).
- **Archivo:** `img/marcas/01-lista.png`
- **Explicación:** Cada marca es una organización independiente con sus usuarios, rutas y clientes. Los datos de una marca nunca se mezclan con los de otra.

### 02 · Crear una marca
- **URL:** `/srv1/home/marcas/crear`
- **Preparar:** Pulsar crear marca.
- **Archivo:** `img/marcas/02-nueva.png`
- **Explicación:** Se digitan nombre, código y cantidad máxima de rutas. Después se configuran sus monedas y su primer administrador.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
