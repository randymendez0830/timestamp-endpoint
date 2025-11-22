// File: Code.gs
// Endpoint: /api/adas_schedule_update

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // Sheet settings
    const ss = SpreadsheetApp.openById('<YOUR_SHEET_ID>');
    const sheet = ss.getSheetByName('ADAS_Schedule');

    // Build row (Column A is already filled by timestamp)
    const row = [
      body.shop || "",
      body.ro_number || "",
      body.vin || "",
      body.vehicle_year || "",
      body.vehicle_make || "",
      body.vehicle_model || "",
      body.system || "",
      body.status || "",
      body.tech || "",
      body.notes || ""
    ];

    // Insert into ROW 2 (push existing data downward)
    sheet.insertRowBefore(2);

    // Write starting at Column B (because Column A is timestamp)
    sheet.getRange(2, 2, 1, row.length).setValues([row]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
