// Reservas web de Andreas → planilla "RESERVAS ANDREAS 2026-2027"
// Se publica como aplicación web: Ejecutar como "Yo", acceso "Cualquier persona".
// La clave compartida se guarda en Configuración del proyecto → Propiedades de la secuencia de comandos: CLAVE
var CLAVE = PropertiesService.getScriptProperties().getProperty('CLAVE');
var PLANILLA = '106QwiSZ47F7HYOBMrigADE23rGu2uHG_DhcnZlVTeXM';
var AVISO = 'administracion.andreasbar@gmail.com';
var DURACION = 90; // minutos que ocupa una mesa
var MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
var ENCABEZADO = ['FECHA','HORA','NOMBRE','PERSONAS','WHATSAPP','CANAL','¿VINO?','GASTÓ','NOTAS','MESA','CORREO'];

function responder(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function hoja(fecha) {
  var p = fecha.split('-'), nombre = MESES[+p[1] - 1] + ' ' + p[0];
  var ss = SpreadsheetApp.openById(PLANILLA), h = ss.getSheetByName(nombre);
  if (!h) { h = ss.insertSheet(nombre); h.getRange(1, 1, 1, ENCABEZADO.length).setValues([ENCABEZADO]).setFontWeight('bold'); h.setFrozenRows(1); }
  return h;
}
function texto(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  var s = String(v || '').trim(), m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) : s;
}
function hhmm(v, tz) { return v instanceof Date ? Utilities.formatDate(v, tz, 'HH:mm') : String(v || '').slice(0, 5); }
function minutos(h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; }

function ocupadas(fecha) {
  var h = hoja(fecha), tz = h.getParent().getSpreadsheetTimeZone(), n = h.getLastRow();
  if (n < 2) return [];
  return h.getRange(2, 1, n - 1, 11).getValues()
    .filter(function (r) { return r[9] && texto(r[0], tz) === fecha && String(r[6]) !== 'No'; })
    .map(function (r) { return { mesa: String(r[9]), hora: hhmm(r[1], tz) }; });
}

function doGet(e) {
  if (!CLAVE || e.parameter.clave !== CLAVE) return responder({ error: 'clave' });
  return responder({ ocupadas: ocupadas(e.parameter.fecha) });
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents || '{}');
  if (!CLAVE || d.clave !== CLAVE) return responder({ error: 'clave' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var m = minutos(d.hora);
    var choca = ocupadas(d.fecha).some(function (o) { return o.mesa === d.mesa && Math.abs(minutos(o.hora) - m) < DURACION; });
    if (choca) return responder({ error: 'ocupada' });
    var h = hoja(d.fecha), p = d.fecha.split('-');
    h.appendRow([p[2] + '/' + p[1] + '/' + p[0], d.hora, d.nombre, d.personas, '', 'Web', '', '', d.zona === 'patio' ? 'Patio' : 'Salón', d.mesa, d.email]);
  } finally { lock.releaseLock(); }
  var fechaTxt = d.fecha.split('-').reverse().join('/');
  try {
    MailApp.sendEmail(AVISO, 'Reserva web: ' + fechaTxt + ' ' + d.hora + ' · Mesa ' + d.mesa,
      d.nombre + ' reservó la mesa ' + d.mesa + ' (' + (d.zona === 'patio' ? 'patio' : 'salón') + ') para ' + d.personas + ' personas, el ' + fechaTxt + ' a las ' + d.hora + '.\nCorreo: ' + d.email);
    var en = d.lang === 'en';
    MailApp.sendEmail(d.email, en ? 'Your table at Andreas is booked' : 'Tu mesa en Andreas está reservada',
      en ? 'Hi ' + d.nombre + ',\n\nYour table is booked: table ' + d.mesa + ', ' + fechaTxt + ' at ' + d.hora + ', ' + d.personas + ' people.\nSan Martín 351, El Chaltén.\n\nIf your plans change, write to us on WhatsApp: +54 9 11 2784-3427.\n\nSee you soon,\nAndreas – Food & Drinks for Adventurers'
         : 'Hola ' + d.nombre + ',\n\nTu mesa está reservada: mesa ' + d.mesa + ', el ' + fechaTxt + ' a las ' + d.hora + ', ' + d.personas + ' personas.\nSan Martín 351, El Chaltén.\n\nSi cambian tus planes, avisanos por WhatsApp: +54 9 11 2784-3427.\n\nTe esperamos,\nAndreas – Food & Drinks for Adventurers',
      { name: 'Andreas – Food & Drinks', replyTo: AVISO });
  } catch (err) {}
  return responder({ ok: true });
}
