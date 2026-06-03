/**
 * Google Apps Script endpoint for the client brief form.
 *
 * Deploy as:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Before deployment:
 * 1. Edit RECIPIENT_EMAIL and BRIEF_PASSCODE in setupConfig().
 * 2. Run setupConfig() once from the Apps Script editor.
 * 3. Authorize the script.
 * 4. Deploy as a Web app and copy the /exec URL.
 */

function setupConfig() {
  PropertiesService.getScriptProperties().setProperties(
    {
      RECIPIENT_EMAIL: "your-email@example.com",
      BRIEF_PASSCODE: "change-this-passcode",
    },
    true
  );
}

function doGet() {
  return htmlResponse_(
    "<p>Brief intake endpoint is live. Submit the brief form from the website.</p>"
  );
}

function doPost(e) {
  var params = (e && e.parameter) || {};
  var multi = (e && e.parameters) || {};
  var props = PropertiesService.getScriptProperties();
  var recipientEmail = props.getProperty("RECIPIENT_EMAIL");
  var expectedPasscode = props.getProperty("BRIEF_PASSCODE");

  if (!recipientEmail || recipientEmail === "your-email@example.com") {
    return htmlResponse_("<p>Server is not configured: recipient email is missing.</p>");
  }

  if (params.website) {
    return htmlResponse_("<p>OK</p>");
  }

  if (expectedPasscode && params.accessCode !== expectedPasscode) {
    return htmlResponse_("<p>Wrong passcode.</p>");
  }

  var selectedServices = (multi.services || []).join(", ");
  var subject = "New website brief" + (params.companyName ? ": " + params.companyName : "");
  var textBody = buildTextBody_(params, selectedServices);
  var htmlBody = buildHtmlBody_(params, selectedServices);

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: textBody,
    htmlBody: htmlBody,
    replyTo: params.email || recipientEmail,
    name: "Website Brief Form",
  });

  return htmlResponse_("<p>Brief sent. Thank you.</p>");
}

function buildTextBody_(params, selectedServices) {
  var lines = [
    "New website brief",
    "",
    "Company: " + value_(params.companyName),
    "Logo: " + value_(params.logoLink),
    "About: " + value_(params.companyAbout),
    "",
    "Phone: " + value_(params.phone),
    "Email: " + value_(params.email),
    "Extra contacts: " + value_(params.extraContacts),
    "",
    "Services: " + value_(selectedServices),
    "Other services / priorities: " + value_(params.otherServices),
    "",
    "Service areas: " + value_(params.serviceAreas),
    "Priority locations: " + value_(params.priorityLocations),
    "",
    "Project photos: " + value_(params.projectPhotos),
    "Photo captions: " + value_(params.photoCaptions),
    "",
    "Reviews: " + value_(params.reviews),
    "Reviews link: " + value_(params.reviewsLink),
    "",
    "Important notes: " + value_(params.importantNotes),
    "",
    "Submitted at: " + new Date().toISOString(),
  ];

  return lines.join("\n");
}

function buildHtmlBody_(params, selectedServices) {
  var rows = [
    ["Company", params.companyName],
    ["Logo", params.logoLink],
    ["About", params.companyAbout],
    ["Phone", params.phone],
    ["Email", params.email],
    ["Extra contacts", params.extraContacts],
    ["Services", selectedServices],
    ["Other services / priorities", params.otherServices],
    ["Service areas", params.serviceAreas],
    ["Priority locations", params.priorityLocations],
    ["Project photos", params.projectPhotos],
    ["Photo captions", params.photoCaptions],
    ["Reviews", params.reviews],
    ["Reviews link", params.reviewsLink],
    ["Important notes", params.importantNotes],
    ["Submitted at", new Date().toISOString()],
  ];

  var htmlRows = rows
    .map(function (row) {
      return (
        "<tr>" +
        "<th style=\"text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #ddd;\">" +
        escapeHtml_(row[0]) +
        "</th>" +
        "<td style=\"white-space:pre-wrap;padding:8px;border-bottom:1px solid #ddd;\">" +
        escapeHtml_(value_(row[1])) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    "<h2>New website brief</h2>" +
    "<table style=\"border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;\">" +
    htmlRows +
    "</table>"
  );
}

function value_(value) {
  return value ? String(value).trim() : "Not provided";
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlResponse_(html) {
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL
  );
}
