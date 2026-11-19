# VetCare — Frontend Web

Aplicación web (**SPA**) del **Sistema Integral de Gestión Veterinaria y Portal de Clientes (VetCare)**, desarrollada en **React + TypeScript + Vite** como Proyecto Integrador de la **Universidad Nacional de Hurlingham (UNAHUR)**.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Portales y Funcionalidades](#portales-y-funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Mapa de Rutas](#mapa-de-rutas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Equipo de Desarrollo](#equipo-de-desarrollo)

---

## Descripción General

El frontend de **VetCare** consume la API REST del backend y ofrece dos experiencias diferenciadas a partir del rol autenticado (RBAC):

1. **Portal del Tutor (Mobile-First):** Diseñado para que los clientes autogestionen el perfil de sus mascotas, soliciten o cancelen turnos, consulten recetas digitales, compartan el carnet de vacunación mediante código QR y abonen sus órdenes de facturación.
2. **Portal Profesional y Administrativo (Desktop-First):** Diseñado para maximizar la velocidad operativa de veterinarios y recepción en una sola vista de atención clínica (SOAP + posología + consumo de stock + facturación), reduciendo la navegación innecesaria entre pestañas.

---

## Portales y Funcionalidades

### Portal del Tutor (Rol `cliente`)
- **Registro e Inicio de Sesión:** Autenticación persistida con verificación de sesión contra `/api/auth/me`.
- **Gestión de Mascotas (`/mascotas`):** Listado de pacientes con creación, edición inline mediante modal (`EditPetModal`) y eliminación con borrado lógico (`DeletePetModal`).
- **Ficha Médica y Carnet QR (`/mascotas/:id`):** Acceso al historial clínico SOAP, archivos médicos adjuntos, registro de vacunas/desparasitaciones y generación de código QR único (`qrcode.react`) con acceso público (`/carnet/:token`).
- **Turnos y Pagos (`/mis-turnos`, `/turnos/nuevo`):** Solicitud de turnos en franja horaria laboral (08:00 a 20:00 hs), reprogramación, cancelación y pago directo de órdenes de facturación vinculadas a consultas atendidas.
- **Mis Recetas (`/recetas`):** Consulta de tratamientos activos y finalizados con detalle posológico.

### Portal Profesional / Administrativo (Roles `profesional`, `admin`, `recepcion`)
- **Agenda Diaria de Turnos (`/profesional/turnos`):** Bandeja de turnos filtrable con gestión de estados y acceso rápido a la atención médica.
- **Tablero Kanban de Triage (`/profesional/triage`):** Monitor de guardia en 4 columnas (*Consulta Programada*, *Urgencia Moderada*, *Emergencia Crítica*, *Internación / Quirófano*) con Drag & Drop (actualización optimista), cálculo de tiempo de espera, ingreso directo de urgencias y actualización periódica automática.
- **Atención Clínica Unificada SOAP (`/profesional/atencion`):**
  - Registro clínico SOAP (*Subjetivo*, *Objetivo*, *Análisis*, *Plan*) y constantes vitales.
  - Calculadora posológica dinámica basada en peso corporal y concentración.
  - Descuento fraccionado de farmacia por lote bajo criterio **FEFO** (con restricción entera para comprimidos).
  - Carga de servicios/productos facturables en el mismo flujo.
- **Auditoría Clínica (`/profesional/mascotas/:id`):** Enmiendas clínicas con motivo obligatorio, historial de versiones con hash SHA-256 y visor comparativo de cambios (`ClinicalDiffTable`).
- **Alertas de Farmacia (`/profesional/alertas-stock`):** Panel de insumos bajo stock mínimo, agotados, vencidos y próximos a vencer.
- **Facturación y Caja (`/facturacion/ordenes`):** Emisión de órdenes 1:1 desde consultas pendientes, gestión de catálogo de servicios y control de cobros.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Biblioteca de interfaces de usuario |
| **TypeScript** | `~6.0.2` | Tipado estático y contratos de datos |
| **Vite** | `^8.3.0` | Bundler y servidor de desarrollo rápido |
| **React Router DOM** | `^7.18.3` | Enrutamiento SPA y protección de rutas por rol |
| **Bootstrap** | `^5.3.8` | Sistema de grillas, utilidades responsivas y componentes |
| **qrcode.react** | `^4.2.0` | Generación de códigos QR para carnets de vacunación |
| **oxlint** | `^1.81.0` | Linter ultrarrápido de código |

---

## Estructura del Proyecto

```text
proyecto-integrador-veterinaria-frontend/
├── public/                      # Recursos estáticos públicos
├── src/
│   ├── components/
│   │   ├── common/              # Componentes reutilizables (Modales, Spinners, EmptyState, BackButton)
│   │   ├── consultations/       # Tarjetas SOAP, auditoría clínica, enmiendas y ClinicalDiffTable
│   │   ├── pets/                # PetCard, EditPetModal y DeletePetModal
│   │   ├── triage/              # TriageCard, NewTriageModal y ReceptionQueue
│   │   ├── Navbar.tsx           # Barra de navegación dinámica por rol
│   │   └── RoleProtectedRoute.tsx
│   ├── constants/               # Configuración de API, columnas de Triage, franjas horarias y límites
│   ├── context/                 # AuthContext (gestión global de usuario y JWT)
│   ├── pages/                   # Vistas principales de ambos portales y vista pública del carnet
│   ├── services/                # Cliente HTTP centralizado (apiClient) y servicios por dominio
│   ├── styles/                  # Hojas de estilo y tokens visuales de VetCare
│   ├── types/                   # Interfaces y DTOs TypeScript
│   ├── utils/                   # Formateo de fechas e íconos por especie
│   ├── App.tsx                  # Definición de rutas y guardias de rol
│   └── main.tsx                 # Punto de entrada React
├── index.html
├── package.json
└── vite.config.ts
```

---

## Mapa de Rutas

| Ruta | Acceso | Descripción |
| :--- | :--- | :--- |
| `/login`, `/registro` | Público | Inicio de sesión y alta de nuevos tutores |
| `/carnet/:token` | Público | Vista pública del carnet de vacunación (vía QR) |
| `/mascotas`, `/mascotas/nueva`, `/mascotas/:id` | `cliente` | Gestión y ficha médica de mascotas propias |
| `/mis-turnos`, `/turnos/nuevo` | `cliente` | Agenda de turnos y pago de órdenes |
| `/recetas` | `cliente` | Recetas y tratamientos indicados |
| `/profesional/turnos` | `profesional`, `admin`, `recepcion` | Bandeja operativa de turnos |
| `/profesional/pacientes` | `profesional`, `admin`, `recepcion` | Directorio general de pacientes |
| `/profesional/atencion` | `profesional`, `admin` | Consulta clínica SOAP, posología y farmacia |
| `/profesional/mascotas/:id` | `profesional`, `admin` | Historia clínica completa y auditoría de versiones |
| `/profesional/triage` | `profesional`, `admin` | Tablero Kanban de guardia y urgencias |
| `/profesional/alertas-stock` | `profesional`, `admin` | Monitor de stock crítico y vencimientos FEFO |
| `/facturacion/ordenes` | `profesional`, `admin`, `recepcion` | Gestión de caja, servicios y órdenes de cobro |

---

## Requisitos Previos

- **Node.js** v18 o superior
- **Backend de VetCare** en ejecución (por defecto en `http://localhost:5000`)

---

## Instalación y Configuración

1. Instalar las dependencias:

```bash
npm install
```

2. Crear un archivo `.env` en la raíz del proyecto apuntando a la API del backend:

```env
VITE_API_URL=http://localhost:5000/api
```

> Si no se define `VITE_API_URL`, el cliente HTTP utiliza `http://localhost:5000/api` por defecto.

---

## Scripts Disponibles

- **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

- **Compilar TypeScript y generar build de producción (`dist/`):**

```bash
npm run build
```

- **Previsualizar el build de producción:**

```bash
npm run preview
```

- **Ejecutar el linter (`oxlint`):**

```bash
npm run lint
```

---

## Equipo de Desarrollo

**Grupo 11 — Proyecto Integrador (UNAHUR)**
- Lucas López
- Agustín Fernandes
- Juan Pablo Céspedes
- Osvaldo Galán

**Tutor:** Prof. Cristian Ciarallo
