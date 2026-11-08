# DESIGN.md — Kobros Frontend

> Documento de sistema de diseño del estado real del código.
> Última revisión: 2026-10-30

---

## 1. Introducción y propósito

**Kobros Frontend** es la aplicación operativa de cobro de rutas de crédito informal: gestión de clientes, créditos, cuotas, rutas, gastos y pagos.

### Perfiles de usuario

| Perfil | Dispositivo | Uso principal |
|--------|-------------|---------------|
| **Recaudador en campo** (`collector`) | Teléfono (iOS/Android) | Registrar abonos en ruta, consultar cuotas pendientes |
| **Administrador / Socio** (`admin`, `partner`) | Escritorio | Gestionar clientes, créditos, rutas y reportes |
| **Super / Dev** (`super`, `dev`) | Escritorio | Configuración global, usuarios, marcas |

### Regla madre

> **Si Ant Design lo resuelve, se usa Ant Design.** No se introduce CSS externo, librería de componentes adicional ni patrón visual que duplique lo que AntD ya provee.

---

## 2. Stack y arquitectura relevante para UI

### Dependencias principales

| Categoría | Librería | Versión |
|-----------|----------|---------|
| Framework | React | 18.2 |
| Lenguaje | TypeScript | ~5.7 |
| Build | Vite | ^6.3 |
| **UI Components** | **antd** | **5.24.7 (fija)** |
| Iconos AntD | @ant-design/icons | 5.2.6 |
| Paleta AntD | @ant-design/colors | 7.0 |
| Colores aleatorios | randomcolor | 0.6.2 |
| Estado global | zustand | 4.4 |
| Queries / mutaciones | @tanstack/react-query | 5.8 |
| HTTP | axios | 1.8 |
| Rutas | react-router-dom | 7.5 |
| Fechas | dayjs | 1.11 |
| Auth | @clerk/clerk-react | 5.61 |
| Formularios | rc-field-form | 2.7 |

### Lo que NO existe (no introducir sin justificación)

- ❌ Librería de gráficos fuera de los dashboards de Reportes (allí solo se usa `recharts`, ver §6 «Kit Dashboard»)
- ❌ Drag & drop
- ❌ Editor de texto enriquecido (Quill, TipTap…)
- ❌ CSS-in-JS (styled-components, emotion)
- ❌ Tailwind o utility-CSS paralelo a AntD

---

## 3. Tokens de color

### Fuente de verdad: `src/App.tsx`

```tsx
// ConfigProvider en src/App.tsx
token: {
  borderRadius: 8,
  paddingLG: 16,
  colorPrimary: token['lime-6'],   // ← verde lima, NO azul
  colorTextDisabled,
},
algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
```

### Color primario real

| Token | Valor | Descripción |
|-------|-------|-------------|
| `colorPrimary` | `lime-6` (AntD token) | Verde lima — único color de marca en código |

> **Importante:** El color de marca es verde lima (`lime-6` del sistema de tokens de Ant Design). No existe ningún otro color de marca definido en el código. No inventar ni hardcodear valores hexadecimales nuevos sin actualizar primero el `ConfigProvider`.

### Tokens semánticos AntD (defaults, no redefinidos)

| Token | Uso |
|-------|-----|
| `colorSuccess` | Operaciones exitosas, estado `PAGADO` |
| `colorWarning` | Alertas, estado `MORA` |
| `colorError` | Errores, destructivos |
| `colorInfo` | Información neutral |
| `colorTextDisabled` | Texto deshabilitado (redefinido en `App.tsx`) |
| `colorBgContainer` | Fondo de contenedores (`Layout`, `Sider`, `Header`) |
| `colorBorder` | Bordes del layout (`borderBottom`, `borderRight`) |

### ⚠️ No existe white-label / branding dinámico

En Kobros, **"Brand"** es una entidad de negocio (franquicia/cliente con rutas asociadas), gestionada en `BrandsView` y `BrandsStore`. **No es un sistema de theming.**

- Logo: estático, `@assets/logo-transparent.png` (expandido) / `@assets/icon.png` (colapsado)
- No hay mecanismo de colores por marca/tenant
- No asumir que `BrandModel` tiene relación con la paleta visual

