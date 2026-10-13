# Hoja de ruta — ComandaPOS

- [x] **Fase 0 — Tailwind**
  - [x] Diagnóstico: faltaba `@import "tailwindcss";` en `index.css`.
  - [x] Bug en `vite.config.ts`: import mal escrito (`tailwindcss/vite` en vez de `@tailwindcss/vite`).
  - [x] Limpieza del CSS y JSX de plantilla del scaffold de Vite (`App.css`, assets de ejemplo, contador de prueba).
  - [x] Verificado con una clase de prueba (`text-red-500`) antes de borrarla.

- [x] **Fase 1 — Esqueleto**
  - [x] Decisión: quedarse con `oxlint` (ya instalado) + añadir `prettier`, en vez de montar ESLint desde cero.
  - [x] Carpetas por feature: `features/auth`, `features/camarero`, `features/cocina`, `features/admin`, `lib`.
  - [x] Instalado `react-router-dom`.
  - [x] `BrowserRouter` envolviendo `<App />` en `main.tsx`.
  - [x] `Routes`/`Route` iniciales en `App.tsx` (placeholders por zona).

- [x] **Fase 2 — Supabase**
  - [x] Decisión: esquema como migraciones SQL versionadas (Supabase CLI), no tablas creadas a mano — para poder repetir el mismo esquema en cada restaurante nuevo.
  - [x] CLI instalado como devDependency (no global), `supabase init`.
  - [x] Migración inicial: 7 tablas (`restaurant_settings`, `camareros`, `mesas`, `platos`, `comandas`, `comanda_mesas`, `comanda_lineas`), enums en español, RLS activado pero permisivo (`using (true)`) de momento.
  - [x] Aplicada a mano por el SQL Editor del panel (no por `supabase db push` — fricción con el login interactivo del CLI, se descartó esa vía).
  - [x] `@supabase/supabase-js` instalado, cliente en `src/lib/supabase.ts`.
  - [x] `.env` con `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (nunca la secret key), añadido a `.gitignore`.
  - [x] Conexión probada desde `CamareroPage` con una consulta de prueba.

- [x] **Fase 3 — Autenticación**
  - [x] Decisión de seguridad: verificar el PIN dentro de Postgres (función `security definer`), nunca comparando hashes en el cliente.
  - [x] Funciones `verificar_pin_camarero`/`verificar_pin_admin` con `pgcrypto` (`crypt`/`gen_salt`) — bug encontrado y arreglado: `search_path` necesita incluir `extensions`, no solo `public` (Supabase instala pgcrypto ahí).
  - [x] Store de sesión con `zustand` (`sesionStore`): `null` | camarero (`id`+`nombre`) | admin.
  - [x] Primer diseño del login: formulario con `react-hook-form` + debounce (adivinar camarero/admin por longitud del PIN tras una pausa al teclear).
  - [x] Bug real encontrado en pruebas: el PIN de admin de prueba compartía prefijo con el de un camarero → al escribir el de admin, se colaba como login de camarero a mitad.
  - [x] Decisión: abandonar la detección por tiempo — teclado numérico explícito (sin `react-hook-form`), con `useState` + `useEffect` que verifica automáticamente en cuanto el PIN llega a 4 o 6 dígitos (sin botón "Entrar", sin ambigüedad de tiempos).
  - [x] Componente `BotonTeclado` extraído (evitar repetir estilos en los 11 botones).
  - [x] Indicador visual de progreso del PIN (puntos rellenos/vacíos), con el mismo ancho que el teclado.
  - [x] Input físico oculto (`opacity-0` + `pointer-events-none`) para que el teclado real también funcione, en paralelo a los botones en pantalla — parche pendiente de mejorar (ver más abajo).
  - [x] `ProtectedRoute`: redirige a `/` si no hay sesión.
  - [x] Icono de "Delete" (lucide-react) para el botón de borrar.
  - [x] Fondo cálido (`index.css`, degradado crema→beige) y color de acento vino (`--accent`) conectados a Tailwind vía `@theme`.

- [ ] **Fase 4 — Zona Camarero** (en curso)
  - [x] Datos de prueba en `mesas` y `platos`.
  - [x] `QueryClientProvider` (react-query) envolviendo la app.
  - [x] Hook `useMesas()` y `usePlatos()` con `useQuery`.
  - [x] Listado simple de mesas en `CamareroPage` (sin plano visual todavía, sin estilo propio).
  - [x] Selección múltiple de mesas → comanda conjunta (toggle de modo + resaltado de seleccionadas).
  - [x] Modal de comensales (sin diseño todavía): `crear_comanda` (RPC, transacción: comanda + comanda_mesas + marca mesas) o `buscar_comanda_abierta` (RPC) si la mesa ya tenía comanda activa.
  - [ ] **Comanda por categorías** (en curso)
    - [x] `ComandaPage` agrupa platos por categoría y los lista (sin estilo).
    - [x] Hook `useAgregarLinea` — ya no es un `insert` simple: se cambió a la función `agregar_linea` (RPC) para que sumar cantidad sobre una línea pendiente existente sea atómico (evita condición de carrera si se toca el mismo plato dos veces seguidas muy rápido).
    - [x] Conectado el click en cada plato del menú a `useAgregarLinea`.
    - [x] Hook `useLineasComandas(comandaId)` (`useQuery`, lee `comanda_lineas` + `platos(nombre, precio)` vía join embebido de Supabase).
    - [x] Pintado lo ya pedido en `ComandaPage`, distinguiendo "Enviat"/"Pendent".
    - [x] Control de cantidad por línea: `useQuitarUnidad` — resta 1 si `cantidad > 1`, borra la línea si es la última unidad; protegido en el propio `update`/`delete` con `.eq("enviado_a_cocina", false)` para no tocar nunca una línea ya enviada. Botón solo visible en líneas pendientes.
    - [x] Botón "Enviar a cocina" (`useEnviarCocina`, marca `enviado_a_cocina`/`enviado_at` en todas las líneas pendientes de la comanda de golpe; botón solo visible si queda algo pendiente, vía `.some(...)`).
  - [ ] **Cuenta y cobro**
    - [ ] Calcular el total (suma de líneas).
    - [ ] "Pedir la cuenta" → mesa(s) a `cuenta_pedida`.
    - [ ] "Cobrar" → comanda a `cobrada` + `cerrada_at`, mesa(s) a `libre`.
  - [ ] **Diseño visual pendiente** (una vez la lógica de arriba funcione entera):
    - [ ] **Login**: pulir el teclado (sombras, estado al pulsar), feedback visual de "PIN incorrecto" (ahora mismo se borra en silencio, sin avisar de nada), logo/nombre del restaurante arriba (el mockup lo lleva).
    - [ ] **CamareroPage**: el listado de mesas es una `<ul>` de texto plano — falta convertirlo en tarjetas, con color según `estado` (libre/abierta/cocina/cuenta_pedida), diseño del botón de modo selección, layout general (cabecera, espaciados).
    - [ ] **ComandaPage**: no tiene ningún estilo todavía — menú por categorías como tabs o secciones con tarjetas de plato (nombre+precio), zona de "lo que llevas pedido" tipo resumen/carrito, botón de enviar a cocina con buen feedback.
    - [ ] Indicador visual (icono/color) de enviado vs pendiente en cada línea de la comanda.
  - [ ] Plano visual con posiciones/colores por estado (al final, sustituyendo el listado simple).

- [ ] **Fase 5 — Cocina**
  - [ ] Instalar y configurar `qz-tray`.
  - [ ] Diseñar el formato del tique (agrupado por mesa, qué datos lleva).
  - [ ] Al "Enviar a cocina": generar tique solo con líneas pendientes de platos con `imprime_a_cocina: true`.
  - [ ] Manejo de errores de impresión (impresora apagada, QZ Tray no conectado) — aviso con `sonner`.
  - [ ] Tique de cuenta (distinto al de cocina) al pedir/cobrar.

- [ ] **Fase 6 — Realtime**
  - [ ] Suscripción Realtime a `mesas`.
  - [ ] Suscripción a `comandas`/`comanda_lineas`.
  - [ ] Conectar cada suscripción con `queryClient.invalidateQueries`.
  - [ ] Probar con 2 pestañas/dispositivos a la vez.

- [ ] **Fase 7 — Admin**
  - [ ] Rediseño del login: selección de camarero por avatar (mockup original) + PIN dirigido — aplicar la migración pendiente `ajustar_verificar_pin_camarero.sql`.
  - [ ] Acceso admin como enlace aparte, no mezclado con el teclado de camarero.
  - [ ] Pantalla intermedia tras PIN admin: panel de administración o modo camarero.
  - [ ] Resolver cómo actúa el admin en "modo camarero" (ver `decisiones.md`).
  - [ ] Gestión de camareros: listado, alta (PIN hasheado vía función Postgres), cambio de PIN, desactivar.
  - [ ] Gestión de platos: listado, alta, editar, categoría, stock inicial, `imprime_a_cocina`.
  - [ ] Aviso de stock bajo/agotado.
  - [ ] Editor del plano de mesas: posición (`@dnd-kit`), tamaño, forma.
  - [ ] Balance de ventas por día/rango (total, por plato, por camarero, nº mesas).
  - [ ] Exportar balance a PDF (`react-to-print`).
  - [ ] Seguridad: cambio de PIN largo, email de recuperación.
  - [ ] Diseño visual de todas las pantallas de Admin.

- [ ] **Fase 8 — PWA**
  - [ ] `vite-plugin-pwa`, `registerType: 'autoUpdate'`, aviso de actualización disponible.
  - [ ] Caché diferenciada (app shell agresivo, Supabase sin caché/`NetworkFirst`).
  - [ ] Manifest plantilla por instalación.
  - [ ] Instalar `sonner`, aviso de "sin conexión".
  - [ ] Probar instalación real en tablet Android/iOS.

- [ ] **Fase 9 — i18n, plantilla y despliegue para CRIT**
  - [ ] Instalar `react-i18next`, extraer todos los textos hardcodeados a archivos de traducción (deuda: se decidió "todo en castellano" para ir rápido, pero el briefing exige textos nunca hardcodeados).
  - [ ] Traducir a català para CRIT.
  - [ ] Rellenar `restaurant_settings` real de CRIT.
  - [ ] Generar manifest de esa instalación.
  - [ ] Desplegar (Vercel/Netlify), HTTPS, variables de entorno de producción.
