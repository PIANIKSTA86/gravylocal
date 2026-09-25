/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY HUB — Global CORS Middleware
 * Habilita soporte completo de CORS para peticiones entre dominios/subdominios de Cloudflare Tunnel.
 */
routerUse((e) => {
  e.response.header().set("Access-Control-Allow-Origin", "*");
  e.response.header().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  e.response.header().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Token");
  
  if (e.request.method === "OPTIONS") {
    return e.noContent(204);
  }
  
  return e.next();
});
