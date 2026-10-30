# Dani OS en el teléfono: interfaz nativa iOS / Android

- **Fecha:** 2026-10-29
- **Estado:** dirección y decisiones aprobadas por Daniel en conversación; pendiente de revisión del spec escrito.
- **Propuesta visual:** canvas «Dani OS Mobile» (https://claude.ai/artifact/Q6QPU1eH4Rij5XugpccBU8): arranque, bloqueo, inicio y app, en iOS y en Android, con prototipo navegable.

## 1. Intención

Hoy, en un teléfono, Dani OS es el escritorio encogido: ventanas que ocupan la pantalla entre la barra superior y el dock. Funciona, pero se siente como una web adaptada.

Lo que Daniel quiere: que un reclutador que abre el enlace desde LinkedIn en su teléfono sienta que **enciende y desbloquea un teléfono**, con la marca de Daniel, y navegue sus apps como navegaría las de su propio sistema. Si el teléfono es un iPhone, la interfaz habla el idioma de iOS; si es Android, el de Android.

Prioridad explícita de Daniel: **navegación fluida, sin fugas de memoria, saltos ni congelamientos**. Por eso, dentro de las apps del teléfono va contenido simple y nativo (listas, chat), no la órbita CSS 3D ni el grafo WebGL.

## 2. Objetivos, no-objetivos y anti-objetivos

**Objetivos**

- En un teléfono, `/` muestra una interfaz de teléfono: arranque, pantalla de bloqueo con la marca, inicio con las apps y apps con navegación nativa.
- Dos variantes («sabores») según el sistema del visitante: iOS y Android. Mismo contenido, distinto lenguaje visual y de navegación.
- El gesto «atrás» del sistema (deslizar desde el borde en Safari, gesto o botón atrás en Android) cierra la app o la pantalla de detalle, como en una app nativa.
- Ningún parpadeo de escritorio a teléfono al cargar: el HTML del servidor ya es el del teléfono.
- Sin WebGL ni CSS 3D en el teléfono.

**No-objetivos**

- Tablets: reciben el escritorio, que ya funciona en ellas (iPadOS se anuncia como Mac).
- Réplica pixel a pixel de iOS o Android, ni sus iconos, fuentes (SF Pro, Roboto) o fondos.
- App nativa o empaquetada (Capacitor, React Native).
- Cambiar el escritorio: en escritorio todo sigue igual.

**Anti-objetivos (fallaría aunque funcione)**

- Que se vea como un clon de iOS: es Dani OS hablando el idioma de cada sistema, no Apple ni Google.
- Que el arranque o el bloqueo se vuelvan una barrera: un reclutador con prisa debe llegar al contenido en un toque.
- Saltos de layout, congelamientos o memoria creciente al abrir y cerrar apps repetidamente.
- Barras falsas duplicadas: el teléfono real ya tiene su barra de estado y su indicador de inicio.

## 3. Experiencia

### 3.1 Recorrido

1. **Arranque** (solo al entrar por `/`, una vez por sesión): logo y barra de progreso (iOS) o cuatro puntos con los colores de la marca y «dani os» (Android). Unos 2,6 s, se salta con un toque. Con «reducir movimiento» no se muestra.
2. **Bloqueo**: hora y fecha reales, «Disponible para nuevos retos», dos notificaciones que hacen de gancho (Mi IA, NEXA en producción) y dos accesos directos (Mi IA, Perfil y CV). Se desbloquea deslizando hacia arriba o con un botón real («Desliza hacia arriba para abrir» / «Toca para desbloquear»). Tocar una notificación o un acceso directo desbloquea y abre esa app.
3. **Inicio**: widget de perfil (nombre, rol, disponibilidad, botón CV), las apps y, en Android, la barra «Pregúntale a mi IA» abajo; en iOS, la píldora «Pregúntale a mi IA» sobre el dock.
4. **App**: barra de navegación nativa (iOS: «‹ Inicio» y título grande; Android: barra superior con flecha y título) y contenido simple (§3.3).

Un enlace directo (`/projects`, `/terminal`…) abre el teléfono con esa app, sin arranque ni bloqueo. Su botón «Inicio» (iOS) o su flecha (Android) navegan a `/`. El gesto atrás del sistema, sin historial previo, sale del sitio como en cualquier enlace profundo nativo: no se insertan entradas falsas en el historial (decisión de diseño, tomada al revisar el spec).

### 3.2 Apps del teléfono

| App         | Cómo se abre                                                         | Notas                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyectos   | dock                                                                 |                                                                                                                                                                                              |
| Mi IA       | dock, barra o píldora de búsqueda, notificación, acceso directo      |                                                                                                                                                                                              |
| Perfil y CV | dock, widget, acceso directo; el icono «CV» de la cuadrícula también |                                                                                                                                                                                              |
| Contacto    | dock                                                                 |                                                                                                                                                                                              |
| Guía        | cuadrícula del inicio                                                | Sustituye al recorrido de bienvenida: lista corta que presenta cada app y la abre. Es una hoja modal sobre el inicio, sin URL, con botón de cerrar y cierre con Escape (decisión de diseño). |

### 3.3 Contenido simple por app

- **Proyectos**: lista agrupada («En producción», «Ideas») con nombre, resumen y etiqueta (`projectLabels`). Tocar un proyecto empuja una pantalla de detalle con lo que hoy muestra `ProjectDetail` (audiencia, papel de la IA, stack, valor, enlace si es `live`), sin `clip-path` ni CSS 3D.
- **Mi IA**: solo el chat, **con un único intercambio, como hoy** (decidido por Daniel): la pregunta nueva reemplaza a la anterior. Reutiliza `useAskStore` y el comportamiento de `AskPanel` (preguntas sugeridas, streaming, «(Modo sin conexión)»), sin `TerminalGraph`; el store no cambia. Se presenta como una burbuja de pregunta y una de respuesta. El campo de pregunta queda abajo, sobre el teclado.
- **Perfil y CV**: el `ProfileCv` actual ya es DOM simple; se reutiliza si encaja en la pantalla de app sin cambios estructurales.
- **Contacto**: `ContactApp` actual, en las mismas condiciones.

### 3.4 Lenguaje por sistema

|            | iOS                                           | Android                                              |
| ---------- | --------------------------------------------- | ---------------------------------------------------- |
| Iconos     | cuadrado redondeado, fondo del tono de la app | círculo, fondo `surface-raised` y trazo del tono     |
| Navegación | «‹ Inicio», título grande                     | flecha atrás, título en barra superior               |
| Listas     | grupos con fondo continuo y separadores       | tarjetas separadas                                   |
| Abrir app  | crece desde el icono                          | fundido                                              |
| Bloqueo    | hora centrada                                 | hora apilada a la izquierda, huella para desbloquear |

Todo con los tokens de `globals.css` y las tres fuentes actuales; ningún color nuevo fuera de tokens.

## 4. Decisiones técnicas

### 4.1 Un dominio nuevo: `phone`

`phone` es una segunda interfaz, hermana de `desktop`, con `feature`, `ui`, `data-access` (si hace falta) y `util`. Igual que `desktop`, **no importa otros dominios**: `src/app/_components` le pasa el contenido de cada app.

Por qué un dominio y no una carpeta de `desktop`: el teléfono no comparte ventanas, store, dock ni recorrido; meterlo en `desktop` mezcla dos responsabilidades.

### 4.2 El registro de apps pasa a `shared`

`APPS`, `AppId`, `APP_IDS`, `getAppIdByPathname`, `DESKTOP_HREF` y `shouldActivateFromClick` salen de `desktop/util` a `shared/util`. Las dos interfaces los usan; si `phone` importara `@/desktop`, una interfaz dependería de la otra. Los ids de DOM del dock (`getDockItemId`, `getWindowId`, `DOCK_ID`) se quedan en `desktop`. `@/desktop` deja de reexportar `APPS` y `AppId`; quien los importe de allí pasa a `shared`.

Guía no entra en `APPS`: es un acceso propio del teléfono.

### 4.3 Detección en el servidor

Una función pura en `shared/util` (o `core`), con tests, recibe el resultado de `userAgent()` de `next/server` y devuelve el perfil del dispositivo: `desktop`, `ios` o `android`.

- `device.type === 'mobile'` y `os.name` iOS → `ios`; Android → `android`; otro móvil → `android` (decisión del builder si prefiere `ios`).
- Tablet, desconocido o bot → `desktop`.
- `?device=ios|android|desktop` fuerza el perfil, para previsualizar desde un ordenador y depurar.
- **Despliegue gradual** (decidido por Daniel): cada sabor llega a producción solo cuando está completo. En la entrega 1, la detección devuelve `desktop` para Android (salvo `?device=android`), así que los Android siguen viendo el escritorio de hoy. La entrega 2 activa Android.

Las páginas (`/` y las cuatro de apps) leen el perfil en el servidor y renderizan `Desktop`/`StandalonePage` o `Phone`. Por qué no en el cliente con `matchMedia`: el servidor pintaría el escritorio y luego saltaría al teléfono (parpadeo, HTML distinto en la hidratación, Lighthouse midiendo otra página).

Costo aceptado: leer cabeceras hace esas páginas dinámicas (render por petición). Render corre una instancia sin CDN delante, así que no hay caché que se rompa por `User-Agent`. **Plan B** si Lighthouse lo nota: `proxy.ts` reescribe a `src/app/[device]/…` con las tres variantes prerenderizadas; más estructura, por eso no es el punto de partida.

### 4.4 La URL es el estado

- `/` = inicio; `/projects`, `/terminal`, `/about`, `/contact` = esa app abierta. El teléfono deriva qué mostrar de `usePathname()`; **no hay store de ventanas** ni `routeLandings`: solo hay una app a la vez y la URL no puede desincronizarse de sí misma.
- Se reutilizan las rutas interceptadas de `src/app/@window`: abrir una app desde el inicio no desmonta el teléfono, y así puede animar la transición.
- Entrar directo a `/projects` en un teléfono renderiza `Phone` con esa app (no `StandalonePage`). Su botón «Inicio» o su flecha navegan a `/`; el gesto atrás del sistema sigue el historial real (§3.1).
- **Detalle de proyecto**: la pantalla de detalle se empuja con un parámetro de búsqueda (`/projects?project=nexa`, vía `history.pushState`, que Next sincroniza con `useSearchParams`), para que el gesto atrás la cierre. Hay que verificar pronto que convive con la ruta interceptada; si no, una ruta `/projects/[id]`.
- Se mantiene la regla del proyecto: nunca se navega a la ruta actual; los enlaces deciden su clic con `shouldActivateFromClick`.
- No hay deslizar-para-volver propio: el del navegador ya existe y chocaría.

### 4.5 Arranque y bloqueo

No son rutas: son estado de sesión del teléfono. Se muestran solo al cargar `/` y una vez por sesión (`sessionStorage`, con `try/catch`: sin almacenamiento, se muestran y ya). Con «reducir movimiento», sin arranque. El bloqueo es un `region` con su botón real de desbloqueo; el gesto de deslizar es un atajo, nunca el único camino.

### 4.6 Lo que el teléfono no carga

`DesktopScene` (three), `ExperienceGraph`, `ProjectOrbit`, ventanas, `TopBar`, Ventanas y `OnboardingTour`. Ninguno debe entrar en el bundle del teléfono: el shell del teléfono no importa nada que importe `three`, y las versiones simples de las apps no importan la órbita ni el grafo.

### 4.7 Integración con el navegador

- Sin barra de estado ni indicador de inicio falsos (los del mockup son solo del mockup).
- `viewport-fit=cover` y márgenes con `env(safe-area-inset-*)`; alto con `dvh`; `overscroll-behavior` para que el rebote no mueva la interfaz.
- `theme-color` con el token del fondo, para que la barra del navegador se funda con el teléfono.
- Manifest de app web (instalable, `display: standalone`) en la última entrega: instalada, desaparece la barra del navegador.

### 4.8 Fluidez y fugas (requisito de Daniel)

- Transiciones solo con `transform`, `opacity` y `clip-path`, con Motion y las constantes de `shared/util/motion.ts`; `MotionProvider` ya aplica «reducir movimiento».
- Una app cerrada se desmonta (sin pantallas ocultas vivas). El store de Mi IA no vive en el componente, así que su último intercambio se conserva.
- Temporizadores, listeners de puntero y suscripciones se limpian al desmontar; el arranque cancela su temporizador si se salta.
- Prueba de humo: abrir y cerrar cada app 20 veces en e2e sin errores en consola; medir a mano la memoria en DevTools antes de cerrar la entrega 1.

### 4.9 Calidad

- Un spec nuevo del teléfono corre con un perfil de iPhone desde la entrega 1 y con el Pixel 7 desde la entrega 2. Los flujos críticos: desbloquear, abrir cada app, preguntar a la IA (con `answerWithStream`), abrir un detalle de proyecto y volver con «atrás», enlace directo a una app. El `e2e/mobile.spec.ts` actual (escritorio en un Pixel) se mantiene hasta la entrega 2, que lo reemplaza.
- `e2e/accessibility.spec.ts` añade cada estado nuevo en los dos sabores: arranque, bloqueo, inicio, cada app y el detalle de proyecto.
- `e2e/support.ts`: `openPhone(page)` análogo a `openDesktop`, que arranca con la sesión ya desbloqueada salvo que el test pida lo contrario.
- **Lighthouse en dos pasadas** (decisión de diseño): Lighthouse móvil envía un user agent de Android, así que desde la entrega 2 mediría solo el teléfono y el escritorio (WebGL, órbita, grafo) perdería su control. Se añade una pasada con el preset de escritorio, con los presupuestos de hoy (0.8 / 0.85 / 0.7), y la pasada móvil recibe presupuestos propios del teléfono. Ambas desde la entrega 2, cuando el móvil empieza a medir el teléfono.
- `CLAUDE.md` se actualiza con las decisiones de este documento.

## 5. Entregas

1. **Base + iOS**: registro de apps a `shared`, detección con tests (Android aún recibe escritorio), `Phone` con inicio, Guía y apps (Proyectos lista y detalle, Mi IA, Perfil, Contacto) en sabor iOS, navegación por URL, e2e y axe del iPhone. Ya en producción para iPhone.
2. **Android**: el sabor Android de todas las pantallas, la detección lo activa, e2e y axe del Pixel (reemplaza el `mobile.spec.ts` actual), Lighthouse en dos pasadas.
3. **Arranque y bloqueo**, con sesión y «reducir movimiento».
4. **Pulido**: transiciones (crecer desde el icono en iOS, fundido en Android), `theme-color`, manifest, ajuste final de los presupuestos móviles de Lighthouse.

## 6. Lo que queda al builder

- Nombres de componentes y archivos dentro de `phone`, y cómo se reparten los sabores (variantes `cva` donde solo cambia el estilo, componentes separados donde cambia la estructura).
- Qué exporta cada dominio para su versión simple (p. ej. `ProjectsPhoneApp`, `TerminalChat`) y el mapa de contenido del teléfono en `src/app/_components`.
- El sabor por defecto para un móvil que no es iOS ni Android.
- Textos exactos de la pantalla de bloqueo y de Guía, partiendo del canvas.
