# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a la política de documentación técnica continua.

## [Unreleased] - 2026-11-10T18:09:46-05:00 (America/Bogota)

### Added
- **Estructura CI/CD para Azure App Service**:
  - Implementado workflow `.github/workflows/deploy-azure-appservice.yml` para compilar y desplegar automáticamente en Azure App Service utilizando `azure/webapps-deploy@v3` y perfil de publicación SCM.
  - Implementado workflow alternativo `.github/workflows/deploy-pages.yml` para despliegues estáticos en GitHub Pages.
- **Configuración de servidor y enrutamiento**:
  - Añadido `public/web.config` con soporte de reescritura SPA y definición de tipos MIME para Azure App Service en Windows (IIS).
- **Documentación de Despliegue**:
  - Creado `DEPLOY.md` detallando la configuración del comando de inicio `pm2 serve /home/site/wwwroot --no-daemon --spa`, credenciales SCM y matriz de solución de incidentes basada en la arquitectura de `nuz777/NuzNotes`.
  - Creado `README.md` con descripción general del proyecto, scripts y enlaces de despliegue.

### Changed
- **Configuración Vite (`vite.config.ts`)**:
  - Configurado `base: './'` y `build.outDir: 'dist'` para garantizar la compatibilidad con rutas relativas en cualquier ruta o subdirectorio de Azure y GitHub Pages.
