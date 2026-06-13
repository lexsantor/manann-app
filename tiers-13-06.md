# Manann — Tiers pendientes (definidos 13-06-2026)

---

## Tier D — UX power user (S · ≤2 días)
- Bulk actions en lista: checkbox multi-select → asignar agente / cambiar estado / exportar selección
- Duplicar expediente (clona campos base, status=borrador)
- Keyboard nav en lista (J/K o ↑↓ para navegar, Enter para abrir)
- Vista lista densa (tabla) como tercera opción junto a grid/kanban

## Tier E — Portal de seguimiento para cliente (M · 2–3 días)
- Link público `/seguimiento/[token]` sin auth — el importador ve estado, ETA, documentos descargables
- Botón "Compartir con cliente" en cabecera del expediente → copia URL
- Vista stripped: estado visual + countdown ETA + docs + tracking

## Tier F — Analítica avanzada (M · 3–4 días)
- `/reportes` con selector de período
- GP mensual (area chart), top clientes por margen, distribución por ruta/modo
- KPI de tránsito: ETD estimado vs real, días medios de retraso por naviera
- Export PDF del informe

## Tier G — Directorio de contactos (M · 2–3 días)
- `/contactos` CRUD: clientes, proveedores, navieras, agentes
- Historial de expedientes + GP acumulado por contacto
- Autocompletar al asignar partes en un expediente

## Tier H — IA 2.0 (L · 3–5 días)
- Price anomaly: "Este flete está 40% sobre tu histórico para BCN→RTM"
- Predicción de riesgo de retraso por ruta/naviera/temporada (simulada pero creíble)
- Batch extraction: subir 3 BL a la vez, extrae los tres en paralelo

## Tier I — Landing completar (S · 1–2 días)
- Actualizar `/el-expediente` y `/como-funciona` con los módulos financieros, copiloto, portal cliente
- Demo sandbox público (expediente ejemplo con datos reales navegable sin login)
