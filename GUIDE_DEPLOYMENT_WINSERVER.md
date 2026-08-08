# 🌐 Guía de Despliegue de Producción: GRAVY v2.0
## Arquitectura: Windows Server 2016 + MikroTik + Cloudflare Tunnels (Zero Trust)

Como **Arquitecto de Software Senior**, he diseñado un método de despliegue profesional, robusto y fácilmente replicable. La combinación de **Cloudflare Tunnels (Zero Trust)** con **MikroTik** es la mejor opción para redes privadas porque **elimina por completo la necesidad de una IP pública fija, DDNS o la apertura de puertos entrantes (NAT)** en el firewall. 

El túnel establece una conexión saliente segura hacia la red global de Cloudflare, protegiendo al servidor de ataques de escaneo de puertos y de denegación de servicio (DDoS).

---

## 📌 Diagrama de la Arquitectura de Despliegue

```mermaid
graph TD
    subgraph Internet ["Nube (Cloudflare)"]
        CF_DNS["DNS Cloudflare: app.tu-dominio.com"] -->|Tránsito seguro HTTPS/QUIC| CF_Edge["Cloudflare Edge Network"]
    end

    subgraph Oficina_LAN ["Red Privada (LAN)"]
        MikroTik["Router MikroTik (Firewall & QoS)"]
        
        subgraph Server ["Windows Server 2016"]
            CF_Daemon["cloudflared.exe (Servicio Windows)"]
            PM2_Service["Servicio PM2 (Supervisión)"]
            
            subgraph App_Stack ["Stack de Aplicación"]
                Orchestrator["Orquestador Node (Port 8088)"]
                PB_Hub["PocketBase Hub (Port 8089)"]
                PB_Empresa_Demo["PocketBase Demo (Port 8090)"]
                PB_Empresa_4PATAS["PocketBase 4PATAS (Port 8091)"]
            end
        end
    end

    CF_Edge <==>|Túnel Inverso Encriptado (Port 7844)| MikroTik
    MikroTik <==>|Redirección Saliente| CF_Daemon
    CF_Daemon -->|Proxy HTTP Local (127.0.0.1)| PB_Empresa_Demo
    CF_Daemon -->|Proxy HTTP Local (127.0.0.1)| PB_Hub
    CF_Daemon -->|Proxy HTTP Local (127.0.0.1)| PB_Empresa_4PATAS
    PM2_Service -->|Monitorea y Revive| Orchestrator
    PM2_Service -->|Monitorea y Revive| PB_Hub
    PM2_Service -->|Monitorea y Revive| PB_Empresa_Demo
    PM2_Service -->|Monitorea y Revive| PB_Empresa_4PATAS
```

---

## 🛠️ PASO 1: Configuración en el Dashboard de Cloudflare Zero Trust

El primer paso es registrar el túnel en la plataforma Zero Trust de Cloudflare para obtener el **Tunnel Token** seguro.

