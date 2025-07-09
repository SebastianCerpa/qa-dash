# Estándares de Fuentes para QA Dashboard

## Introducción

Este documento establece los estándares de fuentes para todo el proyecto QA Dashboard, con el objetivo de mantener una consistencia visual en toda la aplicación. Estos estándares se aplican a todos los componentes y páginas.

## Tamaños de Fuente

### Jerarquía de Tamaños

Utilizaremos las siguientes clases de Tailwind CSS para los tamaños de fuente:

| Clase Tailwind | Uso recomendado |
|----------------|------------------|
| `text-sm` | Texto de interfaz general, etiquetas, descripciones, información secundaria, metadatos |
| `text-base` | Texto principal, contenido de párrafos, títulos de tarjetas |
| `text-lg` | Subtítulos, encabezados de secciones |
| `text-xl` | Títulos de secciones secundarias |
| `text-xl` | Títulos de secciones secundarias |
| `text-2xl` | Títulos de página, estadísticas principales |
| `text-3xl` | Títulos destacados |

### Reglas de Aplicación

1. **Encabezados de Página**: Usar `text-2xl` con `font-bold`
2. **Títulos de Sección**: Usar `text-xl` con `font-semibold`
3. **Títulos de Tarjetas**: Usar `text-base` con `font-medium` o `font-semibold`
4. **Texto de Interfaz**: Usar `text-sm` para la mayoría de los elementos de la interfaz
5. **Etiquetas y Badges**: Usar `text-sm` para consistencia
6. **Metadatos y Texto Secundario**: Usar `text-sm`

## Estilos de Fuente

### Pesos de Fuente

| Clase Tailwind | Uso recomendado |
|----------------|------------------|
| `font-normal` | Texto regular de párrafos |
| `font-medium` | Énfasis moderado, etiquetas |
| `font-semibold` | Títulos, elementos destacados |
| `font-bold` | Títulos principales, elementos muy destacados |

### Colores de Texto

| Clase Tailwind | Uso recomendado |
|----------------|------------------|
| `text-gray-900` | Texto principal |
| `text-gray-700` | Texto secundario |
| `text-gray-500` | Texto terciario, descripciones |
| `text-blue-600` | Enlaces, acciones primarias |
| `text-red-600` | Errores, alertas |

## Posicionamiento

### Espaciado

1. **Margen entre Título y Contenido**: `mb-2` o `mb-3`
2. **Margen entre Párrafos**: `mb-2`
3. **Margen entre Secciones**: `mb-4` o `mb-6`
4. **Padding en Contenedores de Texto**: `px-4 py-2` o `p-4`

### Alineación

1. **Títulos**: Generalmente alineados a la izquierda (`text-left`)
2. **Texto de Párrafos**: Alineado a la izquierda (`text-left`)
3. **Etiquetas en Formularios**: Alineadas a la izquierda, encima de los campos

## Componentes Específicos

### Botones

- **Pequeño (sm)**: `text-sm`
- **Mediano (md)**: `text-sm` (predeterminado)
- **Grande (lg)**: `text-base`
- **Extra Grande (xl)**: `text-lg`

### Etiquetas (Badges)

- **Pequeño (sm)**: `text-sm`
- **Mediano (md)**: `text-sm` (predeterminado)
- **Grande (lg)**: `text-sm`

### Formularios

- **Etiquetas**: `text-sm` con `font-medium`
- **Campos de entrada**: `text-sm`
- **Mensajes de error**: `text-sm` con `text-red-600`
- **Texto de ayuda**: `text-sm` con `text-gray-500`

### Tablas

- **Encabezados**: `text-sm` con `font-medium` y `uppercase`
- **Contenido de celdas**: `text-sm`

## Implementación

Para implementar estos estándares, se deben revisar y actualizar todos los componentes existentes para asegurar que sigan estas directrices. Los nuevos componentes deben crearse siguiendo estos estándares desde el principio.