---

## 4. Tipografía y escalas

### Fuente

Kobros usa la **stack tipográfica por defecto de Ant Design** en toda la app (el único uso de fuentes propias es el kit Dashboard de Reportes, que importa `@fontsource/space-grotesk` y `@fontsource/jetbrains-mono` solo desde `UI/Components/Dashboard/ui.tsx`):

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

`src/index.css` está vacío. Los estilos globales reales están en `src/App.css`.

### Escala de tamaños (AntD defaults)

| Uso | Componente AntD | Tamaño aprox. |
|-----|-----------------|---------------|
| Título de pantalla | `Typography.Title level={4}` | 20px |
| Subtítulos / tabs | `Typography.Title level={5}` | 16px |
| Cuerpo / tabla | `Typography.Text` | 14px |
| Texto auxiliar | `Typography.Text type="secondary"` | 12px |

### Reglas

- No usar `font-size` hardcodeado fuera de AntD.
- El token `paddingLG: 16` ya está configurado — no sobreescribir con padding mayor en componentes nuevos sin justificación.
- `borderRadius: 8` está configurado globalmente — mantenerlo consistente.

---

## 5. Soporte Dark / Light

### Mecanismo 1 — Algoritmo AntD (tokens)

Definido en `src/App.tsx`:
```tsx
algorithm: darkMode ? darkAlgorithm : defaultAlgorithm
```
Cambia automáticamente todos los tokens semánticos de AntD (fondos, bordes, texto). Es la fuente principal de theming.

### Mecanismo 2 — Clase CSS en `body`

Definido en `src/infrastructure/context/User/UserModeStore.ts`:
```ts
setMode(dark: boolean) {
  set({ darkMode: dark });
  document.body.classList.toggle('dark', dark);
}
```

El CSS reacciona en `src/App.css`:
```css
body { background-color: #ffffff; }
body.dark { background-color: #1a1a1a; }
```

El `Content` del layout también reacciona inline:
```tsx
background: darkMode ? '#1a1a1a' : '#f5f5f5'
```

### Estado en `UserModeStore` (zustand + persist)

```ts
// src/infrastructure/context/User/UserModeStore.ts
{
  darkMode: boolean,         // persiste en localStorage (key: 'user-mode')
  isMobile: boolean,         // calculado en runtime vía matchMedia
  setMode(dark: boolean),
  setIsMobile(mobile: boolean),
  // UserFontUse, textColor, backgroundColor ← ver nota abajo
}
```

### ⚠️ Deuda técnica: `UserFontUse` no integrado

Existe un enum `UserFontUse { DARK = 'DARK', LIGHT = 'LIGHT', AUTO = 'AUTO' }` y campos `textColor` / `backgroundColor` en el store que **no están siendo usados en ningún componente actual**. El theming real usa solo `darkMode: boolean` + la clase `body.dark`. Antes de usar `UserFontUse`, verificar si sigue siendo necesario o si es dead code.

### Checklist para nuevos componentes

- [ ] ¿El componente se ve correctamente en light y en dark?
- [ ] ¿Usa tokens AntD (`colorBgContainer`, `colorBorder`, etc.) en lugar de colores hardcodeados?
- [ ] ¿Si tiene fondo propio, reacciona a `darkMode` del store o usa tokens AntD?

---

## 6. Componentes UI y patrones comunes

### 6.1 Shell de la aplicación

```
Layout (src/UI/Components/Layout/index.tsx)
├── Header (fijo, 60px, colorBgContainer)
│   ├── Botón colapsar sidebar [solo desktop]
│   ├── Logo [solo mobile]
│   └── DropdownUser
├── Sider (fijo, izquierda, [solo desktop])
│   ├── Logo / Icono (según collapsed)
│   └── ModulesMenu
└── Content (fijo, scrollable, colorBgContainer)
    ├── <Outlet /> (vistas de módulo)
    └── ModulesMenu mobile (barra inferior fija, [solo mobile])
```

