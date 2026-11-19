# CLAUDE.md — kobros-frontend

Reglas del proyecto para Claude Code. El detalle del sistema de diseño está en `DESIGN.md`.

## Botones

- **Cancelar** siempre lleva `type="primary"`, `danger` y `ghost` a la vez: `<Button type="primary" danger ghost>Cancelar</Button>` (borde y texto rojos, sin relleno). Aplica a cualquier formulario, modal o drawer, aunque la acción no sea destructiva. Nunca como botón por defecto ni como texto o link.
- La acción principal lleva `type="primary"`. En formularios de cliente dice «Crear cliente» al crear y «Guardar cliente» al editar.
- En formularios de creación hay un solo botón de guardado que guarda y vuelve al listado; no hay "Crear" que se quede en la pantalla ni "Crear y salir".
- En móvil los dos botones van apilados a todo el ancho (`block`), Cancelar arriba y la acción principal abajo; en escritorio van a la derecha en una fila.

## Scroll

- En móvil solo scrollea la página: las tarjetas de formulario usan la clase `kb-form-card` (en `App.css`), que limita la altura y activa el scroll interno únicamente desde 768 px. No usar `overflowY: 'auto'` + `maxHeight` en línea en un `Card`.
- El scrollbar global (en `App.css`) es delgado, sin pista, gris tenue y verde lima al pasar el mouse. No definir scrollbars propios por componente.

## Configuración

- Las secciones (General, Campos obligatorios, Campos personalizados) las elige `SettingsTabs`: en escritorio pestañas subrayadas y en móvil un selector segmentado a todo el ancho (texto completo en dos líneas, activa en el color primario). En móvil no usar `Tabs` de Ant Design: manda al menú «…» las pestañas que no caben y ocultaba «General».
- En móvil, en todos los módulos, el título (icono del menú en caja verde + nombre, `PageTitle` con `getModuleIcon`) va en la barra superior del layout, pegado a la izquierda (padding de 12 px). Las pantallas no repiten el nombre del módulo: ocultar cualquier título propio en móvil (`kb-title-desktop-only`). Si la marca tiene logo, la barra muestra el logo y el título queda en la pantalla.
- El desarrollador no tiene marca propia: elige una en General (`SettingsBrandStore`) y las otras dos secciones quedan deshabilitadas hasta que lo haga.
- Los campos personalizados se guardan al instante (crear, editar, archivar, restaurar, reordenar, eliminar); «Campos obligatorios» usa «Cancelar» y «Guardar cambios». Solo se puede eliminar un campo ya archivado, con confirmación; también borra sus valores en los clientes.
- Los campos se configuran por módulo (`ModuleSelector`). Clientes tiene «Campos obligatorios» y «Campos personalizados»; Créditos, Gastos y Rutas solo tienen «Campos personalizados» (sus campos estándar son fijos). Los valores van en `customFields` del registro; los formularios los pintan con `CustomFieldsSection` y las listas con `customColumns`. El filtro por campo personalizado (`customFilterItems`, se envía como `cf_<clave>`) existe en Clientes, Créditos y Gastos; Rutas no tiene filtros.
- Los botones de todos los formularios van en `FormFooter`: pie fijo pegado abajo de la tarjeta (sobre el menú inferior en móvil), con los botones en una fila y centrados en móvil.
