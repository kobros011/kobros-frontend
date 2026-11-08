# Manual de usuario Kobros

Un PDF por módulo, con capturas móviles y la explicación de cómo funciona. Cada módulo tiene una **guía** (`guias/NN-modulo.md`) que dice qué capturas tomar y qué explicar; el PDF se genera a partir de esa guía.

| # | Módulo | Guía | PDF |
|---|--------|------|-----|
| 01 | Clientes | [guias/01-clientes.md](guias/01-clientes.md) | [pdf/01-clientes.pdf](pdf/01-clientes.pdf) |
| 02 | Créditos | [guias/02-creditos.md](guias/02-creditos.md) | [pdf/02-creditos.pdf](pdf/02-creditos.pdf) |
| 03 | Cartera y mora | [guias/03-cartera.md](guias/03-cartera.md) | [pdf/03-cartera.pdf](pdf/03-cartera.pdf) |
| 04 | Cobro del día | [guias/04-cobro-dia.md](guias/04-cobro-dia.md) | [pdf/04-cobro-dia.pdf](pdf/04-cobro-dia.pdf) |
| 05 | Liquidaciones | [guias/05-liquidaciones.md](guias/05-liquidaciones.md) | [pdf/05-liquidaciones.pdf](pdf/05-liquidaciones.pdf) |
| 06 | Gastos | [guias/06-gastos.md](guias/06-gastos.md) | [pdf/06-gastos.pdf](pdf/06-gastos.pdf) |
| 07 | Rutas | [guias/07-rutas.md](guias/07-rutas.md) | [pdf/07-rutas.pdf](pdf/07-rutas.pdf) |
| 08 | Reportes | [guias/08-reportes.md](guias/08-reportes.md) | [pdf/08-reportes.pdf](pdf/08-reportes.pdf) |
| 09 | Configuración | [guias/09-configuracion.md](guias/09-configuracion.md) | [pdf/09-configuracion.pdf](pdf/09-configuracion.pdf) |
| 10 | Usuarios | [guias/10-usuarios.md](guias/10-usuarios.md) | [pdf/10-usuarios.pdf](pdf/10-usuarios.pdf) |
| 11 | Marcas | [guias/11-marcas.md](guias/11-marcas.md) | [pdf/11-marcas.pdf](pdf/11-marcas.pdf) |

## Cómo regenerar

1. `docker compose exec -T api python scripts/seed_manual_demo.py --yes` (backend; **borra** los datos de prueba de la marca NORTE01 y crea el dataset demo).
2. Tomar las capturas descritas en cada guía (móvil 375×812) en `img/<modulo>/`.
3. `python docs/manual/scripts/build_pdfs.py` genera `pdf/NN-modulo.pdf`.