- Sider: 190px expandido / 75px colapsado
- Header ancho dinámico: `innerWidth - (190 | 75)px` en desktop, `100vw` en mobile
- El `<Apps>` de AntD (`App as Apps`) envuelve todo para proveer `useApp()` correctamente
- **`position: fixed` siempre con `z-index` explícito.** Header, Sider y el menú inferior móvil usan `position: fixed`. Sin un `z-index` propio, el navegador no garantiza que queden por encima del `Content`: al hacer scroll, el contenido normal puede pintarse encima del chrome fijo y mezclarse con él. `FIXED_CHROME_Z_INDEX` en `Layout/index.tsx` (Header y Sider) y `z-index: 1000` en `.menu` (layout.css, bottom nav móvil) cubren esto — cualquier elemento nuevo con `position: fixed` debe fijar su propio `z-index` del mismo modo.

### 6.2 Catálogo de componentes reutilizables

Ruta base: `src/UI/Components/`

| Componente | Ruta | Descripción |
|------------|------|-------------|
| `CustomTable` | `Table/` | Wrapper sobre `<Table>` de AntD con scroll responsive. Usar siempre en lugar de AntD Table directamente. |
| `LoadingComponent` | `LoadingComponent.tsx` | Spinner de carga, acepta `fullHeight` y `label`. |
| `ErrorView` | `ErrorView/` | Error 500 con `<Result status="500">`. Usar cuando una query falla. |
| `showLoadingNotification` | `showLoadingNotification.tsx` | Notificación con spinner para operaciones largas. |
| `AcctionButtons` | `AcctionButtons.tsx` | Botones Cancelar / Crear / Crear y salir. Se adapta en mobile (texto se oculta, solo iconos). |
| `RowActions` | `RowActions.tsx` | Botones Ver / Editar / Eliminar para filas de tabla. |
| `Filters` + `FiltersFields` | `Filters/`, `FiltersFields/` | Barra de filtros por módulo. Los filtros específicos van en `FiltersFields/`. |
| `ConceptDrawer` | `ConceptDrawer/` | Drawer para consultar/crear conceptos. |
| `TagConcept` | `TagConcept.tsx` | Tag con color aleatorio para conceptos. |
| `ModulesMenu` | `ModulesMenu/` | Menú de navegación lateral (desktop) o inferior (mobile). |
| `PaymentsDateailsLoan` | `PaymentsDateailsLoan/` | Historial de pagos de un crédito (tabla + cálculos). |

#### Campos reutilizables (`src/UI/Components/Fields/`)

| Campo | Descripción |
|-------|-------------|
| `SelectClient` | Select remoto de clientes |
| `SelectBrand` | Select remoto de marcas |
| `SelectRoute` | Select remoto de rutas |
| `SelectConcept` | Select remoto de conceptos |
| `SelectUsers` | Select remoto de usuarios |
| `InputDate` | DatePicker con locale es y formato DD/MM/YYYY |
| `InputDateRange` | RangePicker con locale es |
| `MultiFieldsFormItem` | Agrupa múltiples campos en un FormItem |
| `PayPaymentField` | Campo de abono inline en tabla de pagos |

### 6.3 Patrón de módulo estándar

Todos los módulos CRUD (Users, Clients, Expenses, Routes, Brands) siguen este patrón:

```
src/UI/Routes/<Módulo>/
├── index.tsx          → ruta raíz, registra la ruta en RouterApp
├── layout.tsx         → header + barra de filtros + tabs Activos(N)/Inactivos(N)
├── Table.tsx          → hook de query + CustomTable + RowActions
├── columns.tsx        → definición de columnas vía BuildColumns
└── Form.tsx           → formulario crear/editar/ver (mismo componente, modo read-only en ver)
```

#### `BuildColumns` (`src/infrastructure/utils/BuildColumns.tsx`)

Tipos de render disponibles en columnas:

| `typeRender` | Descripción |
|--------------|-------------|
| `money` | `formatNumber()` con símbolo COP |
| `date` | `dayjs` → `DD/MM/YYYY` |
| `number` | Número con separadores de miles |
| `largeText` | Texto largo con ellipsis y tooltip |
| `boolean` | Check / X con color semántico |
| _(sin typeRender)_ | Texto plano |

### 6.4 Casos especiales

#### Créditos (`Loans`)

