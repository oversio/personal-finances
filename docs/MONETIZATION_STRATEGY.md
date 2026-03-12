# Estrategia de Monetización

> Documento de planificación para evaluar estrategias de monetización de la aplicación de finanzas personales.

---

## 1. Modelo Recomendado: Freemium con 3 Tiers

### ¿Por qué Freemium?

- **Reduce fricción de entrada** - Finanzas personales requiere confianza antes de pagar
- **Viral growth** - Usuarios gratis recomiendan a otros
- **Competencia** - Apps como Wallet, YNAB tienen tiers gratis
- **Data moat** - Una vez que el usuario tiene 6+ meses de datos, es costoso migrar

### ¿Por qué 3 Tiers?

- **Free** → Captura volumen, genera confianza
- **Pro** → "Sweet spot" de revenue (mayoría de conversiones)
- **Business/Family** → Captura poder adquisitivo alto + colaboración

---

## 2. Decisión sobre Anuncios

**Recomendación: NO incluir anuncios**

| Factor              | Impacto                                                   |
| ------------------- | --------------------------------------------------------- |
| **UX degradada**    | Finanzas = datos sensibles, anuncios generan desconfianza |
| **Revenue bajo**    | Sin millones de usuarios, ads no generan suficiente       |
| **Posicionamiento** | Te aleja del segmento premium dispuesto a pagar           |
| **Conversión**      | Mejor convertir a Premium que monetizar con ads           |

**Alternativa:** Límites generosos que empujen naturalmente a upgrader.

---

## 3. Estructura de Planes

### Plan Gratis (Forever)

| Feature                   | Límite                           |
| ------------------------- | -------------------------------- |
| Workspaces                | 1                                |
| Cuentas                   | 3                                |
| Transacciones             | Últimos 3 meses visibles         |
| Categorías                | Solo las por defecto (no crear)  |
| Transacciones recurrentes | 3                                |
| Presupuestos              | 2                                |
| Reportes                  | Solo Expenses Breakdown (básico) |
| Importación CSV           | No                               |
| Invoice Scanner           | 5/mes                            |
| Exportar datos            | No                               |

---

### Plan Pro (~$5-8 USD/mes)

| Feature                   | Límite                                                |
| ------------------------- | ----------------------------------------------------- |
| Workspaces                | 3                                                     |
| Cuentas                   | Ilimitadas                                            |
| Transacciones             | Historial completo                                    |
| Categorías                | Crear/editar ilimitadas                               |
| Transacciones recurrentes | Ilimitadas                                            |
| Presupuestos              | Ilimitados                                            |
| Reportes                  | Todos (expenses, income, cash flow, budget vs actual) |
| Importación CSV           | Ilimitada                                             |
| Invoice Scanner           | 50/mes                                                |
| Exportar datos            | CSV                                                   |
| Soporte                   | Email                                                 |

---

### Plan Business/Family (~$12-15 USD/mes)

| Feature                | Límite                   |
| ---------------------- | ------------------------ |
| Todo de Pro            | Incluido                 |
| Workspaces             | Ilimitados               |
| Miembros por workspace | Hasta 5                  |
| Invoice Scanner        | Ilimitado                |
| Exportar datos         | PDF, Excel, CSV          |
| Reportes avanzados     | Tax reports, forecasting |
| API Access             | Incluido                 |
| Audit logs             | Incluido                 |
| Soporte                | Prioritario              |

---

## 4. Áreas para Restricción por Plan

### Fácil de Implementar (ya existe la estructura)

1. **Límite de workspaces** - Ya está en el modelo de datos
2. **Límite de cuentas por workspace** - Query simple
3. **Límite de transacciones recurrentes** - Contador en creación
4. **Reportes por tipo** - Condicional en el endpoint
5. **Invoice Scanner quota** - Contador mensual

### Valor Percibido Alto (motiva upgrade)

1. **Importación CSV** - Power users lo necesitan
2. **Historial completo** - "Desbloquea tu historial" es compelling
3. **Exportar datos** - Necesario para taxes/contadores
4. **Reportes avanzados** - Cash flow, budget comparison
5. **Colaboración** - Familias/parejas que comparten gastos

