# 🌐 Guía de Arquitectura y Configuración de Cloudflare Tunnels - GRAVY v2.0

Esta documentación explica la arquitectura, aprovisionamiento, uso y resolución de problemas del sistema de **Cloudflare Tunnels** implementado para el proyecto **GRAVY v2.0**.

---

## 📌 1. Visión General de la Arquitectura

GRAVY opera con una arquitectura híbrida donde los servicios locales se exponen de forma segura a través de túneles cifrados hacia la red global de Cloudflare, sin requerir direcciones IP públicas fijas ni apertura de puertos en los routers localmente (NAT/Firewall Traversal).

```
                      +------------------------------------------+
                      |         Cloudflare Edge Network          |
                      |  https://app.gravy-ms.com (Frontend+PB)  |
                      |  https://hub.gravy-ms.com (Central Hub)  |
                      +--------------------+---------------------+
                                           |
                                [ Cifrado TLS / Tunnel ]
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Host Local (Servidor / PC de Cliente)                                             |
|                                                                                   |
|  [bin\cloudflared.exe] (Túnel Portable o Servicio de Windows)                      |
|          |                                                                        |
|          +---> http://127.0.0.1:8090  --> Empresa Demo / PocketBase               |
|          +---> http://127.0.0.1:8089  --> GRAVY HUB Central                      |
|          +---> http://127.0.0.1:8088  --> Orquestador Node.js                      |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 2. Métodos de Configuración Disponibles

GRAVY soporta dos métodos de conexión con Cloudflare:

### 🔹 Método 1: Tunnel Token (Recomendado / Cloudflare Zero Trust)
* **¿Qué es?**: Conexión remota administrada desde el panel de Cloudflare Zero Trust.
* **Ventajas**:
  * No requiere archivos locales `.pem`, `.json` ni `config.yml`.
  * Las reglas de enrutamiento y subdominios (`app.gravy-ms.com`, `hub.gravy-ms.com`, dominios personalizados de cliente) se editan directamente en la nube.
  * Ideal para despliegues masivos en múltiples clientes.
* **Almacenamiento**: El token se guarda automáticamente en `config\cloudflare.env`.

### 🔹 Método 2: Archivo `config.yml` Local (CLI Tradicional)
* **¿Qué es?**: Configuración basada en archivos de credenciales JSON locales y un archivo de enrutamiento YAML (`config.yml`).
* **Ubicación**: `%USERPROFILE%\.cloudflared\config.yml`.
* **Soporte Dinámico**: En GRAVY v2.0, las rutas están parametrizadas con variables de entorno de Windows (`%USERPROFILE%`), garantizando que la instalación sea portátil entre diferentes usuarios de Windows.

---

## 🛠️ 3. Asistente de Configuración (`setup-cloudflare.bat`)

Para configurar o actualizar el túnel en cualquier máquina, simplemente ejecute:

```cmd
setup-cloudflare.bat
```

### Menú de Opciones del Asistente:
1. **Configurar por Tunnel Token (Recomendado)**: Solicita y guarda el token JWT del túnel.
2. **Configurar por archivo local config.yml**: Genera la estructura de enrutamiento dinámico en `%USERPROFILE%\.cloudflared`.
3. **Ejecutar Diagnóstico de Túnel y Conectividad**: Verifica la disponibilidad del ejecutable, validador de configuración y estado de los puertos locales (`8090`, `8089`).
4. **Administrar Servicio de Windows**: Permite instalar o desinstalar `cloudflared` como un servicio nativo de autostart en Windows.
5. **Descargar / Actualizar `cloudflared.exe`**: Descarga automáticamente la última versión oficial de 64 bits a la carpeta `bin\cloudflared.exe`.

---

## ⚙️ 4. Scripts de Inicio y Parada

### 🟢 Inicio Interactivo con Consola (`start-cloud.bat`)
* Muestra el progreso de inicio de PocketBase, Orquestador y el Túnel.
* Detecta automáticamente si existe `bin\cloudflared.exe` o si está en el PATH.
* Abre automáticamente el navegador en `https://app.gravy-ms.com`.

### 🟢 Inicio Silencioso en Segundo Plano (`start-silent-cloud.vbs`)
* Inicia todos los servicios y el túnel en modo oculta (sin ventanas interactivos).
* Diseñado para accesos directos de usuario final o inicio de sesión de Windows.

### 🔴 Detención Completa (`stop.bat`)
* Finaliza de forma segura los procesos en los puertos 8088, 8089, 8090, 8091.
* Elimina procesos huérfanos de `cloudflared.exe`.

---

## 🔍 5. Diagnóstico de Problemas Comunes (Troubleshooting)

### Error 1: "No se encontró cloudflared.exe"
* **Solución**: Ejecute `setup-cloudflare.bat` y seleccione la opción **5** para descargar la versión portable en `bin\cloudflared.exe`.

### Error 2: "No se encuentra la clave JSON en C:\Users\..."
* **Causa**: Migración de carpeta de usuario en Windows.
* **Solución**: Ejecute `setup-cloudflare.bat` -> Opción **2** para regenerar `config.yml` con la ruta dinámica del usuario actual.

### Error 3: El dominio responde `502 Bad Gateway`
* **Causa**: El túnel está conectado a Cloudflare pero los servicios de PocketBase local no han terminado de iniciar.
* **Solución**: Verifique en `setup-cloudflare.bat` (opción 3) que los puertos `8090` y `8089` se encuentren en estado `Escuchando`.

---

## 📜 6. Estructura de Archivos del Sistema Cloudflare

| Archivo / Ruta | Descripción |
| :--- | :--- |
| `setup-cloudflare.bat` | Lanzador del asistente interactivo |
| `scripts/setup-cloudflare-tunnel.ps1` | Script principal de aprovisionamiento en PowerShell |
| `bin/cloudflared.exe` | Ejecutable portable de Cloudflare Tunnel |
| `config/cloudflare.env` | Archivo de almacenamiento seguro del Tunnel Token |
| `start-cloud.bat` | Script de arranque en modo ventana interactiva |
| `start-silent-cloud.vbs` | Script de arranque en modo oculto |
| `%USERPROFILE%\.cloudflared\config.yml` | Configuración local de enrutamiento fallback |