```
src/UI/Routes/Loans/
├── BaseForm.tsx       → formulario con cálculos reactivos (cuota, capital, interés)
└── DetailsLoan.tsx    → vista de detalle tipo dashboard con PaymentsDateailsLoan/
```

El `BaseForm` recalcula en tiempo real mientras el usuario edita monto, plazo o frecuencia.

#### Pagos (`Payments`)

```
src/UI/Routes/Payments/
├── PaymentsView/      → tabla principal
└── columns.tsx        → columna extra "Cliente" solo en mobile
```

`PayPaymentField` (`src/UI/Components/Fields/PayPaymentField.tsx`) — campo de abono que aparece directamente en la fila de la tabla (no en modal ni drawer).

### 6.5 Feedback al usuario

| Situación | Patrón |
|-----------|--------|
| Mutación exitosa (crear/editar/eliminar) | `notification.success({ message: '...' })` vía `App.useApp()` |
| Error de mutación o query | `handleError(error, notification)` de `src/infrastructure/utils/handleError.tsx` |
| Carga de página inicial | `<LoadingComponent fullHeight label="..." />` |
| Error de query fatal | `<ErrorView title="..." />` |
| Tabla sin datos | ⚠️ Default de AntD (sin componente `EmptyRender` propio — ver gap abajo) |

> **Regla crítica:** Nunca usar `message.success()` / `message.error()` estático de AntD. Siempre usar el `notification` del contexto `App.useApp()` para que el theme se aplique correctamente.

#### ⚠️ Gap: no existe componente `EmptyRender`

Las tablas vacías muestran el empty state por defecto de AntD. Si se necesita un mensaje personalizado por módulo ("No hay clientes activos aún"), usar la prop `locale={{ emptyText: <Custom /> }}` en el `CustomTable` hasta que se cree un componente centralizado.

### 6.6 Formato de datos

| Dato | Función / Patrón |
|------|-----------------|
| Dinero (COP) | `formatNumber(value)` de `src/infrastructure/utils/formaNumber.tsx` |
| Fechas | `dayjs(value).locale('es').format('DD/MM/YYYY')` |
| Locale AntD | `esEs` importado de `antd/locale/es_ES`, aplicado en `ConfigProvider` |

### 6.7 Botones de acción

| Botón | `type` / prop | Notas |
|-------|----------------|-------|
| Cancelar | `<Button danger>` | Siempre `danger`, aunque no sea destructivo en sí: marca visualmente la salida/descarte del flujo. |
| Acción principal (Guardar, Crear, Ingresar, Confirmar) | `<Button type="primary">` | — |
| Acción secundaria destructiva (Eliminar, Retirar) | `<Button danger>` | Mismo tratamiento visual que Cancelar, coherente con "esto cambia o descarta algo". |

> **Regla:** todo botón **Cancelar** lleva la prop `danger`, en cualquier formulario o modal (edición de usuario, cambio de contraseña, movimientos de caja, etc.).

---

### 6.8 Kit Dashboard (Reportes)

Componentes reutilizables en `src/UI/Components/Dashboard/` (estilos en `dashboard.css`, variables `--kb-*`, claro y oscuro):

| Pieza | Uso |
|---|---|
| `DashboardShell`, `DashCard`, `SectionCard` | Contenedor y tarjetas con icono, título, `extra` y `footer` |
| `KpiCard` | KPI con `pill`, `aside` (ej. `RadialGauge`) y `footer` |
| `Pill`, `IconBox` | Etiquetas de tono (`ok`, `warn`, `danger`, `neutral`, `primary`) e icono |
| `charts.tsx` | `CollectionAreaChart`, `PortfolioDonut`, `StackedBar`, `RankBar`, `RadialGauge`, `PeriodChart`, `toneByCompliance` (≥90 ok, ≥83 warn, resto danger) |
| `DashboardFilters` + `useDashboardFilters` | Banner con Ruta y Recaudador en cascada (opciones de `/reports/dashboard/filters`) y botón actualizar |
| `format.ts` | `formatCOP`, `formatCompactCOP`, `formatPercent`, `getInitials` |

