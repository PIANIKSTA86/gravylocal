# 🍏 Guía de Instalación y Uso en macOS — GRAVY v2.0

Esta guía explica cómo ejecutar **GRAVY v2.0** de forma local en computadores **Mac** (con procesadores Apple Silicon M1/M2/M3/M4 o Intel).

---

## 📋 Requisitos Previos

1. **macOS 11 (Big Sur)** o superior (Sonoma, Sequoia, etc.).
2. **Node.js** instalado (versión 18, 20 o 22 LTS).
   - Puedes comprobar si ya lo tienes abriendo Terminal y escribiendo: `node -v`
   - Si no lo tienes, instálalo con [Homebrew](https://brew.sh):
     ```bash
     brew install node
     ```
     O descarga el instalador oficial `.pkg` desde [nodejs.org](https://nodejs.org).

---

## 🚀 Instalación Inicial (Solo la primera vez)

1. **Copia la carpeta** `GravyLocalTABS` en tu carpeta personal o donde prefieras (ejemplo: `~/GravyLocal`).
2. Abre la aplicación **Terminal** en tu Mac.
3. Navega a la carpeta del proyecto y ejecuta el instalador automático:
   ```bash
   cd ~/GravyLocal
   chmod +x instalar.sh
   ./instalar.sh
   ```
   *El script detectará automáticamente si tu Mac es Apple Silicon (M1..M4) o Intel, descargará el binario oficial de PocketBase para Darwin, asignará los permisos correspondientes y preparará los módulos de Node.js.*

---

## 💻 Uso Diario en macOS

### ▶️ Iniciar GRAVY
Tienes dos opciones:
* **Opción A (Fácil - Finder):** Haz doble clic en el archivo **`start.command`**. Se abrirá una ventana de terminal y automáticamente tu navegador en `http://localhost:8090`.
* **Opción B (Terminal):**
  ```bash
  ./start.sh
  ```

### ⏹️ Detener GRAVY
* **Opción A (Finder):** Haz doble clic en el archivo **`stop.command`**.
* **Opción B (Terminal):**
  ```bash
  ./stop.sh
  ```

---

## 🌐 Puertos y URLs en macOS

* **Empresa Principal / Sistema Contable:** `http://localhost:8090`
* **GRAVY HUB Central:** `http://localhost:8089`
* **Orquestador Multi-tenant & Firma DIAN:** `http://localhost:8088`
* **Sub-empresas Registradas:** `http://localhost:8091`, `8092`, etc.

---

## 🛠️ Solución de Problemas Frecuentes

### 1. "No se puede abrir porque proviene de un desarrollador no identificado" (Gatekeeper)
Si macOS bloquea la primera ejecución de `start.command` o del binario `pocketbase`:
1. Abre **Preferencias del Sistema (Ajustes)** > **Privacidad y Seguridad**.
2. Desplázate hacia abajo y haz clic en **"Abrir de todos modos"** (Open Anyway).
3. O en Terminal ejecuta:
   ```bash
   xattr -d com.apple.quarantine pocketbase start.command stop.command
   ```

### 2. "Puerto en uso (Port 8090/8089 already in use)"
Ejecuta el script de parada para limpiar cualquier proceso colgado:
```bash
./stop.sh
```

---

## 🔒 Persistencia y Facturación Electrónica DIAN

* Las bases de datos SQLite (`pb_data/data.db`) son 100% compatibles entre Windows y Mac sin necesidad de migración ni exportación.
* La firma digital XAdES-EPES con certificados `.p12`/`.pfx` se ejecuta con idéntica validez fiscal y técnica gracias al motor criptográfico `node-forge` integrado en el orquestador.
