# Guía de Despliegue de Dulcinea (Azure App Service & GitHub Pages)

Estructura de despliegue basada en el flujo de [nuz777/NuzNotes](https://github.com/nuz777/NuzNotes), optimizada para aplicaciones Vite + React 19 + TypeScript.

| Destino | Tipo de Entorno | Workflow |
|---|---|---|
| **Azure App Service** (Linux, Node 20/22/24) | Producción Principal | `.github/workflows/deploy-azure-appservice.yml` |
| **GitHub Pages** | Vista Previa / Staging estático | `.github/workflows/deploy-pages.yml` |

---

## 🛠️ Configuración del Proyecto

### 1. Vite y Rutas Relativas
En [`vite.config.ts`](file:///home/cohorte5/Música/Dev/Proyectos/Dulcinea/vite.config.ts):
- Se configuró `base: './'` para generar rutas relativas en los assets compilados. Esto permite que la aplicación funcione sin problemas tanto en la raíz de un dominio (`https://tu-app.azurewebsites.net/`) como en un subdirectorio (`https://usuario.github.io/Dulcinea/`).
- La carpeta de salida configurada es `dist/`.

### 2. Soporte IIS / Windows Fallback
- En [`public/web.config`](file:///home/cohorte5/Música/Dev/Proyectos/Dulcinea/public/web.config) se definen reglas de reescritura SPA y tipos MIME (`.json`, `.woff`, `.woff2`, etc.).
- Vite copia automáticamente el contenido de `public/` hacia `dist/` durante el build. En App Service Linux este archivo no interfiere, y en App Service Windows previene errores 404 al recargar rutas.

---

## ☁️ Paso a Paso: Configurar Azure App Service

### 1. Habilitar Credenciales SCM en Azure Portal
1. Entra a [Azure Portal](https://portal.azure.com) y ve a tu recurso **App Service**.
2. Ve a **Configuración** (o *Configuration*) → **Configuración general** (*General settings*).
3. Asegúrate de activar **"Credenciales de publicación de autenticación básica de SCM"** (*SCM Basic Auth Publishing Credentials* = On).
4. Guarda los cambios.

### 2. Comando de Inicio (Startup Command)
Azure App Service Linux con Node.js no sirve archivos estáticos SPA por defecto. Para resolver esto usando el servidor `pm2` integrado en la imagen oficial:
1. En el App Service, ve a **Configuración** → **Configuración de la pila** (*Stack settings*) o pestaña **General**.
2. En el campo **Comando de inicio** (*Startup Command*), ingresa:
   ```bash
   pm2 serve /home/site/wwwroot --no-daemon --spa
   ```
3. Guarda y reinicia la app si es necesario.

### 3. Obtener el Perfil de Publicación y Configurar Secretos en GitHub
1. En la página principal de tu App Service en Azure Portal (sección **Información general** o *Overview*), haz clic en **"Descargar perfil de publicación"** (*Get publish profile*). Se descargará un archivo `.PublishSettings`.
2. En tu repositorio de GitHub, ve a **Settings** → **Secrets and variables** → **Actions**.
3. En la pestaña **Secrets**, crea un nuevo secreto:
   - **Name:** `AZUREAPPSERVICE_PUBLISHPROFILE`
   - **Value:** Pega el contenido completo del archivo XML descargado.
4. *(Opcional)* En la pestaña **Variables**, puedes definir:
   - **Name:** `AZURE_WEBAPP_NAME`
   - **Value:** El nombre exacto de tu App Service (ej. `dulcinea-app`).

---

## 🚀 Flujo de Trabajo y Automatización

1. Realiza tus cambios en el código (`src/...`).
2. Verifica el build en local:
   ```bash
   npm run build
   npm run preview
   ```
3. Haz push a la rama `main`:
   ```bash
   git add .
   git commit -m "feat: nuevo ajuste en recetas"
   git push origin main
   ```
4. El workflow `.github/workflows/deploy-azure-appservice.yml` se disparará automáticamente:
   - Compila el proyecto con Node 22.
   - Sube la carpeta compilada `dist/` como artefacto.
   - Despliega a Azure App Service vía `azure/webapps-deploy@v3`.

---

## 🔍 Solución de Problemas Frecuentes

| Síntoma | Causa Probable | Solución |
|---|---|---|
| **Workflow falla en GitHub Actions (rojo)** | Fallo de build o tipos en `npm run build` | Ejecuta `npm run build` o `tsc --noEmit` en local para corregir errores de tipado o dependencias. |
| **Azure muestra la página predeterminada ("Your app is running...")** | Falta el comando de inicio de `pm2` o la app no se ha reiniciado | Configura en Azure: `pm2 serve /home/site/wwwroot --no-daemon --spa` y reinicia el servicio. |
| **Error 401 al desplegar desde GitHub Actions** | Autenticación básica desactivada o perfil caducado | Reactiva la autenticación básica de SCM en Azure Portal o descarga un nuevo perfil y actualiza `AZUREAPPSERVICE_PUBLISHPROFILE`. |
| **Pantalla en blanco o assets devuelven 404** | Rutas absolutas (`/assets/...`) en vez de relativas | Asegúrate de que `base: './'` esté configurado en `vite.config.ts`. |
| **Error 404 al recargar una ruta secundaria** | Servidor no configurado con fallback SPA | En Linux verifica la bandera `--spa` en el comando `pm2`. En Windows verifica que `web.config` esté en la raíz de despliegue. |
