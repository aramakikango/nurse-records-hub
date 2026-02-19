function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("nurse-records-hub")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getPatients() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("patients");
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const header = values[0].map((h) => h.toString().trim());
  const idx = {
    patient_id: header.indexOf("patient_id"),
    name: header.indexOf("name"),
    kana: header.indexOf("kana"),
    active: header.indexOf("active"),
  };

  return values
    .slice(1)
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const rawActive = idx.active >= 0 ? row[idx.active] : false;
      const active =
        rawActive === true ||
        rawActive === 1 ||
        rawActive === "1" ||
        rawActive === "TRUE" ||
        String(rawActive).toLowerCase() === "true";
      return {
        patient_id:
          idx.patient_id >= 0 ? String(row[idx.patient_id] ?? "") : "",
        name: idx.name >= 0 ? String(row[idx.name] ?? "") : "",
        kana: idx.kana >= 0 ? String(row[idx.kana] ?? "") : "",
        active: active,
      };
    });
}
