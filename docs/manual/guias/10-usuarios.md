# 10 · Usuarios

**Roles:** Admin, Super
**Objetivo:** Crear los usuarios de la marca y asignarles rol.
**Datos demo:** Usuarios de Marca Norte (admin, cobradores).
**Salida:** `pdf/10-usuarios.pdf` · capturas en `img/usuarios/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Lista de usuarios
- **URL:** `/srv1/home/usuarios`
- **Preparar:** Abrir el módulo.
- **Archivo:** `img/usuarios/01-lista.png`
- **Explicación:** Muestra nombre, usuario, rol (admin, socio, cobrador) y si está activo.

### 02 · Crear un usuario
- **URL:** `/srv1/home/usuarios/crear`
- **Preparar:** Pulsar crear usuario.
- **Archivo:** `img/usuarios/02-nuevo.png`
- **Explicación:** Se digitan datos, usuario, rol y, para socios y cobradores, las rutas a las que tendrán acceso. Cada rol ve solo los módulos que le corresponden.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
