/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — Migración: 1748200000_init_licenses
 *
 * NOTA: Esta migración es un no-op intencional.
 * La colección `licenses` se crea desde pb_hooks/setup.pb.js mediante
 * un bloque onBootstrap(), que es el patrón correcto en GRAVY y tiene
 * acceso a $app. Las migraciones de PocketBase solo tienen acceso a `db`
 * (SQL raw) y no pueden usar la API de colecciones de $app.
 */
migrate(
  (db) => { /* no-op — ver pb_hooks/setup.pb.js */ },
  (db) => { /* no-op */ }
);
