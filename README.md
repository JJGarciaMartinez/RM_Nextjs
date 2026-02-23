# Rick and Morty App

Aplicación web construida con **Next.js 16** y **React 19** que permite explorar personajes de Rick and Morty y gestionar una lista de favoritos. Implementa una arquitectura moderna con API como capa de abstracción.

## Características

- Exploración de personajes de Rick and Morty con filtros (nombre, estado, especie, género, tipo)
- Sistema de favoritos con persistencia en MongoDB
- Búsqueda y paginación dinámica
- Caché en memoria para optimizar peticiones a la API externa
- Interfaz reactiva con optimistic UI

## Arquitectura

### Capa de Abstracción de la API

La aplicación implementa una arquitectura de **API como capa de abstracción** que desacopla el frontend de las APIs externas y la base de datos:

```
Frontend (React) → API Routes Next.js → [RickAndMorty API / MongoDB]
```

#### Componentes de la Capa:

**1. RickAndMortyAPI (`/src/lib/rickAndMortyApi.ts`)**

- Clase que encapsula todas las llamadas a la [Rick and Morty API](https://rickandmortyapi.com/)
- Implementa caché en memoria con TTL de 5 minutos
- Manejo de rate limiting y errores
- Métodos principales: `getCharacters()` y `getCharacter()`

**2. API Routes**

- **`/api/characters`**: Proxy inteligente hacia la API externa
  - Gestiona parámetros de búsqueda y filtrado
  - Maneja respuestas de error (429 rate limit, 404 sin resultados)
  - Normaliza el formato de respuesta

- **`/api/favorites`**: CRUD para favoritos del usuario
  - `GET`: Obtiene lista de favoritos con paginación
  - `POST`: Añade un personaje a favoritos
  - `DELETE`: Elimina un personaje de favoritos
  - Persistencia en MongoDB con Mongoose

**3. Hooks Personalizados**

- `useCharacters()`: Gestión de lista de personajes con estado de carga
- `useFavorites()`: CRUD de favoritos con optimistic UI
- `useUserId()`: Identificación de usuario (simulado)

### Ventajas de esta Arquitectura

1. **Desacoplamiento**: El frontend no conoce la API externa ni la estructura de la BD
2. **Flexibilidad**: Cambiar de proveedor de API o BD solo afecta a la capa intermedia
3. **Caché Centralizado**: Lógica de caché en un único punto
4. **Seguridad**: Las credenciales de BD nunca exponen al cliente
5. **Testing**: Fácil mock de las APIs para testing

### Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes (Backend)
│   │   ├── characters/    # Proxy a Rick and Morty API
│   │   └── favorites/     # CRUD de favoritos
│   ├── favorites/         # Página de favoritos
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes UI
│   ├── characters/        # Componentes de personajes
│   ├── ui/               # Componentes base (UI Kit)
│   ├── modal/            # Sistema de modales
│   └── search/           # Componente de búsqueda
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y configuración
│   └── rickAndMortyApi.ts# Cliente de la API externa
├── models/               # Modelos de MongoDB
├── store/                # State Management (Zustand)
└── types/                # TypeScript Types
```

## Cómo Ejecutar

### Prerrequisitos

- Node.js 18+
- MongoDB (local o en la nube)
- npm, yarn, pnpm o bun

### Instalación

1. Clona el repositorio:

```bash
git clone <repo-url>
cd RM_Nextjs
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` y añade tu conexión de MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/rick-and-morty
# o tu URI de MongoDB Atlas
```

### Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

## Tecnologías Utilizadas

- **Next.js 16.1**: Framework React con App Router
- **React 19**: Librería UI
- **TypeScript**: Tipado estático
- **MongoDB + Mongoose**: Base de datos NoSQL
- **Zustand**: State management ligero
- **Phosphor Icons**: Biblioteca de iconos
- **CSS Modules**: Estilos encapsulados
- **Rick and Morty API**: [https://rickandmortyapi.com/](https://rickandmortyapi.com/)
