# One Joyería — Frontend (Angular)

Interfaz del sistema de inventario de One Joyería. Consume la API REST del backend Spring Boot (`OneJoyeria_Backend`) con `HttpClient`.

- **Puerto:** 4200 → `http://localhost:4200`
- **API que consume:** `http://localhost:8089/api` (se cambia en `src/environments/environment.ts`)
- **Login de prueba:** usuario `admin`, contraseña `admin`

## Cómo ejecutarlo

Requisitos: **Node.js 20.19 o superior** (recomendado 22 LTS) y el backend en ejecución.

```
npm install
npm start
```

`npm start` ejecuta `ng serve`. Abre `http://localhost:4200`. La primera vez `npm install` tarda unos minutos.

Si tienes Angular CLI instalado (`npm install -g @angular/cli`), también puedes usar `ng serve`.

## Estructura

```
src/app/
├── models/          Interfaces de los datos que llegan del backend (producto.ts, movimiento.ts, proveedor.ts…)
├── services/        Servicios con HttpClient que llaman a la API
│   ├── producto.ts      listar(), obtener(), crear(), actualizar(), eliminar(), registrarMovimiento()
│   ├── proveedor.ts     CRUD de proveedores
│   ├── movimiento.ts    entradas y salidas para reportes
│   ├── catalogo.ts      panel, categorías y materiales
│   └── auth.ts          inicio y cierre de sesión
├── components/      Una carpeta por pantalla (.ts + .html)
│   ├── login/  layout/  panel/  inventario/  pieza-detalle/  pieza-form/
│   ├── proveedor-list/  proveedor-detalle/  proveedor-form/  alertas/  reportes/  reporte-imprimir/
│   └── compartido/      piezas reutilizables: diálogos, tablas, íconos, estado
├── guards/auth-guard.ts            Sólo deja entrar si hay sesión iniciada
├── interceptors/responsable.ts     Agrega el nombre del usuario a cada petición
├── utils/formato.ts                Soles, fechas en español y mensajes de error
├── app.routes.ts                   Rutas de la aplicación
└── app.config.ts                   provideHttpClient y provideRouter
```

## Puntos clave para explicar

- **Interfaces en `models/`:** sólo describen la forma del JSON que envía el backend; no necesitan métodos ni constructor.
- **Servicios con `inject(HttpClient)`:** cada método devuelve un `Observable`. Por ejemplo, `eliminar(codigo)` hace `DELETE /api/productos/{codigo}` y devuelve `Observable<void>` porque el backend responde 204 sin contenido.
- **Componentes con signals:** al abrirse, `ngOnInit()` llama al servicio y se suscribe; si responde bien guarda los datos en un `signal` y la tabla se actualiza; si falla muestra el mensaje de error (por ejemplo, cuando el backend está detenido).
- **Plantillas con `@for` y `@if`:** recorren las listas y muestran los estados de carga, vacío y error.
- **Eliminar:** pide confirmación en un diálogo; si la API responde 204, la pieza desaparece de la lista sin recargar la página.

## En GitHub Codespaces

1. En `src/environments/environment.ts` cambia `apiUrl` por la URL pública del backend: `https://TU-CODESPACE-8089.app.github.dev/api`.
2. Ejecuta `npm install` y `npm start`, y abre el puerto 4200 desde la pestaña **Puertos**.