Pantallas: `UI/Routes/ReportsView/` — `Dashboard` (Resumen, compuesto por `Resumen/*Card`), `WeeklyReport` y `AnnualReport` (ambas sobre `PeriodReport`). La tabla de mora crítica pagina y busca en el servidor (5 por página, búsqueda con debounce de 300 ms). El botón «Alerta a recaudadores» del mock no se porta hasta que exista el módulo de recordatorios.

## 7. Reglas y buenas prácticas UI/UX

### 7.1 Mobile-first (breakpoint 768px)

**Por qué:** Los recaudadores en campo usan teléfonos para registrar abonos. La app debe funcionar perfectamente en 768px o menos antes de considerar vistas de escritorio.

**Cómo:**

```ts
// UserModeStore
isMobile: !window.matchMedia('(min-width: 768px)').matches
```

Este valor se recomputa en `resize` y está disponible globalmente.

**Componentes que adaptan su comportamiento según `isMobile`:**

- `Layout` → oculta sidebar, muestra logo en header, agrega menú inferior
- `AcctionButtons` → muestra solo iconos (sin texto) en mobile
- `RowActions` → ajusta tamaño de botones
- `DetailsLoan` → reorganiza layout de tarjetas
- `Payments/columns` → agrega columna "Cliente" en mobile

**Touch targets (recaudador en campo):**

- Botones de acción: mínimo **44×44px** (especialmente `RowActions` y `AcctionButtons`)
- Separación entre botones tocables: mínimo **8px**
- Campos de formulario: altura mínima **40px** (AntD default, no reducir)

### 7.2 Terminología de negocio (español)

Usar siempre los términos del dominio del negocio. **No traducir al inglés en la UI:**

| Concepto | Término correcto en UI |
|----------|----------------------|
| Tabla con registros activos | `Activos (N)` |
| Tabla con registros inactivos | `Inactivos (N)` |
| Abrir detalle de crédito | `Ver crédito` |
| Formulario nuevo crédito | `Crear nuevo crédito` |
| Historial de cuotas pagadas | `Historial de pagos` |
| Número de cuota | `No. cuota` |
| Cuotas pendientes | `C Pen` |
| Cuotas canceladas | `C Can` |
| Pago parcial | `Abono` |
| Estado de cuota activa | `PENDIENTE` |
| Cuota pagada | `PAGADO` |
| Cuota con atraso | `MORA` |
| Ciclo de pago | `Forma de pago` |
| Opciones de `Forma de pago` | `Mensual`, `Quincenal`, `Semanal`, `Diaria` |

### 7.3 Roles y permisos

```ts
// src/constants/types.ts
enum TypeUser {
  dev       = '01',
  super     = '02',
  admin     = '03',
  partner   = '04',
  collector = '05',
}
```

- El rol se lee desde `user.publicMetadata.role` (Clerk) en `RouterApp.tsx`
- El filtrado de módulos se hace en `src/infrastructure/utils/Permissions.ts → getPermission()`
- El menú lateral (`ModulesMenu`) filtra automáticamente según el rol del usuario
- **Alcance de Reportes** (`/reportes/resumen|semanal|anual`, `/reports/dashboard/*`, `/reports/period`): `dev`/`super`/`admin` ven toda su marca (solo `dev` puede elegir `brand_id`); `partner` solo las rutas donde figura en `allowed_users_ids`; `collector` no tiene acceso. A diferencia de `/routes`, el `admin` ve toda la marca en Reportes. Una ruta o recaudador fuera del alcance devuelve 404.
- **Definiciones de Reportes** (única fuente en el backend, `loan_stats`): cartera activa = créditos activos con saldo > 0; mora = cuotas vencidas impagas (`pay_date` < hoy en hora de Bogotá); crítica ≥ 30 días; efectividad = pagado / colocado (máx. 100 %). El frontend solo formatea, nunca recalcula.

### 7.4 Reglas técnicas