---

## 5. Pricing Psychology

- **Oferta anual** con 2 meses gratis (mejora LTV)
- **Upgrade nudges** cuando el usuario se acerca a límites
- **Trial de Pro** al registrarse (genera FOMO al terminar)
- **Descuento primer año** para early adopters

---

## 6. Funcionalidades Actuales de la App

### Implementadas

- **Autenticación** - Email/password, Google OAuth
- **Multi-workspace** - Arquitectura multi-tenant
- **Cuentas** - Múltiples tipos, balance tracking
- **Transacciones** - Income, Expense, Transfer
- **Categorías** - Jerárquicas con subcategorías
- **Transacciones recurrentes** - Automatización
- **Presupuestos** - Por categoría/subcategoría
- **Reportes** - Expenses Breakdown
- **Importación CSV** - Wizard de 4 pasos
- **Invoice Scanner** - OCR para recibos

### Planeadas/Futuras

- Reportes adicionales (income, cash flow, budget vs actual)
- Exportación a PDF/Excel
- App móvil
- Integraciones bancarias
- Analytics avanzados con ML

---

## 7. Próximos Pasos

- [ ] Evaluar pricing con usuarios beta
- [ ] Definir implementación técnica de subscripciones
- [ ] Elegir payment provider (Stripe recomendado)
- [ ] Diseñar flujos de upgrade/downgrade
- [ ] Implementar sistema de feature flags por plan
- [ ] Crear página de pricing

---

## 8. Consideraciones Fiscales y Legales

### Situación actual

- **España**: Alta como autónomo (activo)
- **Chile**: Posibilidad de emitir boletas de honorarios

### Opciones para recibir pagos

| Aspecto                  | España (Autónomo)          | Chile (Boletas)          |
| ------------------------ | -------------------------- | ------------------------ |
| **Cuota fija mensual**   | ~€300/mes                  | $0 (solo % al emitir)    |
| **Retención**            | IRPF ~15-21% + IVA 21%     | 13.75% retención         |
| **Facturar a EU**        | Simple (mismo marco legal) | Posible pero menos común |
| **Facturar a LATAM/USA** | Posible                    | Más natural para LATAM   |
| **Stripe disponible**    | Sí                         | Sí                       |

### Consideración importante: Residencia fiscal

Si resides en España (+183 días/año) = **residente fiscal español**:

- Debes declarar ingresos mundiales en España
- Ingresos desde Chile también tributan en España
- Existe convenio de doble imposición Chile-España

### Estrategia recomendada por fases

| Fase           | Ingresos      | Acción                                              |
| -------------- | ------------- | --------------------------------------------------- |
| **Validación** | €0-500/mes    | Usar autónomo España (ya activo), evita complejidad |
| **Tracción**   | €500-2000/mes | Evaluar si conviene estructura adicional            |
| **Escala**     | €2000+/mes    | Considerar SL España para optimización fiscal       |

### Preguntas para el gestor

1. ¿Cómo declaro ingresos por SaaS/subscripciones desde Stripe?
2. ¿Cómo facturo a clientes fuera de EU (sin IVA)?
3. ¿Cuándo conviene pasar de autónomo a SL?
4. ¿Stripe retiene algo o debo gestionar todo?

### Payment providers compatibles con autónomo España

- **Stripe** - El más completo, buena documentación fiscal
- **Paddle** - Actúa como Merchant of Record (ellos facturan, simplifican IVA EU)
- **Lemon Squeezy** - Similar a Paddle, más simple

> **Nota sobre Paddle/Lemon Squeezy**: Al ser MoR (Merchant of Record), ellos facturan al cliente final y te pagan a ti. Simplifica IVA intracomunitario pero tienes menos control.

---

## 9. Referencias

- Competencia: YNAB, Mint, Wallet, Copilot Money
- Payment providers: Stripe, Paddle, Lemon Squeezy
- Stripe Atlas: https://stripe.com/atlas (para estructura USA si escala global)

---

_Documento creado: Marzo 2026_
_Estado: Borrador para evaluación_
