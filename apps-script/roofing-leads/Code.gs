/**
 * Google Apps Script endpoint for Octopus Roofing Co estimate requests.
 *
 * Deploy as a Web app:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * The public website posts a multipart form into a hidden iframe, so the
 * frontend does not need CORS headers from Apps Script.
 */

var CONFIG = {
  RECIPIENT_EMAIL: "Octopusroofing@gmail.com",
  SPREADSHEET_ID: "1h2T9-MBCsqYRrpfwvnuYF5YekgHb9IeOaZkldm7jBF4",
  SHEET_NAME: "Website Leads",
  PHOTO_ROOT_FOLDER_NAME: "Octopus Roofing Lead Photos",
};

var HEADERS = [
  "Submitted At",
  "Lead ID",
  "Name",
  "Phone",
  "Email",
  "Service",
  "Urgency",
  "City or ZIP",
  "Message",
  "Contact Consent",
  "Source",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "UTM Content",
  "UTM Term",
  "Page URL",
  "User Agent",
  "Photo Count",
  "Photo Names",
  "Photo Links",
  "Photo Folder",
];

function setup() {
  getLeadSheet_();
  getPhotoRootFolder_();
  MailApp.getRemainingDailyQuota();
}

function doGet() {
  return jsonResponse_({
    ok: true,
    service: "Octopus Roofing Co lead endpoint",
    sheetName: CONFIG.SHEET_NAME,
  });
}

