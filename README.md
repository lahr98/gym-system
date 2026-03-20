# 🏋️ Gym System

Sistema de gestión integral para gimnasios con soporte multi-sucursal.

## 📋 Descripción

Plataforma web interna para la administración de clientes, membresías, pagos,
control de acceso y clases. Diseñada para ser usada por el staff del gimnasio.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Backend | Node.js + Hono |
| ORM | Drizzle |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Better Auth |
| Monorepo | pnpm workspaces |

## 📁 Estructura del Proyecto

\`\`\`
gym-system/
├── apps/
│   ├── web/          → Frontend React + Vite
│   └── api/          → Backend Hono
├── packages/
│   └── db/           → Esquema Drizzle compartido
├── pnpm-workspace.yaml
└── package.json
\`\`\`

## 🧩 Módulos

- **Clientes** → Registro, historial y gestión de miembros
- **Membresías** → Planes, vencimientos y acceso multi-sucursal
- **Pagos** → Registro de cobros en efectivo, transferencia y tarjeta
- **Acceso** → Check-in de clientes por sucursal
- **Clases** → Horarios, instructores y control de cupo
- **Dashboard** → Reportes e indicadores clave del negocio

## 👥 Roles de Usuario

| Rol | Permisos |
|-----|---------|
| Dueño | Acceso total + reportes financieros |
| Recepcionista | Check-in, cobros y registro de clientes |
| Entrenador | Gestión de sus clases |

## 🛠️ Instalación

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/lahr98/gym-system.git
cd gym-system

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Iniciar en desarrollo
pnpm dev
\`\`\`

## 🌿 Ramas

| Rama | Propósito |
|------|----------|
| `main` | Producción estable |
| `develop` | Integra