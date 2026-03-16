## Planner frontend gamificado

Estructura base de un proyecto **Next.js (App Router)** para un planner gamificado con misiones y sistema de XP.

### Scripts

- `npm run dev`: arranca el servidor de desarrollo.
- `npm run build`: genera el build de producción.
- `npm run start`: ejecuta el servidor en modo producción.
- `npm run lint`: ejecuta ESLint.
- `npm run test`: ejecuta Jest (tests en `tests/`).

### Estructura principal

- `app/`: páginas con App Router (`layout.tsx`, `page.tsx`, `login`, `dashboard`, `missions`…).
- `components/`: componentes UI, misiones y gamificación.
- `hooks/`: hooks personalizados (`useAuth`, `useMissions`, `useXP`).
- `services/`: acceso a API, auth, misiones y AI.
- `lib/`: inicialización de clientes externos (Supabase) y utilidades.
- `styles/`: estilos globales (`globals.css`).
- `tests/`: pruebas básicas Jest.
- `.github/workflows/`: workflow de CI/CD (`deploy.yml`).