function doPost(e) {
  try {
    var params = normalizeParams_(e);

    if (params.website) {
      return jsonResponse_({ ok: true, skipped: true });
    }

    var leadId = buildLeadId_();
    var submittedAt = params.submitted_at || new Date().toISOString();
    var files = collectUploadedFiles_(e, "photos");
    var photoResult = savePhotos_(files, leadId, params);

    appendLeadRow_(params, leadId, submittedAt, files, photoResult);
    sendLeadEmail_(params, leadId, submittedAt, files, photoResult);

    return jsonResponse_({
      ok: true,
      leadId: leadId,
      photoCount: files.length,
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function normalizeParams_(e) {
  var input = (e && e.parameter) || {};
  var params = {};

  Object.keys(input).forEach(function (key) {
    params[key] = value_(input[key], "");
  });

  return params;
}

function appendLeadRow_(params, leadId, submittedAt, files, photoResult) {
  var sheet = getLeadSheet_();
  var photoNames = files
    .map(function (file) {
      return getBlobName_(file);
    })
    .filter(Boolean)
    .join(", ");

  var row = [
    submittedAt,
    leadId,
    params.name || "",
    params.phone || "",
    params.email || "",
    params.service || "",
    params.urgency || "",
    params.location || "",
    params.message || "",
    params.contact_consent ? "Yes" : "No",
    params.source || "",
    params.utm_source || "",
    params.utm_medium || "",
    params.utm_campaign || "",
    params.utm_content || "",
    params.utm_term || "",
    params.page_url || "",
    params.user_agent || "",
    files.length || Number(params.photo_count || 0) || 0,
    photoNames || params.photo_names || "",
    photoResult.fileUrls.join("\n"),
    photoResult.folderUrl || "",
  ];

  sheet.appendRow(row);
}

function sendLeadEmail_(params, leadId, submittedAt, files, photoResult) {
  var subjectParts = ["New roofing estimate request"];
  if (params.urgency) subjectParts.push(params.urgency);
  if (params.service) subjectParts.push(params.service);

  var rows = [
    ["Submitted at", submittedAt],
    ["Lead ID", leadId],
    ["Name", params.name],
    ["Phone", params.phone],
    ["Email", params.email],
    ["Service", params.service],
    ["Urgency", params.urgency],
    ["City or ZIP", params.location],
    ["Message", params.message],
    ["Contact consent", params.contact_consent ? "Yes" : "No"],
    ["Source", params.source],
    ["UTM source", params.utm_source],
    ["UTM medium", params.utm_medium],
    ["UTM campaign", params.utm_campaign],
    ["UTM content", params.utm_content],
    ["UTM term", params.utm_term],
    ["Page URL", params.page_url],
    ["Photo count", files.length || params.photo_count || "0"],
    ["Photo folder", photoResult.folderUrl],
    ["Photo links", photoResult.fileUrls.join("\n")],
  ];

  var textBody = rows
    .map(function (row) {
      return row[0] + ": " + value_(row[1]);
    })
    .join("\n");

  var htmlRows = rows
    .map(function (row) {
      return (
        "<tr>" +
        '<th style="text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #ddd;">' +
        escapeHtml_(row[0]) +
        "</th>" +
        '<td style="white-space:pre-wrap;padding:8px;border-bottom:1px solid #ddd;">' +
        linkify_(row[1]) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  var htmlBody =
    "<h2>New roofing estimate request</h2>" +
    '<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">' +
    htmlRows +
    "</table>";

  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAIL,
    subject: subjectParts.join(" - "),
    body: textBody,
    htmlBody: htmlBody,
    replyTo: params.email || CONFIG.RECIPIENT_EMAIL,
    name: "Octopus Roofing Co Website",
  });
}

function collectUploadedFiles_(e, fieldName) {
  var files = [];
  var seen = {};

  function addBlob(value) {
    if (!isBlob_(value)) return;
    var name = getBlobName_(value);
    var size = getBlobSize_(value);
    if (!name && !size) return;
    var key = name + ":" + size;
    if (seen[key]) return;
    seen[key] = true;
    files.push(value);
  }

  if (e && e.parameter) {
    addBlob(e.parameter[fieldName]);
  }

  if (e && e.parameters && e.parameters[fieldName]) {
    var values = Array.isArray(e.parameters[fieldName])
      ? e.parameters[fieldName]
      : [e.parameters[fieldName]];
    values.forEach(addBlob);
  }

  return files;
}

function savePhotos_(files, leadId, params) {
  var result = {
    folderUrl: "",
    fileUrls: [],
  };

  if (!files.length) return result;

  var root = getPhotoRootFolder_();
  var folderName = leadId + " - " + sanitizeFilePart_(params.name || params.phone || "lead");
  var leadFolder = root.createFolder(folderName);
  result.folderUrl = leadFolder.getUrl();

  files.forEach(function (blob, index) {
    var originalName = getBlobName_(blob) || "roof-photo-" + (index + 1);
    var fileName =
      leadId + "-" + String(index + 1) + "-" + sanitizeFilePart_(originalName);
    var file = leadFolder.createFile(blob).setName(fileName);
    result.fileUrls.push(file.getUrl());
  });

  return result;
}

function getLeadSheet_() {
  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  ensureHeaderRow_(sheet);
  return sheet;
}

function ensureHeaderRow_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return;
  }

  var existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var isEmpty = existing.every(function (cell) {
    return !cell;
  });

  if (isEmpty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function getPhotoRootFolder_() {
  var folders = DriveApp.getFoldersByName(CONFIG.PHOTO_ROOT_FOLDER_NAME);
  return folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(CONFIG.PHOTO_ROOT_FOLDER_NAME);
}

function buildLeadId_() {
  var stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd-HHmmss"
  );
  return "ORC-" + stamp + "-" + Math.floor(Math.random() * 9000 + 1000);
}

function isBlob_(value) {
  return (
    value &&
    typeof value.getBytes === "function" &&
    typeof value.getContentType === "function"
  );
}

function getBlobName_(blob) {
  if (!blob || typeof blob.getName !== "function") return "";
  return String(blob.getName() || "");
}

function getBlobSize_(blob) {
  if (!blob || typeof blob.getBytes !== "function") return 0;
  return blob.getBytes().length;
}

function sanitizeFilePart_(value) {
  return String(value || "file")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function value_(value, fallback) {
  var normalized = String(value == null ? "" : value).trim();
  if (normalized) return normalized;
  return fallback == null ? "Not provided" : fallback;
}

function escapeHtml_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkify_(value) {
  var escaped = escapeHtml_(value_(value));
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
