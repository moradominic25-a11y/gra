# 🐑 VR Farm Simulator

Una aplicación de realidad virtual inmersiva para alimentar animales de granja con renderizado estereoscópico 2K por ojo.

## ✨ Características

- **Renderizado VR Estereoscópico**: Vista lado a lado con 2K de resolución por ojo
- **Animales 3D Interactivos**: Ovejas, gallinas, vacas y cerdos con modelos realistas
- **Entorno de Granja Completo**: Césped, cercas de madera y granero con detalles
- **Controles Múltiples**:
  - Teclado (flechas/WASD)
  - Ratón (arrastrar para rotar)
  - Táctil (deslizar en móvil/VR)
  - D-pad virtual en móvil
- **Mecánicas de Alimentación**: Haz clic en los animales para alimentarlos
- **Animaciones Realistas**: Los animales rebotan y cambian de color al ser alimentados
- **Totalmente Responsive**: Optimizado para escritorio, tableta y móvil

## 🎮 Controles

### Escritorio
- **Flechas / WASD**: Rotar cámara izquierda/derecha/arriba/abajo
- **Click + Arrastrar**: Rotar cámara con el ratón
- **Click en Animales**: Alimentar animales

### Móvil/VR
- **Deslizar**: Rotar cámara
- **Tocar Animales**: Alimentar animales
- **D-pad Virtual**: Controles direccionales en pantalla

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Three.js** - Renderizado 3D y VR
- **Vite** - Build tool rápido
- **Tailwind CSS v4** - Estilos utility-first

## 🎯 Cómo Jugar

1. La aplicación inicia en modo VR (vista lado a lado)
2. Usa los controles para mirar alrededor de la granja
3. Haz clic en los animales para alimentarlos
4. Cada animal alimentado suma 10 puntos
5. ¡Alimenta a todos los animales para ganar!

## 🔧 Desarrollo

```bash
# Instalar dependencias
bun install

# Modo desarrollo
bun run dev

# Build producción
bun run vite build

# Preview build
bun run vite preview
```

## 📱 Compatibilidad VR

- **Google Cardboard** ✅
- **Oculus Quest/Quest 2** ✅
- **Samsung Gear VR** ✅
- **Otros visores VR móviles** ✅

Simplemente abre la aplicación en tu navegador móvil y coloca tu dispositivo en el visor VR.

## 🎨 Arquitectura

```
src/
├── pages/
│   └── Home.tsx              # Componente principal VR
├── utils/
│   ├── StereoEffect.ts       # Renderizado estereoscópico
│   ├── AnimalModels.ts       # Modelos 3D de animales
│   └── router.ts             # Gestión de rutas
└── index.css                 # Estilos globales + VR optimizations
```

## 🌟 Características Destacadas

### Renderizado VR Avanzado
- StereoCamera con separación ocular de 64mm (IPD promedio humano)
- Renderizado side-by-side para visores VR
- Modo normal alternativo para escritorio

### Modelos 3D Detallados
- **Ovejas**: Cuerpo lanoso con orejas y patas realistas
- **Gallinas**: Con cresta, pico naranja y alas
- **Vacas**: Manchas negras, cuernos y cola
- **Cerdos**: Rosadas con hocico y cola rizada

### Entorno Inmersivo
- 200+ hojas de césped individuales
- Cerca de madera perimetral completa
- Granero rojo con techo y puerta
- Iluminación direccional con sombras
- Niebla atmosférica para profundidad

## 📊 Rendimiento

- Optimizado para 60 FPS en VR
- Sombras suaves PCF
- Anti-aliasing habilitado
- Geometría optimizada para móvil

## 🤝 Créditos

Creado con ❤️ usando SeaVerse Platform

---

**Nota**: Esta aplicación está optimizada para experiencias VR inmersivas. Para mejor calidad, usa un dispositivo con pantalla de alta resolución.
