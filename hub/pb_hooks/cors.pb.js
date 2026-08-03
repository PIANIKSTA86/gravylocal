/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY HUB — Global CORS Middleware
 * Habilita soporte completo de CORS para peticiones entre dominios/subdominios de Cloudflare Tunnel.
 */
onBeforeServe((e) => {
  e.router.use((next) => {
    return (c) => {
      c.response().header().set("Access-Control-Allow-Origin", "*");
      c.response().header().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      c.response().header().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Token");
      
      if (c.request().method === "OPTIONS") {
        return c.noContent(204);
      }
      
      return next(c);
    };
  });
});
