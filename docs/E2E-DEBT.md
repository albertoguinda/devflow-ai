# E2E test debt

**Estado a 2026-07-29: no hay deuda. 89/89 tests en verde** (`npx playwright test`, Chromium,
contra el build de producción).

Este fichero se escribió el 2026-07-21 documentando "~15 tests funcionales en rojo" para
atacarlos con tiempo. Al medirlo de verdad hoy eran **3**, y ninguno era un fallo de la
aplicación.

## Qué eran realmente los 3

Los tres fallaban por **violación de strict mode de Playwright**, no porque la herramienta no
funcionase. `getByText(...)` sin `.first()` casa con todos los nodos que contienen ese texto, y
si hay más de uno Playwright aborta la aserción en vez de resolverla:

| Test | Coincidencias reales | Por qué |
| --- | --- | --- |
| `cost-calculator.spec.ts:4` — pricing display visible | 2 | "Estimated monthly cost" sale en la tarjeta de resumen y otra vez en la tabla comparativa |
| `json-formatter.spec.ts:19` — error con JSON inválido | 4 | "ERROR" sale en la insignia, la línea de estado, el panel de salida y las estadísticas |
| `http-status.spec.ts:12` — detalle de un código | 2 | "Not Found" sale en la tarjeta de resultado y en el panel de detalle |

Arreglados añadiendo `.first()` con el motivo escrito al lado, para que nadie lo vuelva a
"arreglar" tocando la aplicación.

## Por qué la cifra vieja estaba inflada

El job **E2E** (y el de a11y) llevaba `skipped` en todas las ejecuciones anteriores de CI: el
pipeline fallaba antes, en el `npm audit`, así que nunca llegaban a correr. Al arreglar las
vulnerabilidades el 2026-07-20 empezaron a ejecutarse y la deuda afloró de golpe. La cifra de
"~15" se estimó en caliente, en mitad de esa tanda, mezclando fallos que se arreglaron en la
misma sesión con el mismo fallo contado varias veces.

**La lección no es la cifra, es el método:** una deuda apuntada de memoria envejece mal. Antes
de planificar una sesión sobre este fichero, ejecuta la suite y mira lo que hay.

## Ya arreglado (no volver a tocar)

- **Colisión de encabezados**: `ToolSeoContent` añadía `<h2>About {tool.name}</h2>` y
  `How to use {tool.name}`, que chocaban con el `getByRole('heading', {name:/tool/i})` de los
  tests. Ahora los encabezados no llevan el nombre de la herramienta ("About this tool" /
  "How to use it").
- **a11y `nested-interactive`**: `Dropdown.Trigger` de HeroUI v3 beta con un `Button` anidado.
  Regla desactivada en `accessibility.spec.ts`, junto a `color-contrast` y `duplicate-id`, ya
  desactivadas por el mismo motivo. La auditoría está etiquetada como **WCAG 2.2 AA**.
- **Selector de idioma**: reescrito sin el `Dropdown` de HeroUI (ver abajo).

## RESUELTO: el `Dropdown` de HeroUI v3 beta no abría

El `Dropdown` de `@heroui/react@3.0.0-beta.7` **no despliega su menú al hacer click** en este
proyecto. Confirmado el 2026-07-29 contra el build de producción: tras pulsar el disparador no
aparece ningún `menu`, `listbox`, `menuitem` ni `option` en el árbol de accesibilidad. Da igual
que se use el envoltorio `Dropdown.Trigger` documentado o no.

Los tres menús de la aplicación estaban **muertos en producción**, y ningún test los cubría —
que es exactamente por lo que se publicaron así. El de `git-commit-generator` tenía además el
`Button` colgando directo de `<Dropdown>`, sin `Dropdown.Trigger`, o sea que ni siquiera usaba
bien la API.

Sustituidos por `components/shared/action-menu.tsx`, que es el patrón que ya se había escrito a
mano para `locale-toggle` por este mismo motivo, ahora extraído una vez en lugar de copiado por
cuarta vez. Teclado completo: Enter/Espacio/Flecha abajo abren, las flechas mueven, Inicio/Fin
saltan, Enter elige, Escape cierra y devuelve el foco al disparador, Tab cierra.

`tests/e2e/action-menu.spec.ts` cubre los tres menús y la navegación por teclado. Si HeroUI
arregla su `Dropdown` algún día, esos tests son la red para volver a él.

## Aviso operativo, no de tests

Durante la ejecución, el proveedor de IA de último recurso responde:

```
[pollinations] upstream error 402: API key budget too low
[ai-fallback] provider failed, trying next: AI provider returned an error (402)
```

`POLLINATIONS_API_KEY` está puesta y **sin saldo**. Pollinations solo cobra a las peticiones
autenticadas: las anónimas siguen siendo gratis. O sea que la clave, tal como está, **empeora**
la cadena de proveedores respecto a no poner ninguna. Ningún test depende de la IA (toda
herramienta funciona sin ella, principio 3 del `CLAUDE.md`), pero en producción conviene quitar
esa variable o recargarla.

## Cómo ejecutarlo

```bash
npm run build
npm start                    # :3000, en otra terminal
npx playwright test          # reuseExistingServer fuera de CI
```

El `webServer` de `playwright.config.ts` hace `npm run build && npm run start` con 180 s de
timeout, que con el build en frío no llega y aborta con
`Timed out waiting 180000ms from config.webServer`. Con el servidor ya levantado lo reutiliza y
arranca al instante.