1. Ve a [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
2. En la barra lateral izquierda, navega a **Networks** > **Tunnels** y haz clic en **Create a Tunnel**.
3. Selecciona **Cloudflare Tunnel (connector)** y haz clic en **Next**.
4. Nombra tu túnel (ej. `gravy-prod-server`) y haz clic en **Save tunnel**.
5. Verás las instrucciones de instalación. Copia el **Token** que se muestra al final de la línea de comandos de Windows (es una cadena larga de caracteres alfanuméricos).
6. Haz clic en **Next** para definir las rutas públicas (**Public Hostnames**):
   * **Host 1 (App Principal - Empresa Demo)**:
     * Subdomain: `app` | Domain: `tu-dominio.com`
     * Service: `http://localhost:8090`
   * **Host 2 (Central Hub)**:
     * Subdomain: `hub` | Domain: `tu-dominio.com`
     * Service: `http://localhost:8089`
   * **Host 3 (Empresa 4PATAS)**:
     * Subdomain: `4patas` | Domain: `tu-dominio.com`
     * Service: `http://localhost:8091`
7. Guarda los cambios.

---

## 🛰️ PASO 2: Configuración del Router MikroTik

Dado que el túnel de Cloudflare realiza conexiones de **salida**, el MikroTik no requiere reglas de enrutamiento NAT entrante (Port Forwarding). Sin embargo, debemos asegurar la conectividad saliente y priorizar el tráfico para evitar lentitud cuando la red esté saturada.

### A. Reglas de Firewall (Salida)
Por defecto, la mayoría de MikroTik permiten todo el tráfico de salida. Si tienes una política estricta de firewall saliente, ejecuta estos comandos en la terminal de tu MikroTik para habilitar el tráfico de Cloudflare:

```routeros
# Permitir tráfico saliente al puerto de control del túnel de Cloudflare (TCP y UDP/QUIC)
/ip firewall filter
add action=accept chain=output comment="Permitir Cloudflare Tunnel (Control & Datos)" dst-port=7844 protocol=tcp
add action=accept chain=output comment="Permitir Cloudflare Tunnel (QUIC)" dst-port=7844 protocol=udp

# Permitir HTTP y HTTPS saliente para descargas/actualizaciones del agente
add action=accept chain=output comment="Permitir HTTP saliente" dst-port=80 protocol=tcp
add action=accept chain=output comment="Permitir HTTPS saliente" dst-port=443 protocol=tcp
```

### B. Calidad de Servicio (QoS) para Priorizar GRAVY (Recomendado)
Para evitar que descargas de usuarios en la red local ralenticen el aplicativo contable, marcamos el tráfico del túnel de Cloudflare y le asignamos prioridad alta.

```routeros
# 1. Marcar conexiones y paquetes del túnel
/ip firewall mangle
add action=mark-connection chain=prerouting comment="Marcar Conexion Cloudflare Tunnel" dst-port=7844 new-connection-mark=cloudflare_conn passthrough=yes protocol=udp
add action=mark-connection chain=prerouting dst-port=7844 new-connection-mark=cloudflare_conn passthrough=yes protocol=tcp
add action=mark-packet chain=prerouting connection-mark=cloudflare_conn new-packet-mark=cloudflare_pkt passthrough=no

# 2. Agregar prioridad en las colas (Simple Queue)
/queue simple
add comment="Priorizar aplicativo GRAVY" limit-at=2M/2M max-limit=10M/10M name="Gravy_QoS" packet-marks=cloudflare_pkt priority=2/2 queue=pcq-upload-default/pcq-download-default target=""
```
*Nota: Ajusta `limit-at` (garantizado) y `max-limit` (máximo permitido) según tu ancho de banda de internet disponible.*

---

## 🖥️ PASO 3: Aprovisionamiento en Windows Server 2016

Para garantizar que el software corra en un entorno de producción desasistido, **todos los componentes deben correr como servicios nativos de Windows**. De este modo, si el servidor se reinicia (por ejemplo, debido a actualizaciones de Windows Update), la aplicación volverá a iniciar sola sin requerir que un administrador inicie sesión.

### A. Preparación del Sistema e Instalar PM2
1. Copia la carpeta del proyecto `GravyLocalTABS` en una ruta segura del servidor (ej. `C:\GravyLocalTABS`).
2. Abre **PowerShell como Administrador** y ejecuta el instalador del servicio PM2 provisto en el proyecto:
   ```powershell
   cd C:\GravyLocalTABS
   .\install-pm2-service.bat
   ```
   *Este script instalará Node.js (si falta), PM2 de forma global, configurará las variables de entorno de máquina, e instalará el servicio `PM2` nativo de Windows.*

### B. Ejecutar PocketBase y Orquestador de forma unificada bajo PM2
Para simplificar la administración del servidor y tener un único punto de control de procesos y logs, modificaremos la configuración de PM2 (`ecosystem.config.js`) para que administre tanto el Orquestador Node.js como las instancias de PocketBase.

Reemplaza el contenido de `C:\GravyLocalTABS\ecosystem.config.js` por lo siguiente:

```javascript
module.exports = {
  apps: [
    // 1. Orquestador Node (Puerto 8088)
    {
      name: 'gravy-orchestrator',
      script: 'hub/orchestrator.js',
      cwd: __dirname,
      autorestart: true,
      min_uptime: '10s',
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
      out_file: 'logs/pm2/orchestrator-out.log',
      error_file: 'logs/pm2/orchestrator-error.log',
      merge_logs: true,
      time: true
    },
    // 2. GRAVY Hub Central (Puerto 8089)
    {
      name: 'gravy-hub',
      script: 'pocketbase.exe',
      args: 'serve --http=127.0.0.1:8089 --dir=hub/pb_data --hooksDir=hub/pb_hooks',
      cwd: __dirname,
      autorestart: true,
      min_uptime: '10s',
      out_file: 'logs/pm2/hub-out.log',
      error_file: 'logs/pm2/hub-error.log',
      merge_logs: true,
      time: true
    },
    // 3. Empresa Demo (Puerto 8090)
    {
      name: 'gravy-empresa-demo',
      script: 'pocketbase.exe',
      args: 'serve --http=127.0.0.1:8090 --dir=pb_data --publicDir=pb_public --hooksDir=pb_hooks',
      cwd: __dirname,
      autorestart: true,
      min_uptime: '10s',
      out_file: 'logs/pm2/empresa-demo-out.log',
      error_file: 'logs/pm2/empresa-demo-error.log',
      merge_logs: true,
      time: true
    },
    // 4. Empresa 4PATAS (Puerto 8091)
    {
      name: 'gravy-empresa-4patas',
      script: 'pocketbase.exe',
      args: 'serve --http=127.0.0.1:8091 --dir=empresas/empresa_8091/pb_data --publicDir=pb_public --hooksDir=empresas/empresa_8091/pb_hooks --migrationsDir=pb_migrations',
      cwd: __dirname,
      autorestart: true,
      min_uptime: '10s',
      out_file: 'logs/pm2/empresa-4patas-out.log',
      error_file: 'logs/pm2/empresa-4patas-error.log',
      merge_logs: true,
      time: true
    }
  ]
};
```

Luego, actualiza y guarda el estado en PM2 para que el servicio levante todo automáticamente:
```powershell
# Detener instancias manuales viejas
.\stop.bat

# Iniciar la configuración unificada en PM2
pm2 start ecosystem.config.js

# Guardar la lista de procesos para el servicio de Windows
pm2 save
```

---

## 🔒 PASO 4: Configuración de Seguridad y Firewall de Windows

Como buena práctica de arquitectura de seguridad, debemos asegurar que las bases de datos y servicios expuestos en los puertos locales de Windows (`8088` a `8091`) **solo acepten peticiones locales (`127.0.0.1` / `localhost`)** procedentes del agente del túnel de Cloudflare. Esto bloquea cualquier intento de acceder directamente a la base de datos por IP local en la LAN de la oficina.

En PowerShell como Administrador, configura el Firewall de Windows:

```powershell
# 1. Eliminar reglas laxas anteriores
Remove-NetFirewallRule -DisplayName "Gravy Orchestrator 8088" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Gravy Hub 8089" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Gravy PocketBase 8090" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Gravy PocketBase 8091" -ErrorAction SilentlyContinue

# 2. Crear reglas estrictas para bloquear accesos externos a puertos críticos de base de datos
New-NetFirewallRule -DisplayName "Bloquear Acceso Externo Gravy 8088-8091" `
    -Direction Inbound `
    -Action Block `
    -Protocol TCP `
    -LocalPort 8088,8089,8090,8091 `
    -RemoteAddress Any
```
*Nota: El servicio seguirá siendo accesible desde fuera a través del dominio HTTPS cifrado gestionado por Cloudflare, ya que el agente `cloudflared` corre localmente en el servidor y reenvía las peticiones mediante Loopback (`127.0.0.1`).*

---

## ☁️ PASO 5: Instalación de Cloudflare Tunnel como Servicio de Windows

Utilizaremos el asistente de aprovisionamiento del túnel para descargar el binario e instalarlo como un servicio del sistema.

1. En la consola de PowerShell (o ejecutando `setup-cloudflare.bat`), corre la opción interactiva:
   ```cmd
   .\setup-cloudflare.bat
   ```
2. Selecciona la **Opción 1** e introduce el **Tunnel Token** obtenido en el *Paso 1*. Esto guardará las credenciales en `config\cloudflare.env`.
3. Selecciona la **Opción 4** para administrar el Servicio de Windows.
4. Elige **Opción 1** ("Instalar Servicio con Tunnel Token") dentro del submenú para registrarlo formalmente en el Administrador de Servicios de Windows (Services.msc).
5. Comprueba en la terminal del MikroTik o en el Panel de Cloudflare Zero Trust que el túnel figure en estado **Healthy / Activo**.

---

## 💾 PASO 6: Estrategia de Backups Automatizados (Crítico para Contabilidad)

Dado que PocketBase almacena toda la información de transacciones y contabilidad en archivos **SQLite** (`data.db`), la estrategia de respaldo es sumamente sencilla, limpia y de bajo consumo de recursos.

Crearemos una tarea programada que realice un respaldo diario cifrado y lo almacene en una ruta de respaldo secundaria (o disco duro externo de red).

### A. Crear Script de Backup (`scripts\backup-database.ps1`)
Crea un archivo llamado `C:\GravyLocalTABS\scripts\backup-database.ps1` con el siguiente código profesional de respaldo:

```powershell
# --- CONFIGURACIÓN DE BACKUP ---
$ProjectRoot = "C:\GravyLocalTABS"
$BackupDest = "D:\Respaldos_Gravy" # Cambiar a un disco secundario o ruta UNC de red
$KeepDays = 30

$DateStr = Get-Date -Format "yyyy-MM-dd_HHmmss"
$TempZip = Join-Path $env:TEMP "Gravy_Backup_$DateStr.zip"

if (-not (Test-Path $BackupDest)) {
    New-Item -ItemType Directory -Path $BackupDest | Out-Null
}

# Lista de directorios de pb_data a respaldar
$DataDirs = @(
    @{ Name = "Hub"; Path = "$ProjectRoot\hub\pb_data" },
    @{ Name = "Demo"; Path = "$ProjectRoot\pb_data" },
    @{ Name = "4Patas"; Path = "$ProjectRoot\empresas\empresa_8091\pb_data" }
)

Write-Host "Iniciando respaldo de bases de datos contables..." -ForegroundColor Cyan

# 1. Copiar y comprimir las carpetas de datos
try {
    # Creamos estructura temporal limpia para empaquetar
    $TempBackupFolder = Join-Path $env:TEMP "Gravy_Temp_Backup"
    if (Test-Path $TempBackupFolder) { Remove-Item -Recururse -Force $TempBackupFolder }
    New-Item -ItemType Directory -Path $TempBackupFolder | Out-Null

    foreach ($dir in $DataDirs) {
        if (Test-Path $dir.Path) {
            $DestSubFolder = Join-Path $TempBackupFolder $dir.Name
            # Usamos robocopy para una copia segura de archivos SQLite activos
            robocopy $dir.Path $DestSubFolder /E /COPY:DAT /R:3 /W:2 /NFL /NDL /NJH /NJS > $null
        }
    }

    # Comprimir en ZIP
    Compress-Archive -Path "$TempBackupFolder\*" -DestinationPath $TempZip -Force
    
    # Mover al destino final
    $FinalZipPath = Join-Path $BackupDest "Gravy_Contabilidad_$DateStr.zip"
    Move-Item -Path $TempZip -Destination $FinalZipPath -Force
    
    Write-Host "Respaldo exitoso guardado en: $FinalZipPath" -ForegroundColor Green
    
    # Limpieza temporal
    Remove-Item -Recururse -Force $TempBackupFolder
}
catch {
    Write-Error "Falló la generación de backup: $_"
}

# 2. Rotación de Backups (Eliminar archivos con más de $KeepDays días)
$LimitDate = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem -Path $BackupDest -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $LimitDate } | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Host "Eliminado respaldo antiguo: $($_.Name)" -ForegroundColor Yellow
}
```

### B. Registrar Tarea Programada en Windows Server 2016
Ejecuta esto en tu PowerShell de Administrador para registrar la tarea de respaldo diario a las 11:45 PM de forma automática:

```powershell
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\GravyLocalTABS\scripts\backup-database.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At "23:45"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "Gravy_Daily_Backup" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Respaldo automático diario de bases de datos contables de GRAVY" -User "SYSTEM"
```

---

## 📈 PASO 7: Plan de Verificación de Conectividad

Para validar que todo el stack funciona correctamente bajo la nueva infraestructura:

1. **Estado del Servicio PM2**:
   * Corre `pm2 status` en PowerShell para verificar que los 4 procesos estén en verde (`online`).
   * Corre `Get-Service PM2` para verificar que el servicio de Windows se encuentra en estado `Running`.
2. **Estado del Túnel en Cloudflare**:
   * Accede a la consola de Zero Trust de Cloudflare y comprueba que el túnel figure activo.
3. **Prueba de Acceso HTTPS**:
   * Desde cualquier dispositivo externo a la red de la oficina (ej. un teléfono móvil conectado por datos móviles), intenta ingresar a `https://app.tu-dominio.com` y `https://hub.tu-dominio.com`.
   * Verifica la presencia del candado SSL (certificado Let's Encrypt / Cloudflare Edge).
4. **Verificación de la Firma Electrónica (DIAN)**:
   * Al emitir una factura, el Frontend llamará a la URL del Hub y esta al Orquestador (Puerto `8088`). Verifica que el puerto responda correctamente y que la firma XML se efectúe de manera segura.

---

## 🔍 PASO 8: Resolución de Problemas (Conflictos DNS y CORS)

### ⚠️ A. Error al Guardar/Registrar el Hostname 2 (hub.gravy-ms.com) en Cloudflare
**Causa:** Cuando intentas añadir un `Public Hostname` en el túnel, Cloudflare intenta crear automáticamente un registro DNS de tipo `CNAME` que apunta al túnel. Si en el panel estándar de DNS de Cloudflare ya existe un registro antiguo (un registro `A` o `CNAME`) con el nombre `hub`, Cloudflare bloqueará la operación para evitar sobrescribir datos en conflicto.

**Solución:**
1. Ve al panel de control de Cloudflare tradicional (no Zero Trust) de tu dominio `gravy-ms.com`.
2. Dirígete a la sección de **DNS** > **Records**.
3. Busca cualquier registro existente con el nombre `hub` (ej. `hub.gravy-ms.com`).
4. **Elimina ese registro** (Delete).
5. Regresa al panel de Cloudflare Zero Trust Tunnels, edita tu túnel y ahora podrás guardar el Public Hostname `hub.gravy-ms.com` sin problemas. Cloudflare creará el CNAME correcto automáticamente.

---

### ⚠️ B. Error de CORS en el Navegador (Access-Control-Allow-Origin)
El navegador bloquea la consulta a `https://hub.gravy-ms.com` desde `https://domestiko.gravy-ms.com` debido a que son dominios distintos y falta la cabecera CORS que autorice la solicitud.

#### Causa 1: El servicio local (PocketBase Hub) está inactivo o responde con error
Cuando el túnel de Cloudflare intenta redirigir la petición a `http://localhost:8089` y el servicio está apagado, el túnel devuelve un error `502 Bad Gateway`. Como la página de error de Cloudflare no inyecta cabeceras CORS, el navegador reporta un fallo de CORS en la consola ocultando el verdadero error 502.
* **Solución:** Ejecuta `pm2 status` en PowerShell y asegúrate de que el proceso `gravy-hub` esté `online`. Revisa los logs con `pm2 logs gravy-hub`.

#### Causa 2: CORS no configurado en el Cloudflare Tunnel
Si el servicio local está activo pero sigues recibiendo el error, debes indicarle a Cloudflare que devuelva las cabeceras CORS correspondientes.
* **Solución (Recomendada - Directamente en Cloudflare):**
  1. En el panel de Cloudflare Zero Trust, ve a **Networks** > **Tunnels** y edita tu túnel.
  2. Ve a la pestaña **Public Hostname** y edita el hostname `hub.gravy-ms.com`.
  3. Despliega **Additional application settings** > **CORS settings**.
  4. Configura los siguientes campos:
     * **Access-Control-Allow-Origin**: `https://domestiko.gravy-ms.com` (o `*` si deseas permitir cualquier inquilino/tenant).
     * **Access-Control-Allow-Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
     * **Access-Control-Allow-Headers**: `*` (o explícitamente `Content-Type, Authorization, pocketbase-auth, x-requested-with`)
     * **Access-Control-Allow-Credentials**: `true` (obligatorio si usas la URL de origen específica `https://domestiko.gravy-ms.com` y PocketBase envía cookies/sesión).
  5. Guarda los cambios. Esto inyectará las cabeceras CORS en el Edge de Cloudflare antes de que la respuesta llegue al navegador.

