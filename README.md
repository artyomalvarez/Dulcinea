# Dulcinea 🍰

**Dulcinea** es una aplicación integral para la gestión, costeo de recetas, control de lotes de producción y facturación para negocios de repostería y pastelería artesanal.

---

## 🚀 Tecnologías

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion, Recharts.
- **Arquitectura:** Feature-Sliced Design (FSD) / Clean Architecture en el frontend.
- **CI/CD & Cloud:** GitHub Actions, Azure App Service (Linux, Node runtime con PM2), GitHub Pages.

---

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en local (`localhost:3000`).
- `npm run build`: Compila la aplicación en `dist/` para producción.
- `npm run preview`: Sirve la carpeta `dist/` en local para pruebas previas al despliegue.
- `npm run lint`: Valida tipos de TypeScript con `tsc --noEmit`.
- `npm run test`: Ejecuta la suite de pruebas unitarias con Vitest.

---

## ☁️ Despliegue en Azure App Service

El flujo de despliegue continuo está inspirado en la arquitectura de [nuz777/NuzNotes](https://github.com/nuz777/NuzNotes):

1. **Workflow de GitHub Actions:** [`.github/workflows/deploy-azure-appservice.yml`](.github/workflows/deploy-azure-appservice.yml).
2. **Configuración de inicio en Azure:**
   ```bash
   pm2 serve /home/site/wwwroot --no-daemon --spa
   ```
3. **Guía completa paso a paso:** Consulta [`DEPLOY.md`](DEPLOY.md) para detalles sobre credenciales SCM, secretos en GitHub y resolución de problemas comunes.
