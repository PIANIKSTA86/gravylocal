routerAdd("GET", "/test-tx", (c) => {
  let msg = "Success";
  try {
    $app.runInTransaction((txApp) => {
      try {
        txApp.findFirstRecordByFilter("purchase_invoices", "number='FC-00000001'");
        msg = "Found!";
      } catch(e) {
        msg = "Not Found or Error: " + e.message;
      }
    });
  } catch (e) {
    msg = "Outer Error: " + e.message;
  }
  return c.json(200, { result: msg });
});