1. **AntD primero.** Antes de crear un componente UI, verificar si AntD ya lo resuelve.
2. **Cero colores hexadecimales nuevos.** Todo color nuevo debe ser un token AntD (`colorPrimary`, `colorSuccess`, etc.) o derivarse de `@ant-design/colors`. Ningún `#xxxxxx` hardcodeado en componentes.
3. **Alias de imports obligatorios.** No usar rutas relativas profundas:
   - `@` → `src/`
   - `@assets` → `src/assets/`
   - `@infrastructure` → `src/infrastructure/`
   - `@domain` → `src/domain/`
   - `@routes` → `src/UI/Routes/`
   - `@components` → `src/UI/Components/`
4. **`borderRadius: 8` y `paddingLG: 16` ya están fijados.** No sobreescribir.
5. **Formularios con AntD Form.** No usar `rc-field-form` directamente; se usa a través de `antd/Form`.
6. **`notification` siempre contextual.** Nunca el estático `message.success()`.

### 7.5 Accesibilidad

- Contraste mínimo 4.5:1 para texto sobre fondo (verificar especialmente en modo dark con `lime-6`)
- Botones con solo iconos deben tener `title` o `aria-label`
- No eliminar el outline de foco de AntD
- Los `Select` remotos deben mostrar estado de carga (`loading={isLoading}`)

---

## 8. Checklist antes de dar por terminada una pantalla

### Visuales

- [ ] Se ve correctamente en **light mode**
- [ ] Se ve correctamente en **dark mode** (`setMode(true)` en la UI o localStorage)
- [ ] Se ve correctamente en **mobile** (≤768px, usar DevTools responsive mode)
- [ ] No hay scroll horizontal en ningún tamaño de pantalla

### Contenido

- [ ] Todos los textos están en **español** con la terminología del negocio
- [ ] Los números de dinero usan `formatNumber()`
- [ ] Las fechas usan el formato `DD/MM/YYYY` vía `dayjs` + locale `es`
- [ ] Los labels de campos y columnas reflejan los términos del glosario (sección 7.2)

### Estados de la pantalla (los 4 obligatorios)

- [ ] **Cargando:** `<LoadingComponent />` o skeleton visible
- [ ] **Error:** `<ErrorView />` o `notification.error()` según aplique
- [ ] **Vacío:** mensaje claro (aunque sea el default de AntD, verificar que sea comprensible)
- [ ] **Con datos:** la vista normal, probada con datos reales o fixtures

### Componentes

- [ ] Se usó `CustomTable` en lugar de `<Table>` de AntD directamente
- [ ] Los botones de acción de fila usan `RowActions`
- [ ] Los botones de formulario usan `AcctionButtons`
- [ ] Los selects de entidades remotas usan los campos de `src/UI/Components/Fields/`
- [ ] Ningún componente custom duplica funcionalidad que ya existe en el catálogo

### Permisos

- [ ] La pantalla es accesible solo para los roles correctos (verificado en `Permissions.ts`)
- [ ] Las acciones destructivas (eliminar) tienen confirmación (`Popconfirm` de AntD)

### Calidad

- [ ] `npm run lint` sin errores
- [ ] Sin `console.log` ni `any` explícitos sin justificación

---

## Referencias (fuentes de verdad)

| Archivo | Qué documenta |
|---------|---------------|
| [`src/App.tsx`](src/App.tsx) | `ConfigProvider`, tokens de color, algoritmo dark/light, locale |
| [`src/infrastructure/context/User/UserModeStore.ts`](src/infrastructure/context/User/UserModeStore.ts) | Estado dark/light, `isMobile`, persistencia |
| [`src/infrastructure/utils/Permissions.ts`](src/infrastructure/utils/Permissions.ts) | Filtrado de módulos por rol |
| [`src/infrastructure/utils/BuildColumns.tsx`](src/infrastructure/utils/BuildColumns.tsx) | Tipos de render para columnas de tabla |
| [`src/infrastructure/utils/formaNumber.tsx`](src/infrastructure/utils/formaNumber.tsx) | Formato de números y dinero |
| [`src/constants/types.ts`](src/constants/types.ts) | Enums `TypeUser`, `PaymentMethod` |
| [`src/App.css`](src/App.css) | Estilos globales, variables `body` / `body.dark`, scrollbar |
| [`vite.config.ts`](vite.config.ts) | Alias de imports |
| [`src/UI/Components/`](src/UI/Components/) | Catálogo de componentes reutilizables |
