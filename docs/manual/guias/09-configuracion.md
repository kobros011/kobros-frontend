# 09 · Configuración

**Roles:** Super, Dev
**Objetivo:** Personalizar la marca: datos, logo, monedas y formato de números.
**Datos demo:** Marca Norte con COP y USD.
**Salida:** `pdf/09-configuracion.pdf` · capturas en `img/configuracion/` (móvil 375×812)

## Cómo crear este PDF

1. Cargar el dataset demo (`kobros-backend/scripts/seed_manual_demo.py --yes`) e iniciar sesión con un usuario con el rol indicado.
2. Abrir cada URL de la lista en vista móvil (375×812), dejar la pantalla en el estado de *Preparar* y tomar la captura con el nombre indicado.
3. Revisar que no haya datos reales, que se vean los montos con su moneda y que la lista no esté saturada.
4. Generar el PDF: `python docs/manual/scripts/build_pdfs.py` (una página por paso: título, captura a ancho completo y explicación).

## Pasos y capturas

### 01 · Información de la organización
- **URL:** `/srv1/home/configuracion`
- **Preparar:** Abrir Configuración (parte superior).
- **Archivo:** `img/configuracion/01-organizacion.png`
- **Explicación:** Nombre, código de verificación, correo y teléfono de contacto y logos (expandido y colapsado).

### 02 · Monedas de la marca
- **URL:** `/srv1/home/configuracion`
- **Preparar:** Desplazar hasta la tarjeta 'Monedas'.
- **Archivo:** `img/configuracion/02-monedas.png`
- **Explicación:** Se eligen una o varias monedas de la lista; la primera es la principal. Si hay más de una, cada ruta escoge la suya al crearla. No se puede quitar una moneda que alguna ruta esté usando.

### 03 · Formato de números
- **URL:** `/srv1/home/configuracion`
- **Preparar:** Desplazar hasta 'Formato de números'.
- **Archivo:** `img/configuracion/03-formato.png`
- **Explicación:** Separador de miles y decimales (1,234.56 o 1.234,56) y decimales por defecto. Todos los valores con moneda de la app siguen este formato.

## Criterios de calidad

- Texto en español claro, dirigido a quien usa la app (sin términos técnicos).
- Una idea por captura; resaltar el elemento clave en la explicación.
- Montos siempre con moneda y formato de la marca.
