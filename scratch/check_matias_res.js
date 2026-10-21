async function getRes() {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYWQxYzFlOWUwM2I3YjRmOTNmNzA2NjcwYmEyNjY2OGY5MGI1MmZkZTE2NTJhYmU5ZjRjNGM5YjUxOWRkNDFmZTdkMzZiMWI5MTI5MjRhMjUiLCJpYXQiOjE3OTI0NTYzODUuNTUwODQ5LCJuYmYiOjE3OTI0NTYzODUuNTUwODUsImV4cCI6MTgwMDIzMjM4NS41NDk1NjYsInN1YiI6IjEzNjQiLCJzY29wZXMiOltdfQ.JypMrSTLLR1u8DrYKW1AZ0zntv3N0X73qLrxtaK25D57BZlmpVJA4lw4KCMdWEtFk9fnMzFHtFSlokaNZz1_l1z33qz4D6vIc3HoKyPVilTtPf5DHL_Exp9hiXBQnfOm4iUvkqRieXOQwyLG0MpfLj_iaXYoux8cHheDX44ThhwjLoDGIPk8aTN5eLzfC_e7iFRywz7hvHNyj4rhDRXu-Df5d9X7D1y4tHpQlknCaUgUJot5hm2_ha-37Ob0_p8oLVr5FNYrv8QtoROVgmhS0h_KI59FKm1ECqbeBpcS8-wWRdU-McwyXhM3cQgWmEKZdKwijfQJHoh3BzQ6m-mvYkqK_cqtXd9pT5UPhDuk2bwWvL0EgwrvaW_e13CFPGAuo6Ji6z0WZwf94ddIWDXshiJUMCFo8CGAiucWv9lnEzhBYsEPVbl8yv0y9IBARmBGSKTTNZeA6DvGmVm1xkxz_Gh_2XyzJ4-Yh2CXxDJPV7HrRqg_mHKsJ6zOT_wUIHWjivrY8t0XgwhMF1WPgThc9Wwh7zu6INXUGV3M-IEAM1dkZDCjrjAS999fPq0vKI47WrcrixFLaMESKDx89pUBkBKePswVnPdE2KVoHW_9nY3N9YkaH93t023dtkU7h0jvePnT_na0sIot8qG-iBHWIW1Vmk5kQ-m1jUB337JkFkQ';
  const clientUuid = '63869fe6-cb40-11f1-a6db-d843ae899220';
  const url = 'https://api-v2.matias-api.com/api/ubl2.1/resolutions?sync=1&client_uuid=' + clientUuid;
  const res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  const list = json.dataRecords?.data || json.dataRecords || [];
  console.log('Total records:', list.length);
  list.forEach(r => {
    console.log({
      id: r.id,
      type_id: r.type_document_id,
      voucher: r.type_document?.voucher_name,
      prefix: r.prefix,
      resolution_number: r.resolution_number,
      range: r.range_from + ' - ' + r.range_up,
      active: r.active
    });
  });
}
getRes();
