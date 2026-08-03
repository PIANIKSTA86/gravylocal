/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  try {
    const users = $app.findCollectionByNameOrId("users");
    const user = $app.findFirstRecordByData("users", "email", "sm2.solutions.co@gmail.com");
    if (user) {
      user.setPassword("Admin1234!");
      $app.save(user);
      console.log("[GRAVY] Contraseña de sm2.solutions.co@gmail.com sincronizada a Admin1234!");
    }
  } catch (_) {
    // Si no existe, no hacemos nada
  }
});
