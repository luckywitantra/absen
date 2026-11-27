/**

 * HC SUPER APP API v20.3 - AIMOY FRANCHISE · v51 SELF-REGISTRATION APPROVAL

 * Fitur: Import Bulk CSV, Analytics Fix, Liveness, Day-Off, Manual HRD, Anti-Filter Protection, Ambang Lembur, Lock-Queue Fix

 */



const TIMEZONE = "GMT+8";



function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return sendJSON({status:'error', message:'Permintaan kosong.'});
    const req = JSON.parse(e.postData.contents);
    const action = String(req.action || '');
    const p = req.payload || {};
    if (action === 'admin_login') return sendJSON(adminLogin_(p));
    if (action === 'employee_login') return sendJSON(employeeLogin_(p));
    if (action === 'registration_init') return sendJSON(employeeRegistrationInit_());
    if (action === 'employee_registration_check_face') return sendJSON(employeeRegistrationCheckFace_(p));
    if (action === 'employee_registration_submit') return sendJSON(employeeRegistrationSubmit_(p));
    if (action === 'employee_registration_status') return sendJSON(employeeRegistrationStatus_(p));
    if (action === 'employee_mini_dashboard') return sendJSON(employeeMiniDashboard_(p));
    if (action === 'employee_attendance_summary') return sendJSON(employeeAttendanceSummary_(p));
    if (action === 'employee_off_schedule_options') return sendJSON(employeeOffScheduleOptions_(p));
    if (action === 'employee_self_service') { const ep=verifyEmployeeToken_(req.employeeToken); return sendJSON(ep ? employeeSelfService_(ep) : {status:'error',code:'AUTH_REQUIRED',message:'Sesi karyawan berakhir. Silakan masuk kembali.'}); }
    if (action === 'employee_submit_request') { const ep=verifyEmployeeToken_(req.employeeToken); return sendJSON(ep ? employeeSubmitRequest_(ep,p) : {status:'error',code:'AUTH_REQUIRED',message:'Sesi karyawan berakhir. Silakan masuk kembali.'}); }
    const adminOnly = [
      'absen_manual','import_csv_absen','hapus_absen','enroll','tarik_laporan',
      'edit_karyawan','hapus_karyawan','tambah_outlet','edit_outlet','hapus_outlet',
      'tambah_shift','edit_shift','hapus_shift','hapus_jadwal_lama','hapus_log_libur',
      'init_admin','dashboard_summary','get_followups','request_decision','schedule_generate','schedule_list','schedule_publish','attendance_monitoring_data',
      'analytics_summary','generate_monthly_report','backup_create','create_employee_account',
      'admin_list_employee_accounts','revoke_employee_account','setup_daily_backup','setup_monthly_report','setup_anomaly_watch',
      'employee_registration_list','employee_registration_decision','employee_mini_dashboard_access_list','employee_mini_dashboard_access_set','shift_swap_decision'
    ];
    if (adminOnly.indexOf(action) >= 0 && !verifyAdminToken_(req.adminToken)) {
      logSecurityEvent_('DENIED', action, 'Token admin tidak valid/kedaluwarsa');
      return sendJSON({status:'error', code:'AUTH_REQUIRED', message:'Sesi admin tidak valid atau telah berakhir. Silakan masuk kembali.'});
    }
    let result;
    switch (action) {
      case 'init': result = initKioskSystem_(req.employeeToken); break;
      case 'init_admin': result = initAdminSystem_(); break;
      case 'dashboard_summary': result = dashboardSummary_(p); break;
      case 'get_followups': result = getFollowups_(p); break;
      case 'request_decision': result = requestDecision_(p); break;
      case 'schedule_generate': result = generateSchedule_(p); break;
      case 'schedule_list': result = listSchedule_(p); break;
      case 'attendance_monitoring_data': result = attendanceMonitoringData_(p); break;
      case 'schedule_publish': result = publishSchedule_(p); break;
      case 'analytics_summary': result = analyticsSummary_(p); break;
      case 'generate_monthly_report': result = generateMonthlyReport_(p); break;
      case 'backup_create': result = createBackup_(); break;
      case 'create_employee_account': result = createEmployeeAccount_(p); break;
      case 'admin_list_employee_accounts': result = listEmployeeAccounts_(); break;
      case 'revoke_employee_account': result = revokeEmployeeAccount_(p); break;
      case 'employee_registration_list': result = listEmployeeRegistrationRequests_(); break;
      case 'employee_registration_decision': result = decideEmployeeRegistration_(p, req.adminToken); break;
      case 'shift_swap_decision': result = decideShiftSwap_(p, req.adminToken); break;
      case 'employee_mini_dashboard_access_list': result = listMiniDashboardAccess_(); break;
      case 'employee_mini_dashboard_access_set': result = setMiniDashboardAccess_(p, req.adminToken); break;
      case 'employee_mini_dashboard': result = employeeMiniDashboard_(p); break;
      case 'setup_daily_backup': result = setupDailyBackup_(); break;
      case 'setup_monthly_report': result = setupMonthlyReportTrigger_(); break;
      case 'setup_anomaly_watch': result = setupAnomalyWatch_(); break;
      case 'absen': {
        if(PropertiesService.getScriptProperties().getProperty('AIMOY_REQUIRE_EMPLOYEE_TOKEN')!=='false'){
          const ep=verifyEmployeeToken_(req.employeeToken);
          if(!ep)return sendJSON({status:'error',code:'EMPLOYEE_AUTH_REQUIRED',message:'Login karyawan diperlukan sebelum absensi.'});
          if(String(p.nama)!==String(ep.nama)||String(p.outlet)!==String(ep.outlet)||String(p.employeeId||'')!==String(ep.employeeId||''))return sendJSON({status:'error',code:'IDENTITY_MISMATCH',message:'Identitas atau ID karyawan tidak sesuai akun yang sedang login.'});
        }
        result = prosesAbsensi(p); break;
      }
      case 'absen_manual': result = absenManual(p); break;
      case 'import_csv_absen': result = importCsvAbsen(p); break;
      case 'hapus_absen': result = hapusAbsen(p); break;
      case 'enroll': result = daftarWajah(p); break;
      case 'tarik_laporan': result = getLaporanAdmin(p); break;
      case 'edit_karyawan': result = editKaryawan(p); break;
      case 'hapus_karyawan': result = hapusKaryawan(p); break;
      case 'tambah_outlet': result = tambahOutlet(p); break;
      case 'edit_outlet': result = editOutlet(p); break;
      case 'hapus_outlet': result = hapusOutlet(p); break;
      case 'tambah_shift': result = tambahShift(p); break;
      case 'edit_shift': result = editShift(p); break;
      case 'hapus_shift': result = hapusShift(p); break;
      case 'hapus_jadwal_lama': result = hapusJadwalLama(p); break;
      case 'hapus_log_libur': result = hapusLogLiburSaja(p); break;
      default: return sendJSON({status:'error', message:'Aksi tidak dikenal.'});
    }
    if (adminOnly.indexOf(action) >= 0) logAudit_(action, p, result && result.status || 'unknown');
    return sendJSON(result);
  } catch (err) {
    logSecurityEvent_('ERROR', 'doPost', String(err && err.message || err));
    return sendJSON({status:'error', message:'Terjadi kesalahan server. Periksa log eksekusi Apps Script.'});
  }
}

// === AIMOY SECURITY LAYER ===
// Configure once from the bound Apps Script editor using configureAimoyAdminSecurity().
// Store only a salted SHA-256 password hash and a random signing secret in Script Properties.
function configureAimoyAdminSecurity() {
  const ui = SpreadsheetApp.getUi();
  const u = ui.prompt('Konfigurasi Akun Admin AiMoy', 'Username admin (contoh: admin)', ui.ButtonSet.OK_CANCEL);
  if (u.getSelectedButton() !== ui.Button.OK) return 'Dibatalkan.';
  const username = String(u.getResponseText() || '').trim();
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) throw new Error('Username 3-40 karakter: huruf, angka, titik, garis bawah, atau strip.');
  const p = ui.prompt('Konfigurasi Akun Admin AiMoy', 'Password admin minimal 10 karakter. Password hanya disimpan sebagai hash bersalt.', ui.ButtonSet.OK_CANCEL);
  if (p.getSelectedButton() !== ui.Button.OK) return 'Dibatalkan.';
  const password = String(p.getResponseText() || '');
  if (password.length < 10) throw new Error('Password minimal 10 karakter.');
  const props = PropertiesService.getScriptProperties();
  const salt = Utilities.getUuid() + Utilities.getUuid();
  props.setProperty('AIMOY_ADMIN_USERNAME', username);
  props.setProperty('AIMOY_ADMIN_PASSWORD_SALT', salt);
  props.setProperty('AIMOY_ADMIN_PASSWORD_HASH', sha256Hex_(salt + ':' + password));
  props.setProperty('AIMOY_REQUIRE_EMPLOYEE_TOKEN','true');
  props.setProperty('AIMOY_TOKEN_SECRET', Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid());
  // Disable old shared-PIN login after username/password setup.
  props.deleteProperty('AIMOY_ADMIN_PIN_SALT');
  props.deleteProperty('AIMOY_ADMIN_PIN_HASH');
  ui.alert('Akun admin tersimpan', 'Username dan hash password tersimpan di Script Properties. Deploy versi baru dan uji login.', ui.ButtonSet.OK);
  return 'Konfigurasi selesai.';
}

/** Aktifkan kiosk absensi bersama tanpa username/password per karyawan.
 * Jalankan manual oleh pemilik/admin dari editor Apps Script setelah memahami risiko.
 * Admin tetap wajib login; pendaftaran wajah tetap melalui endpoint admin.
 * Mode kiosk mengandalkan pencocokan wajah di browser dan TIDAK setara dengan verifikasi biometrik server-side.
 */
function configureAimoyKioskNoLogin() {
  const ui=SpreadsheetApp.getUi();
  const confirm=ui.alert('Aktifkan Kiosk Tanpa Login Pegawai',
    'Pegawai dapat absen tanpa username/password. Kiosk akan memuat template wajah untuk pencocokan di browser. Pastikan perangkat fisik dikendalikan dan hanya digunakan di outlet. Lanjutkan?',ui.ButtonSet.YES_NO);
  if(confirm!==ui.Button.YES)return 'Dibatalkan.';
  PropertiesService.getScriptProperties().setProperty('AIMOY_REQUIRE_EMPLOYEE_TOKEN','false');
  logSecurityEvent_('KIOSK_NO_LOGIN_ENABLED','configureAimoyKioskNoLogin','Diaktifkan manual dari editor Apps Script');
  ui.alert('Mode kiosk aktif','Pegawai tidak perlu login untuk absensi. Pendaftaran wajah tetap harus dilakukan oleh admin. Uji dahulu pada deployment staging.',ui.ButtonSet.OK);
  return 'Mode kiosk tanpa login diaktifkan.';
}

function adminLogin_(p) {
  const loginKey='admin:'+String(p.username||'').trim().toLowerCase();
  if(loginRateLimited_(loginKey)) return {status:'error',message:'Terlalu banyak percobaan login. Coba lagi sekitar 15 menit.'};
  const props = PropertiesService.getScriptProperties();
  const username = String(p.username || '').trim();
  const password = String(p.password || '');
  const expectedUser = props.getProperty('AIMOY_ADMIN_USERNAME');
  const salt = props.getProperty('AIMOY_ADMIN_PASSWORD_SALT');
  const expected = props.getProperty('AIMOY_ADMIN_PASSWORD_HASH');
  const secret = props.getProperty('AIMOY_TOKEN_SECRET');
  if (!expectedUser || !salt || !expected || !secret) return {status:'error', code:'SECURITY_NOT_CONFIGURED', message:'Akun admin belum dikonfigurasi. Jalankan configureAimoyAdminSecurity() dari editor Apps Script.'};
  if (username !== expectedUser || sha256Hex_(salt + ':' + password) !== expected) {
    recordLoginFailure_(loginKey);
    logSecurityEvent_('LOGIN_FAILED', 'admin_login', 'Username/password tidak cocok');
    return {status:'error', message:'Username atau password salah.'};
  }
  clearLoginFailures_(loginKey);
  const payload = {sub:'admin:' + username, role:'admin', iat:Date.now(), exp:Date.now() + 8*60*60*1000, nonce:Utilities.getUuid()};
  const encoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/,'');
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(encoded, secret)).replace(/=+$/,'');
  logSecurityEvent_('LOGIN_SUCCESS', 'admin_login', 'Sesi admin dibuat: ' + username);
  return {status:'success', token:encoded + '.' + signature, expiresAt:payload.exp, username:username};
}
function loginRateKey_(key){return 'aimoy_login_fail_'+sha256Hex_(String(key)).slice(0,24);}
function loginRateLimited_(key){return Number(CacheService.getScriptCache().get(loginRateKey_(key))||0)>=5;}
function recordLoginFailure_(key){const c=CacheService.getScriptCache(),k=loginRateKey_(key),n=Number(c.get(k)||0)+1;c.put(k,String(n),900);}
function clearLoginFailures_(key){CacheService.getScriptCache().remove(loginRateKey_(key));}
function issueEmployeeToken_(username, name, outlet, employeeId) {
  const secret = PropertiesService.getScriptProperties().getProperty('AIMOY_TOKEN_SECRET');
  if (!secret) throw new Error('Secret sesi belum dikonfigurasi.');
  const payload = {sub:'employee:' + username, role:'employee', nama:name, outlet:outlet, employeeId:String(employeeId||''), iat:Date.now(), exp:Date.now()+12*60*60*1000, nonce:Utilities.getUuid()};
  const encoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/,'');
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(encoded, secret)).replace(/=+$/,'');
  return {token:encoded+'.'+signature, expiresAt:payload.exp};
}
function readSignedToken_(token) {
  try {
    const secret=PropertiesService.getScriptProperties().getProperty('AIMOY_TOKEN_SECRET');
    if(!secret || !token || String(token).length>2048) return null;
    const parts=String(token).split('.'); if(parts.length!==2) return null;
    const expected=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0],secret)).replace(/=+$/,'');
    if(expected!==parts[1]) return null;
    const payload=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
    return Number(payload.exp)>Date.now()?payload:null;
  } catch(e) { return null; }
}
function verifyAdminToken_(token) {
  const payload = readSignedToken_(token);
  return !!payload && payload.role === 'admin' && String(payload.sub || '').indexOf('admin:') === 0;
}
function verifyEmployeeToken_(token) {
  const payload = readSignedToken_(token);
  if(!payload || payload.role!=='employee' || String(payload.sub||'').indexOf('employee:')!==0) return null;
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet(),username=String(payload.sub).replace(/^employee:/,'');
    const sh=ss.getSheetByName('Akun_Karyawan'); if(!sh)return null;
    const rows=sh.getDataRange().getDisplayValues().slice(1); const account=rows.find(r=>r[0]===username&&r[1]===payload.nama&&r[2]===payload.outlet&&r[6]==='TRUE'&&r[9]===String(payload.employeeId||''));
    const master=ss.getSheetByName('Data_Karyawan'); if(!master)return null;
    const staff=master.getDataRange().getDisplayValues().slice(1).some(r=>r[1]===payload.nama&&r[3]===payload.outlet&&r[5]===String(payload.employeeId||''));
    return account&&staff?payload:null;
  } catch(e){return null;}
}
function sha256Hex_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)
    .map(function(b){ const v=(b<0?b+256:b).toString(16); return v.length===1?'0'+v:v; }).join('');
}
function logSecurityEvent_(event, action, detail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('Log_Keamanan');
    if (!sh) { sh = ss.insertSheet('Log_Keamanan'); sh.appendRow(['Timestamp','Event','Action','Detail']); sh.setFrozenRows(1); sh.getRange(1,1,1,4).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff'); }
    sh.appendRow([new Date(), String(event).slice(0,80), String(action).slice(0,100), String(detail).slice(0,500)]);
  } catch (_) {}
}
function logAudit_(action, payload, result) {
  const summary = {status:result, keys:Object.keys(payload || {}).filter(k => !/foto|descriptor|pin|token|password/i.test(k))};
  logSecurityEvent_('ADMIN_ACTION', action, JSON.stringify(summary));
}


function sendJSON(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }



// ==========================================

// 🚀 FUNGSI HELPER: ANTI-FILTER PROTECTION

// ==========================================

// Fungsi ini memastikan tidak ada data yang hilang/tertimpa karena filter sedang aktif

function removeFilterSafely(sheet) {

  const filter = sheet.getFilter();

  if (filter) {

    filter.remove();

  }

}



function initSystem() {

  ensureFeatureSheets_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const reqSheets = ['Data_Absen', 'Data_Karyawan', 'Master_Shift', 'Master_Outlet'];

  reqSheets.forEach(name => {

    let sheet = ss.getSheetByName(name);

    if (!sheet) {

      sheet = ss.insertSheet(name);

      if (name === 'Master_Shift') sheet.appendRow(['Nama Outlet', 'Kode Shift', 'Jam Masuk', 'Jam Keluar', 'Toleransi Telat (Menit)', 'Syarat Min Lembur (Menit)']);

      else if (name === 'Master_Outlet') {

        sheet.appendRow(['Nama Outlet', 'Latitude', 'Longitude', 'Radius (Meter)']);

        sheet.appendRow(['Outlet Pusat', "'-1.269160", "'116.825264", '50']); 

      }

      else if (name === 'Data_Absen') sheet.appendRow(['Timestamp', 'Tanggal', 'Jam', 'Nama', 'Role', 'Outlet', 'Shift', 'Tipe', 'Status', 'Jarak/Ket', 'Lembur (Mnt)', 'Foto Absen', 'Request_ID', 'Employee_ID']);

      else if (name === 'Data_Karyawan') sheet.appendRow(['Timestamp', 'Nama', 'Role', 'Outlet', 'Face_Descriptor', 'Employee_ID']);

      sheet.getRange("A1:L1").setFontWeight("bold").setBackground("#1e293b").setFontColor("white");

    }

  });

  // Add stable IDs in new trailing columns without moving legacy fields.
  const employeeSheet=ss.getSheetByName('Data_Karyawan');
  if(employeeSheet.getLastColumn()<6) employeeSheet.getRange(1,6).setValue('Employee_ID');
  const employeeValues=employeeSheet.getDataRange().getValues();
  for(let i=1;i<employeeValues.length;i++) if(employeeValues[i][1] && !employeeValues[i][5]) employeeSheet.getRange(i+1,6).setValue(Utilities.getUuid());
  migrateFeatureEmployeeIds_();
  const attendanceSheet=ss.getSheetByName('Data_Absen');
  if(attendanceSheet.getLastColumn()<13) attendanceSheet.getRange(1,13).setValue('Request_ID');
  if(attendanceSheet.getLastColumn()<14) attendanceSheet.getRange(1,14).setValue('Employee_ID');

  const getDisplayRows = (s) => ss.getSheetByName(s).getDataRange().getDisplayValues().slice(1);

  const getRawRows = (s) => ss.getSheetByName(s).getDataRange().getValues().slice(1); 

  const today = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd");

  const dataAbsen = getRawRows('Data_Absen');

  const jadwalHariIni = dataAbsen.filter(r => {

      let tgl = r[1]; if(tgl instanceof Date) tgl = Utilities.formatDate(tgl, TIMEZONE, "yyyy-MM-dd");

      return tgl === today;

  }).map(r => ({ nama: r[3], shift: r[6], tipe: r[7], status: r[8] }));



  return { 

    status: 'ready', 

    dataKaryawan: getRawRows('Data_Karyawan').map(r => ({ ts: Utilities.formatDate(new Date(r[0]), TIMEZONE, "yyyy-MM-dd"), nama: r[1], role: r[2], outlet: r[3], descriptor: r[4] ? JSON.parse(r[4]) : [], id: String(r[5] || '') })), 

    dataShift: getDisplayRows('Master_Shift').map(r => ({ outlet: r[0], kode: r[1], jamMasuk: r[2], jamKeluar: r[3], toleransi: r[4], ambangLembur: r[5] || '60' })),

    dataOutlet: getDisplayRows('Master_Outlet').map(r => ({ nama: r[0], lat: r[1].replace(/'/g, ''), lng: r[2].replace(/'/g, ''), radius: r[3] })),

    jadwalHariIni: jadwalHariIni 

  };

}



// === AIMOY HC ENTERPRISE ADDITIVE MODULES v49 ===
// Existing sheets/columns remain unchanged. New workflows use dedicated sheets.
function ensureSheet_(name, headers) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); let sh=ss.getSheetByName(name);
  if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1);sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');}
  else if(sh.getLastColumn()<headers.length){const start=sh.getLastColumn()+1;sh.getRange(1,start,1,headers.length-start+1).setValues([headers.slice(start-1)]);}
  return sh;
}
function migrateFeatureEmployeeIds_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet(),master=ss.getSheetByName('Data_Karyawan');if(!master)return;
  const rows=master.getDataRange().getDisplayValues().slice(1),byKey={};rows.forEach(r=>{if(r[1]&&r[3]&&r[5]){const key=r[1]+'|'+r[3];(byKey[key]||(byKey[key]=[])).push(r[5]);}});
  const account=ss.getSheetByName('Akun_Karyawan');if(account){const d=account.getDataRange().getDisplayValues();for(let i=1;i<d.length;i++){if(!d[i][9]){const ids=byKey[d[i][1]+'|'+d[i][2]]||[];if(ids.length===1)account.getRange(i+1,10).setValue(ids[0]);}}}
  const schedule=ss.getSheetByName('Jadwal_HC');if(schedule){const d=schedule.getDataRange().getDisplayValues();for(let i=1;i<d.length;i++){if(!d[i][9]){const ids=byKey[d[i][2]+'|'+d[i][3]]||[];if(ids.length===1)schedule.getRange(i+1,10).setValue(ids[0]);}}}
}
function ensureFeatureSheets_() {
  ensureSheet_('Permohonan_HC',['Request_ID','Dibuat_Pada','Username','Nama','Outlet','Jenis','Tanggal','Detail','Alasan','Status','Diputuskan_Oleh','Diputuskan_Pada','Catatan_Keputusan','Employee_ID']);
  const scheduleSheet=ensureSheet_('Jadwal_HC',['Jadwal_ID','Tanggal','Nama','Outlet','Shift','Status','Dibuat_Pada','Dibuat_Oleh','Catatan','Employee_ID']); if(scheduleSheet.getLastColumn()<10) scheduleSheet.getRange(1,10).setValue('Employee_ID');
  ensureSheet_('Akun_Karyawan',['Username','Nama','Outlet','Role','Salt','Password_Hash','Aktif','Dibuat_Pada','Terakhir_Login','Employee_ID']);
  ensureSheet_('Idempotensi_HC',['Request_ID','Jenis','Dibuat_Pada','Hasil']);
  ensureSheet_('Log_Keamanan',['Timestamp','Event','Action','Detail']);
  ensureSheet_('Laporan_Bulanan_HC',['Periode','Outlet','Terjadwal','Hadir','Terlambat','Izin_Sakit','Alpa','Dihasilkan_Pada']);
  ensureSheet_('Notifikasi_HC',['Notification_ID','Dibuat_Pada','Tanggal','Jenis','Nama','Outlet','Detail','Status']);
  ensureSheet_('Pendaftaran_Karyawan',['Request_ID','Dibuat_Pada','Nama','Role','Outlet','No_HP','Face_Descriptor','Status','Diputuskan_Oleh','Diputuskan_Pada','Catatan_Keputusan']);
}
/** Form pendaftaran mandiri hanya menerima metadata outlet, bukan data biometrik karyawan lain. */
function employeeRegistrationInit_() {
  try {
    ensureFeatureSheets_();
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master_Outlet');
    if(!sh)return {status:'error',message:'Master outlet belum disiapkan. Hubungi owner/admin.'};
    const outlets=sh.getDataRange().getDisplayValues().slice(1).map(r=>String(r[0]||'').trim()).filter(Boolean);
    return {status:'ready',outlets:outlets,featureVersion: 78};
  } catch(e) { return {status:'error',message:'Master outlet belum dapat dimuat.'}; }
}
/** Jarak Euclidean face-api.js. Ambang konservatif untuk menandai wajah yang kemungkinan sama. */
const AIMOY_FACE_DUPLICATE_THRESHOLD = 0.48;
function parseFaceDescriptor_(raw) {
  try { const v=Array.isArray(raw)?raw:JSON.parse(String(raw||'[]')); return Array.isArray(v)&&v.length===128&&v.every(x=>Number.isFinite(Number(x)))?v.map(Number):null; }
  catch(e) { return null; }
}
function faceDistance_(a,b) {
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==128||b.length!==128)return Infinity;
  let sum=0;for(let i=0;i<128;i++){const d=Number(a[i])-Number(b[i]);sum+=d*d;}return Math.sqrt(sum);
}
function findFaceDuplicate_(descriptor, masterRows, pendingRows, excludeRequestId) {
  for(let i=0;i<(masterRows||[]).length;i++) {
    const r=masterRows[i], existing=parseFaceDescriptor_(r[4]); if(!existing)continue;
    const distance=faceDistance_(descriptor,existing);
    if(distance<AIMOY_FACE_DUPLICATE_THRESHOLD)return {found:true,source:'master',nama:String(r[1]||''),outlet:String(r[3]||''),distance:Number(distance.toFixed(4))};
  }
  for(let i=0;i<(pendingRows||[]).length;i++) {
    const r=pendingRows[i];if(!r[0]||String(r[0])===String(excludeRequestId||'')||String(r[7])!=='Menunggu')continue;
    const existing=parseFaceDescriptor_(r[6]);if(!existing)continue;
    const distance=faceDistance_(descriptor,existing);
    if(distance<AIMOY_FACE_DUPLICATE_THRESHOLD)return {found:true,source:'pending',nama:String(r[2]||''),outlet:String(r[4]||''),distance:Number(distance.toFixed(4))};
  }
  return {found:false};
}
/** Pemeriksaan awal duplikasi wajah. Endpoint tidak mengungkap identitas pemilik template pembanding. */
function employeeRegistrationCheckFace_(p) {
  const descriptor=parseFaceDescriptor_(p.descriptor);
  if(!descriptor)return {status:'error',message:'Template wajah tidak valid. Silakan pindai ulang.'};
  const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return {status:'error',message:'Database sedang sibuk. Coba periksa kembali.'};
  try {
    ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),master=ss.getSheetByName('Data_Karyawan'),req=ss.getSheetByName('Pendaftaran_Karyawan');
    if(!master||!req)return {status:'error',message:'Database pendaftaran belum siap. Hubungi owner/admin.'};
    const masterRows=master.getDataRange().getValues().slice(1),pendingRows=req.getDataRange().getValues().slice(1),dup=findFaceDuplicate_(descriptor,masterRows,pendingRows,'');
    if(dup.found){logSecurityEvent_('EMPLOYEE_REGISTRATION_DUPLICATE_BLOCKED','employee_registration_check_face',JSON.stringify({source:dup.source,distance:dup.distance}));return {status:'success',duplicate:true,message:'Wajah terindikasi sudah terdaftar pada database karyawan atau antrean pendaftaran. Anda tidak dapat meneruskan pendaftaran. Hubungi owner/admin untuk pemeriksaan manual.'};}
    return {status:'success',duplicate:false,message:'Pemeriksaan awal tidak menemukan kecocokan wajah.'};
  } catch(e){return {status:'error',message:'Pemeriksaan database wajah gagal. Silakan coba lagi.'};}
  finally {lock.releaseLock();}
}

function employeeRegistrationSubmit_(p) {
  const nama=String(p.nama||'').normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleUpperCase('id-ID'), role=String(p.role||'Staff').trim().slice(0,80), outlet=String(p.outlet||'').trim(), phone=String(p.telepon||'').trim();
  const descriptor=parseFaceDescriptor_(p.descriptor);
  if(p.consent!==true) return {status:'error',message:'Persetujuan pemrosesan data wajib diberikan.'};
  if(nama.length<3||nama.length>100) return {status:'error',message:'Nama lengkap wajib 3–100 karakter.'};
  if(!outlet||outlet.length>100) return {status:'error',message:'Pilih outlet penempatan.'};
  if(phone && !/^[+0-9() .-]{8,20}$/.test(phone)) return {status:'error',message:'Nomor WhatsApp/telepon tidak valid.'};
  if(!descriptor) return {status:'error',message:'Data wajah tidak valid. Silakan ambil ulang.'};
  const lock=LockService.getScriptLock(); if(!lock.tryLock(10000)) return {status:'error',message:'Sistem sedang sibuk. Coba lagi sebentar.'};
  try {
    ensureFeatureSheets_(); const ss=SpreadsheetApp.getActiveSpreadsheet(), master=ss.getSheetByName('Data_Karyawan'), outletSheet=ss.getSheetByName('Master_Outlet'), sh=ss.getSheetByName('Pendaftaran_Karyawan');
    if(!master||!outletSheet)return {status:'error',message:'Master karyawan/outlet belum disiapkan. Hubungi owner/admin.'};
    const validOutlet=outletSheet.getDataRange().getDisplayValues().slice(1).some(r=>String(r[0]).trim()===outlet);
    if(!validOutlet) return {status:'error',message:'Outlet tidak ditemukan. Muat ulang halaman dan pilih outlet yang tersedia.'};
    const existing=master.getDataRange().getValues().slice(1);
    if(existing.some(r=>String(r[1]||'').trim().toLowerCase()===nama.toLowerCase()&&String(r[3]||'').trim()===outlet)) return {status:'error',message:'Nama tersebut sudah terdaftar di outlet ini. Hubungi owner jika perlu pembaruan data.'};
    const pending=sh.getDataRange().getValues().slice(1);
    if(pending.some(r=>String(r[2]||'').trim().toLowerCase()===nama.toLowerCase()&&String(r[4]||'').trim()===outlet&&String(r[7]||'')==='Menunggu')) return {status:'error',message:'Pendaftaran dengan nama dan outlet ini sudah menunggu persetujuan owner.'};
    const duplicate=findFaceDuplicate_(descriptor,existing,pending,'');
    if(duplicate.found) return {status:'error',code:'DUPLICATE_FACE',message:'Wajah ini terdeteksi mirip dengan pendaftaran yang sudah ada ('+duplicate.nama+' · '+duplicate.outlet+'). Pendaftaran dihentikan untuk mencegah data ganda. Jika ini keliru, hubungi owner untuk pemeriksaan manual.'};
    const id=Utilities.getUuid(); sh.appendRow([id,new Date(),nama,role,outlet,phone,JSON.stringify(descriptor),'Menunggu','','','']);
    logSecurityEvent_('EMPLOYEE_REGISTRATION_SUBMITTED','employee_registration_submit',JSON.stringify({requestId:id,nama:nama,outlet:outlet}));
    return {status:'success',message:'Pendaftaran berhasil dikirim dan menunggu persetujuan owner.',requestId:id};
  } finally { lock.releaseLock(); }
}
function listEmployeeRegistrationRequests_() {
  ensureFeatureSheets_(); const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('Pendaftaran_Karyawan'),master=ss.getSheetByName('Data_Karyawan');
  const all=sh.getDataRange().getValues(),masterRows=master?master.getDataRange().getValues().slice(1):[],pendingRows=all.slice(1);
  const rows=pendingRows.filter(r=>r[0]&&String(r[7])==='Menunggu');
  return {status:'success',threshold:AIMOY_FACE_DUPLICATE_THRESHOLD,data:rows.map(r=>{
    const desc=parseFaceDescriptor_(r[6]),dup=desc?findFaceDuplicate_(desc,masterRows,pendingRows,String(r[0])):{found:false};
    return {id:String(r[0]),dibuatPada:r[1] instanceof Date?Utilities.formatDate(r[1],TIMEZONE,'yyyy-MM-dd HH:mm'):String(r[1]),nama:String(r[2]||''),role:String(r[3]||'Staff'),outlet:String(r[4]||''),telepon:String(r[5]||''),hasFace:!!desc,faceDuplicate:dup.found?dup:null};
  })};
}
function decideEmployeeRegistration_(p, adminToken) {
  const id=String(p.id||'').trim(), decision=String(p.keputusan||'').trim(), note=String(p.catatan||'').trim().slice(0,300);
  if(!id||['Disetujui','Ditolak'].indexOf(decision)<0)return {status:'error',message:'Permintaan atau keputusan tidak valid.'};
  const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return {status:'error',message:'Sistem sedang sibuk. Coba lagi.'};
  try {
    ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),reqSheet=ss.getSheetByName('Pendaftaran_Karyawan'),rows=reqSheet.getDataRange().getValues();let row=-1,rec;
    for(let i=1;i<rows.length;i++)if(String(rows[i][0])===id){row=i+1;rec=rows[i];break;}
    if(row<0)return {status:'error',message:'Permohonan pendaftaran tidak ditemukan.'};
    if(String(rec[7])!=='Menunggu')return {status:'error',message:'Permohonan ini sudah diproses sebelumnya.'};
    let employeeId='';
    if(decision==='Disetujui'){
      const nama=String(rec[2]||'').trim(),role=String(rec[3]||'Staff'),outlet=String(rec[4]||'');
      const master=ss.getSheetByName('Data_Karyawan');if(!master)return {status:'error',message:'Master karyawan belum disiapkan. Hubungi owner/admin.'};const existing=master.getDataRange().getDisplayValues().slice(1);
      if(existing.some(r=>String(r[1]||'').trim().toLowerCase()===nama.toLowerCase()&&String(r[3]||'').trim()===outlet))return {status:'error',message:'Tidak dapat menyetujui: nama dan outlet sudah ada di master. Periksa data terlebih dahulu.'};
      const descriptor=parseFaceDescriptor_(rec[6]);
      if(!descriptor)return {status:'error',message:'Descriptor wajah tidak valid; minta pendaftar mengulang registrasi.'};
      const masterRows=master.getDataRange().getValues().slice(1),pendingRows=reqSheet.getDataRange().getValues().slice(1);
      const faceDuplicate=findFaceDuplicate_(descriptor,masterRows,pendingRows,id);
      if(faceDuplicate.found)return {status:'error',code:'DUPLICATE_FACE',message:'Persetujuan diblokir: wajah mirip dengan data '+faceDuplicate.source+' milik '+faceDuplicate.nama+' · '+faceDuplicate.outlet+'. Periksa identitas secara manual sebelum melanjutkan.'};
      employeeId=Utilities.getUuid();master.appendRow([new Date(),nama,role,outlet,JSON.stringify(descriptor),employeeId]);
      logSecurityEvent_('EMPLOYEE_REGISTRATION_APPROVED','employee_registration_decision',JSON.stringify({requestId:id,employeeId:employeeId,approvedBy:(readSignedToken_(adminToken)||{}).sub||'admin'}));
    } else logSecurityEvent_('EMPLOYEE_REGISTRATION_REJECTED','employee_registration_decision',JSON.stringify({requestId:id,rejectedBy:(readSignedToken_(adminToken)||{}).sub||'admin'}));
    const token=readSignedToken_(adminToken)||{};
    reqSheet.getRange(row,8,1,4).setValues([[decision,String(token.sub||'admin'),new Date(),note]]);
    logAudit_('employee_registration_decision',{id:id,keputusan:decision},'success');
    return {status:'success',message:decision==='Disetujui'?'Pendaftaran disetujui. Karyawan kini masuk master dan dapat digunakan untuk absensi wajah.':'Pendaftaran ditolak.',employeeId:employeeId};
  } finally {lock.releaseLock();}
}

/** Employee mini-dashboard access is explicitly controlled by owner. Face descriptor is verified server-side on every public kiosk request. */
function ensureMiniDashboardAccessSheet_(){return ensureSheet_('MiniDashboard_Access',['Employee_ID','Nama','Outlet','Diizinkan','Diubah_Pada','Diubah_Oleh']);}
function listMiniDashboardAccess_(){
  ensureFeatureSheets_();const sh=ensureMiniDashboardAccessSheet_(), rows=sh.getDataRange().getDisplayValues().slice(1), master=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1);
  const byId={};rows.forEach(r=>{if(r[0])byId[String(r[0])]=String(r[3]).toUpperCase()==='TRUE';});
  return {status:'success',data:master.filter(r=>r[5]||r[1]).map(r=>({id:String(r[5]||''),nama:String(r[1]||''),role:String(r[2]||''),outlet:String(r[3]||''),enabled:!!byId[String(r[5]||'')]})).filter(r=>r.id)};
}
function setMiniDashboardAccess_(p,adminToken){
  const id=String(p.employeeId||'').trim();if(!id)return {status:'error',message:'Employee ID tidak valid.'};
  const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return {status:'error',message:'Sistem sedang sibuk. Coba lagi.'};
  try{ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),master=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1),m=master.find(r=>String(r[5])===id);if(!m)return {status:'error',message:'Karyawan tidak ditemukan di master.'};const sh=ensureMiniDashboardAccessSheet_(),rows=sh.getDataRange().getDisplayValues();let row=rows.findIndex((r,i)=>i>0&&String(r[0])===id);const tok=readSignedToken_(adminToken)||{},enabled=p.enabled===true;const values=[id,String(m[1]||''),String(m[3]||''),enabled?'TRUE':'FALSE',new Date(),String(tok.sub||'admin')];if(row>0)sh.getRange(row+1,1,1,6).setValues([values]);else sh.appendRow(values);logSecurityEvent_('MINI_DASHBOARD_ACCESS_CHANGED','employee_mini_dashboard_access_set',JSON.stringify({employeeId:id,enabled:enabled,by:String(tok.sub||'admin')}));return {status:'success',enabled:enabled,message:enabled?'Mini dashboard diizinkan untuk karyawan ini.':'Akses mini dashboard dinonaktifkan.'};}finally{lock.releaseLock();}
}
function employeeRegistrationStatus_(p){
 const desc=parseFaceDescriptor_(p.descriptor);if(!desc)return {status:'error',message:'Wajah belum dapat diverifikasi. Posisikan wajah dan coba kembali.'};
 ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),master=ss.getSheetByName('Data_Karyawan').getDataRange().getValues().slice(1),req=ss.getSheetByName('Pendaftaran_Karyawan').getDataRange().getValues().slice(1);
 const md=master.find(r=>{const d=parseFaceDescriptor_(r[4]);return d&&faceDistance_(desc,d)<AIMOY_FACE_DUPLICATE_THRESHOLD;});if(md)return {status:'authorized',nama:String(md[1]||''),outlet:String(md[3]||''),employeeId:String(md[5]||'')};
 let found=null;for(const r of req){const d=parseFaceDescriptor_(r[6]);if(d&&faceDistance_(desc,d)<AIMOY_FACE_DUPLICATE_THRESHOLD){found=r;break;}}
 if(!found)return {status:'not_found',message:'Wajah belum terdaftar. Silakan pilih menu pendaftaran karyawan baru.'};
 const status=String(found[7]||'');if(status==='Menunggu')return {status:'pending',nama:String(found[2]||''),outlet:String(found[4]||''),requestId:String(found[0]||''),message:'Data pendaftaran Anda belum diotorisasi owner. Absensi belum dapat dilakukan sampai permohonan disetujui.'};
 if(status==='Ditolak')return {status:'rejected',nama:String(found[2]||''),outlet:String(found[4]||''),requestId:String(found[0]||''),message:'Pendaftaran belum disetujui. Hubungi owner untuk informasi dan tindak lanjut.'};
 return {status:'not_found',message:'Status pendaftaran tidak ditemukan. Hubungi owner/admin.'};
}
/** Public kiosk endpoint: expose only future, approved OFF dates for a same-outlet colleague after matching the caller's live face descriptor. */
function employeeOffScheduleOptions_(p){
  const desc=parseFaceDescriptor_(p.descriptor); if(!desc)return {status:'error',code:'FACE_VERIFY_FAILED',message:'Verifikasi wajah tidak valid. Pindai ulang.'};
  ensureFeatureSheets_(); const ss=SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet=ss.getSheetByName('Data_Karyawan'); if(!masterSheet)return {status:'error',message:'Master karyawan belum tersedia.'};
  const master=masterSheet.getDataRange().getValues().slice(1); let caller=null;
  for(const r of master){const d=parseFaceDescriptor_(r[4]);if(d&&faceDistance_(desc,d)<AIMOY_FACE_DUPLICATE_THRESHOLD){caller={id:String(r[5]||'').trim(),nama:String(r[1]||'').trim(),outlet:String(r[3]||'').trim()};break;}}
  if(!caller)return {status:'error',code:'NOT_AUTHORIZED',message:'Wajah pemohon tidak cocok dengan karyawan aktif.'};
  const outlet=String(p.outlet||'').trim(); if(!outlet||outlet!==caller.outlet)return {status:'error',code:'OUTLET_MISMATCH',message:'Outlet tidak sesuai dengan identitas karyawan.'};
  const today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');
  const normName=v=>String(v||'').trim().replace(/\s+/g,' ').toLocaleUpperCase('id-ID');
  const normDate=v=>{
    if(v instanceof Date && !isNaN(v.getTime())) return Utilities.formatDate(v,TIMEZONE,'yyyy-MM-dd');
    const x=String(v||'').trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(x))return x;
    let m=x.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/); if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
    const d=new Date(x); return isNaN(d.getTime())?'':Utilities.formatDate(d,TIMEZONE,'yyyy-MM-dd');
  };
  const staffByName=new Map();
  master.forEach(m=>{if(String(m[3]||'').trim()===caller.outlet){const key=normName(m[1]);if(!staffByName.has(key))staffByName.set(key,[]);staffByName.get(key).push(String(m[5]||'').trim());}});
  const byKey=new Map();
  const add=(r)=>{const nama=String(r.nama||'').trim(),tanggal=String(r.tanggal||'');if(!nama||!tanggal||tanggal<=today)return;const key=normName(nama)+'|'+tanggal;if(!byKey.has(key))byKey.set(key,{nama,tanggal,outlet:caller.outlet,tipe:'OFF',status:r.status||'DAY OFF',sumber:r.sumber||'Data_Absen'});};
  // Prefer approved schedule rows when present. This sheet may be empty in older databases.
  const sh=ss.getSheetByName('Jadwal_HC');
  if(sh&&sh.getLastRow()>1){
    sh.getDataRange().getValues().slice(1).forEach(r=>{
      const nama=String(r[2]||'').trim(),date=normDate(r[1]),rowOutlet=String(r[3]||'').trim(),status=String(r[5]||'').trim(),shift=String(r[4]||'').trim().toUpperCase();
      const validStaff=(staffByName.get(normName(nama))||[]).some(id=>!r[9]||!id||id===String(r[9]).trim());
      if(rowOutlet===caller.outlet&&validStaff&&status==='Disahkan'&&shift==='OFF')add({nama,tanggal:date,status:'Disahkan',sumber:'Jadwal_HC'});
    });
  }
  // Actual workbook structure: Data_Absen rows are [Waktu,Tanggal,Jam,Nama,Role,Outlet,Shift,Tipe_Absen,Status,...].
  // Legacy Jadwal_HC is header-only, while HRD OFF entries are recorded as Libur / DAY OFF here.
  const logSheet=ss.getSheetByName('Data_Absen');
  if(logSheet&&logSheet.getLastRow()>1){
    logSheet.getDataRange().getValues().slice(1).forEach(r=>{
      const nama=String(r[3]||'').trim(),rowOutlet=String(r[5]||'').trim(),type=String(r[7]||'').trim().toLowerCase(),status=String(r[8]||'').trim().toUpperCase(),date=normDate(r[1]);
      if(rowOutlet!==caller.outlet||!staffByName.has(normName(nama)))return;
      if(type==='libur'||type==='off'||status==='DAY OFF'||status==='JADWAL OFF')add({nama,tanggal:date,status:'DAY OFF',sumber:'Data_Absen'});
    });
  }
  const options=Array.from(byKey.values()).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)||a.nama.localeCompare(b.nama));
  logSecurityEvent_('EMPLOYEE_OFF_OPTIONS_VIEW','employee_off_schedule_options',JSON.stringify({employeeId:caller.id,outlet:caller.outlet,count:options.length,source:'Jadwal_HC+Data_Absen'}));
  return {status:'success',data:options,message:options.length?'Jadwal OFF berhasil dimuat dari data jadwal/absensi HRD.':'Tidak ditemukan jadwal OFF mendatang untuk outlet ini. Periksa input Libur/DAY OFF HRD.'};
}

/** Public kiosk recap: returns only current-month counters after server-side face descriptor match. No owner mini-dashboard permission is needed. */
function employeeAttendanceSummary_(p){
 const desc=parseFaceDescriptor_(p.descriptor);if(!desc)return {status:'error',code:'FACE_VERIFY_FAILED',message:'Verifikasi wajah gagal.'};
 ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),masterSheet=ss.getSheetByName('Data_Karyawan');if(!masterSheet)return {status:'error',message:'Master karyawan belum tersedia.'};
 const master=masterSheet.getDataRange().getValues().slice(1);let emp=null;
 for(const r of master){const d=parseFaceDescriptor_(r[4]);if(d&&faceDistance_(desc,d)<AIMOY_FACE_DUPLICATE_THRESHOLD){emp={id:String(r[5]||''),nama:String(r[1]||''),role:String(r[2]||''),outlet:String(r[3]||'')};break;}}
 if(!emp)return {status:'error',code:'NOT_AUTHORIZED',message:'Wajah belum cocok dengan karyawan aktif.'};
 const now=new Date(),month=Utilities.formatDate(now,TIMEZONE,'yyyy-MM'),label=Utilities.formatDate(now,TIMEZONE,'MMMM yyyy');
 const sh=ss.getSheetByName('Data_Absen');const logs=sh&&sh.getLastRow()>1?sh.getDataRange().getDisplayValues().slice(1).filter(r=>(String(r[13]||'')===emp.id)||(!r[13]&&String(r[3]||'')===emp.nama&&String(r[5]||'')===emp.outlet)):[];
 const rows=logs.filter(r=>String(r[1]||'').indexOf(month)===0),present=new Set(),off=new Set(),izin=new Set(),sakit=new Set();
 const normalizeDate=value=>{if(value instanceof Date&&!isNaN(value.getTime()))return Utilities.formatDate(value,TIMEZONE,'yyyy-MM-dd');const s=String(value||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;let m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');const d=new Date(s);return isNaN(d.getTime())?'':Utilities.formatDate(d,TIMEZONE,'yyyy-MM-dd');};
 rows.forEach(r=>{const date=normalizeDate(r[1]);if(!date)return;const type=String(r[7]||'').trim().toLowerCase(),status=String(r[8]||'').trim().toLowerCase(),note=String(r[9]||'').trim().toLowerCase();if(type==='masuk'||type==='tukar shift')present.add(date);if(type==='libur'||type==='off'||status.indexOf('jadwal off')>=0||note.indexOf('jadwal off')>=0)off.add(date);if(type==='izin'||status==='izin')izin.add(date);if(type==='sakit'||status==='sakit')sakit.add(date);});
 // OFF yang telah disahkan dari jadwal kerja menjadi sumber utama; gabungkan log OFF agar catatan manual tetap terlihat.
 const schedule=ss.getSheetByName('Jadwal_HC');if(schedule&&schedule.getLastRow()>1){schedule.getDataRange().getDisplayValues().slice(1).forEach(r=>{const sameEmployee=(String(r[9]||'')===emp.id)||(!r[9]&&String(r[2]||'')===emp.nama&&String(r[3]||'')===emp.outlet);const date=normalizeDate(r[1]);if(sameEmployee&&date.indexOf(month)===0&&String(r[5]||'')==='Disahkan'&&String(r[4]||'').toUpperCase()==='OFF')off.add(date);});}
 const sortDates=set=>Array.from(set).sort();
 const current={periode:month,label:label,hariHadir:present.size,jadwalOff:off.size,izin:izin.size,sakit:sakit.size,tanggalOff:sortDates(off),tanggalIzin:sortDates(izin),tanggalSakit:sortDates(sakit)};
 logSecurityEvent_('EMPLOYEE_ATTENDANCE_SUMMARY_VIEW','employee_attendance_summary',JSON.stringify({employeeId:emp.id,month:month}));
 return {status:'success',employee:emp,current:current};
}

function employeeMiniDashboard_(p){
 const desc=parseFaceDescriptor_(p.descriptor);if(!desc)return {status:'error',code:'FACE_VERIFY_FAILED',message:'Verifikasi wajah gagal.'};
 ensureFeatureSheets_();const ss=SpreadsheetApp.getActiveSpreadsheet(),master=ss.getSheetByName('Data_Karyawan').getDataRange().getValues().slice(1);let emp=null;
 for(const r of master){const d=parseFaceDescriptor_(r[4]);if(d&&faceDistance_(desc,d)<AIMOY_FACE_DUPLICATE_THRESHOLD){emp={id:String(r[5]||''),nama:String(r[1]||''),role:String(r[2]||''),outlet:String(r[3]||'')};break;}}
 if(!emp)return {status:'error',code:'NOT_AUTHORIZED',message:'Wajah belum cocok dengan karyawan aktif.'};
 const access=ensureMiniDashboardAccessSheet_().getDataRange().getDisplayValues().slice(1).find(r=>String(r[0])===emp.id&&String(r[3]).toUpperCase()==='TRUE');if(!access)return {status:'disabled',message:'Mini dashboard belum diaktifkan owner untuk akun Anda.'};
 const now=new Date(),cur=Utilities.formatDate(now,TIMEZONE,'yyyy-MM'),prevDate=new Date(now.getFullYear(),now.getMonth()-1,1),prev=Utilities.formatDate(prevDate,TIMEZONE,'yyyy-MM');
 const logs=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1).filter(r=>(String(r[13]||'')===emp.id)||(!r[13]&&String(r[3]||'')===emp.nama&&String(r[5]||'')===emp.outlet));
 function aggregate(month){const rows=logs.filter(r=>String(r[1]||'').indexOf(month)===0);const counts={total:rows.length,masuk:0,pulang:0,terlambat:0,izin:0,sakit:0,libur:0};rows.forEach(r=>{const t=String(r[7]||'').toLowerCase(),st=String(r[8]||'').toLowerCase();if(t==='masuk'||t==='tukar shift')counts.masuk++;if(t==='pulang')counts.pulang++;if(st.indexOf('telat')>=0||st.indexOf('terlambat')>=0)counts.terlambat++;if(t==='izin')counts.izin++;if(t==='sakit')counts.sakit++;if(t==='libur')counts.libur++;});return {periode:month,...counts,logs:rows.slice(-100).reverse().map(r=>({tanggal:r[1],jam:r[2],tipe:r[7],status:r[8],shift:r[6],keterangan:r[9]}))};}
 const result={status:'success',employee:emp,current:aggregate(cur),previous:aggregate(prev)};logSecurityEvent_('EMPLOYEE_MINI_DASHBOARD_VIEW','employee_mini_dashboard',JSON.stringify({employeeId:emp.id,month:cur}));return result;
}

function initKioskSystem_(employeeToken) {
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('AIMOY_REQUIRE_EMPLOYEE_TOKEN')==='false') return initSystem();
  const ep=verifyEmployeeToken_(employeeToken);
  if(!ep)return {status:'error',code:'EMPLOYEE_AUTH_REQUIRED',message:'Login karyawan diperlukan.'};
  const d=initSystem();
  d.dataKaryawan=(d.dataKaryawan||[]).filter(k=>k.id===ep.employeeId&&k.nama===ep.nama&&k.outlet===ep.outlet);
  if(!d.dataKaryawan.length)return {status:'error',code:'EMPLOYEE_MASTER_MISMATCH',message:'Akun tidak lagi cocok dengan master karyawan. Hubungi admin HC.'};
  if(!d.dataKaryawan[0].descriptor||d.dataKaryawan[0].descriptor.length!==128)return {status:'error',code:'BIOMETRIC_NOT_ENROLLED',message:'Wajah belum didaftarkan. Minta admin HC melakukan registrasi wajah terlebih dahulu.'};
  d.dataOutlet=(d.dataOutlet||[]).filter(o=>o.nama===ep.outlet);
  d.dataShift=(d.dataShift||[]).filter(s=>s.outlet===ep.outlet);
  d.kioskEmployee={username:ep.sub.replace('employee:',''),nama:ep.nama,outlet:ep.outlet,employeeId:ep.employeeId};
  return d;
}
function initAdminSystem_() {
  ensureFeatureSheets_();
  const d=initSystem();
  d.dataKaryawan=(d.dataKaryawan||[]).map(k=>({ts:k.ts,nama:k.nama,role:k.role,outlet:k.outlet,id:k.id,hasBiometric:!!(k.descriptor&&k.descriptor.length)}));
  d.featureVersion='78';
  return d;
}
function employeeLogin_(p) {
  ensureFeatureSheets_(); const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Akun_Karyawan');
  const data=sh.getDataRange().getDisplayValues(); const username=String(p.username||'').trim(); const password=String(p.password||''); const loginKey='employee:'+username.toLowerCase();
  if(loginRateLimited_(loginKey)) return {status:'error',message:'Terlalu banyak percobaan login. Coba lagi sekitar 15 menit.'};
  for(let i=1;i<data.length;i++){
    const r=data[i]; if(r[0]===username && r[6]==='TRUE'){
      if(sha256Hex_(r[4]+':'+password)!==r[5]) { recordLoginFailure_(loginKey); logSecurityEvent_('EMPLOYEE_LOGIN_FAILED','employee_login','Username='+username); return {status:'error',message:'Username atau password salah.'}; }
      clearLoginFailures_(loginKey); sh.getRange(i+1,9).setValue(new Date()); const t=issueEmployeeToken_(r[0],r[1],r[2],r[9]);
      logSecurityEvent_('EMPLOYEE_LOGIN_SUCCESS','employee_login','Username='+username);
      return {status:'success',token:t.token,expiresAt:t.expiresAt,employee:{username:r[0],nama:r[1],outlet:r[2],role:r[3],id:r[9]}};
    }
  }
  recordLoginFailure_(loginKey); logSecurityEvent_('EMPLOYEE_LOGIN_FAILED','employee_login','Username tidak ditemukan: '+username);
  return {status:'error',message:'Username atau password salah, atau akun nonaktif.'};
}
function employeeSelfService_(ep) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); ensureFeatureSheets_();
  const logs=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1).filter(r=>(r[13]===ep.employeeId)||( !r[13] && r[3]===ep.nama && r[5]===ep.outlet)).slice(-120).reverse().map(r=>({timestamp:r[0],tanggal:r[1],jam:r[2],nama:r[3],outlet:r[5],shift:r[6],tipe:r[7],status:r[8],keterangan:r[9],foto:r[11]}));
  const schedule=listSchedule_({employeeId:ep.employeeId,bulan:Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM')});
  const req=ss.getSheetByName('Permohonan_HC').getDataRange().getDisplayValues().slice(1).filter(r=>r[2]===ep.sub.replace('employee:','')).slice(-30).reverse().map(r=>({id:r[0],jenis:r[5],tanggal:r[6],detail:r[7],alasan:r[8],status:r[9],catatan:r[12]}));
  return {status:'success',employee:{username:ep.sub.replace('employee:',''),nama:ep.nama,outlet:ep.outlet,id:ep.employeeId},history:logs,schedule:schedule.data||[],requests:req};
}
function employeeSubmitRequest_(ep,p) {
  ensureFeatureSheets_(); const type=String(p.jenis||''); const allowed=['Izin','Sakit','Koreksi Absensi','Tukar Shift'];
  if(allowed.indexOf(type)<0) return {status:'error',message:'Jenis permohonan tidak valid.'};
  const dateText=String(p.tanggal||'');const dateValue=new Date(dateText+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText)||isNaN(dateValue.getTime())||dateValue.toISOString().slice(0,10)!==dateText||!String(p.alasan||'').trim()) return {status:'error',message:'Tanggal harus valid (YYYY-MM-DD) dan alasan wajib diisi.'};
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('Permohonan_HC'),idem=ss.getSheetByName('Idempotensi_HC');
    const requestId=String(p.requestId||Utilities.getUuid()); const idData=idem.getDataRange().getDisplayValues();
    for(let i=1;i<idData.length;i++)if(idData[i][0]===requestId&&idData[i][1]==='employee_request')return {status:'success',id:idData[i][3],idempotentReplay:true,message:'Permohonan ini sudah diterima sebelumnya.'};
    const id=Utilities.getUuid();sh.appendRow([id,new Date(),ep.sub.replace('employee:',''),ep.nama,ep.outlet,type,p.tanggal,String(p.detail||'').slice(0,500),String(p.alasan).slice(0,1000),'Menunggu','','','',ep.employeeId]);
    idem.appendRow([requestId,'employee_request',new Date(),id]);logSecurityEvent_('REQUEST_CREATED','employee_submit_request',id+' '+type+' '+ep.nama);return {status:'success',id:id,message:'Permohonan dikirim dan menunggu persetujuan.'};
  } finally {lock.releaseLock();}
}
function createEmployeeAccount_(p) {
  ensureFeatureSheets_(); const username=String(p.username||'').trim(), nama=String(p.nama||'').trim(), outlet=String(p.outlet||'').trim(), requestedRole=String(p.role||'').trim(), password=String(p.password||'');
  if(!/^[A-Za-z0-9._-]{3,40}$/.test(username)||!nama||!outlet||password.length<10) return {status:'error',message:'Username 3-40 karakter, nama/outlet wajib, password minimal 10 karakter.'};
  const ss=SpreadsheetApp.getActiveSpreadsheet(); const masterRows=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1); const staff=masterRows.find(r=>(p.employeeId?r[5]===String(p.employeeId):r[1]===nama&&r[3]===outlet)&&r[1]===nama&&r[3]===outlet&&(!requestedRole||r[2]===requestedRole));
  if(!staff) return {status:'error',message:'Karyawan, ID, role, dan outlet harus sesuai Data_Karyawan.'}; const employeeId=staff[5],role=staff[2]||requestedRole||'Staff';
  const sh=ss.getSheetByName('Akun_Karyawan'); if(sh.getDataRange().getDisplayValues().slice(1).some(r=>r[0]===username)) return {status:'error',message:'Username sudah digunakan.'};
  if(sh.getDataRange().getDisplayValues().slice(1).some(r=>r[9]===employeeId&&r[6]==='TRUE'))return {status:'error',message:'Karyawan ini sudah memiliki akun aktif.'};
  const salt=Utilities.getUuid()+Utilities.getUuid(); sh.appendRow([username,nama,outlet,role,salt,sha256Hex_(salt+':'+password),true,new Date(),' ',employeeId]);
  logSecurityEvent_('EMPLOYEE_ACCOUNT_CREATED','create_employee_account','Username='+username+' nama='+nama+' employeeId='+employeeId); return {status:'success',message:'Akun karyawan dibuat.'};
}

function listEmployeeAccounts_() { ensureFeatureSheets_(); return {status:'success',data:SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Akun_Karyawan').getDataRange().getDisplayValues().slice(1).map(r=>({username:r[0],nama:r[1],outlet:r[2],role:r[3],aktif:r[6],dibuat:r[7],loginTerakhir:r[8],employeeId:r[9]}))}; }
function revokeEmployeeAccount_(p) { ensureFeatureSheets_(); const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Akun_Karyawan'); const d=sh.getDataRange().getDisplayValues(); for(let i=1;i<d.length;i++) if(d[i][0]===String(p.username||'')){sh.getRange(i+1,7).setValue(false);logSecurityEvent_('EMPLOYEE_ACCOUNT_REVOKED','revoke_employee_account','Username='+d[i][0]);return {status:'success'};} return {status:'error',message:'Akun tidak ditemukan.'}; }
function dashboardSummary_(p) {
  ensureFeatureSheets_(); p=p||{}; const ss=SpreadsheetApp.getActiveSpreadsheet();
  const today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');
  const selectedOutlet=String(p.outlet||'Semua');
  const outlets=ss.getSheetByName('Master_Outlet').getDataRange().getDisplayValues().slice(1).filter(r=>r[0]);
  const allLogs=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1);
  const allSchedules=ss.getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1);
  const logs=allLogs.filter(r=>r[1]===today&&(selectedOutlet==='Semua'||r[5]===selectedOutlet));
  const schedules=allSchedules.filter(r=>r[1]===today&&r[5]==='Disahkan'&&r[4]!=='OFF'&&(selectedOutlet==='Semua'||r[3]===selectedOutlet));
  const staff=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1).filter(r=>r[1]&&(selectedOutlet==='Semua'||r[3]===selectedOutlet));
  const requests=ss.getSheetByName('Permohonan_HC').getDataRange().getDisplayValues().slice(1).filter(r=>r[9]==='Menunggu');
  const registration=ss.getSheetByName('Pendaftaran_Karyawan').getDataRange().getDisplayValues().slice(1).filter(r=>r[7]==='Menunggu');
  const tukarShiftRows=allLogs.filter(r=>r[7]==='Tukar Shift'&&/Menggantikan .*\(Ganti OFF: .*\) - /.test(String(r[9]||'')));
  const tukarShiftMenunggu=tukarShiftRows.filter(r=>{const st=String(r[8]||'').toUpperCase(),info=String(r[9]||'');return !st.includes('DITOLAK OWNER')&&!st.includes('DISETUJUI OWNER')&&!info.includes('ACC Owner');}).length;
  const byOutlet=outlets.filter(o=>selectedOutlet==='Semua'||o[0]===selectedOutlet).map(o=>{
    const ol=logs.filter(r=>r[5]===o[0]),os=schedules.filter(r=>r[3]===o[0]);
    const present=new Set(ol.filter(r=>['Masuk','Tukar Shift'].includes(r[7])).map(r=>r[3]+'|'+r[5]+'|'+r[6]));
    const pendingOut=ol.filter(r=>r[7]==='Masuk'&&!ol.some(x=>x[3]===r[3]&&x[5]===r[5]&&x[6]===r[6]&&x[7]==='Pulang'));
    return {outlet:o[0],terjadwal:os.length,hadir:present.size,kekurangan:Math.max(0,os.length-present.size),terlambat:ol.filter(r=>String(r[8]).indexOf('TERLAMBAT')===0).length,izin:ol.filter(r=>['Izin','Sakit'].includes(r[7])).length,belumPulang:pendingOut.length};
  });
  const attendance=logs.filter(r=>['Masuk','Tukar Shift'].includes(r[7]));
  const pendingCheckout=logs.filter(r=>r[7]==='Masuk'&&!logs.some(x=>x[3]===r[3]&&x[5]===r[5]&&x[6]===r[6]&&x[7]==='Pulang'));
  const trend=[]; for(let back=6;back>=0;back--){const dt=new Date();dt.setDate(dt.getDate()-back);const day=Utilities.formatDate(dt,TIMEZONE,'yyyy-MM-dd');const dayLogs=allLogs.filter(r=>r[1]===day&&(selectedOutlet==='Semua'||r[5]===selectedOutlet));trend.push({tanggal:day.slice(5),hadir:new Set(dayLogs.filter(r=>['Masuk','Tukar Shift'].includes(r[7])).map(r=>r[3]+'|'+r[5]+'|'+r[6])).size,terlambat:dayLogs.filter(r=>String(r[8]).indexOf('TERLAMBAT')===0).length});}
  const anomalies=logs.filter(r=>String(r[8]).indexOf('TERLAMBAT')===0).length+pendingCheckout.length;
  return {status:'success',tanggal:today,updatedAt:Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd HH:mm:ss'),filterOutlet:selectedOutlet,totalOutlet:outlets.length,totalKaryawan:staff.length,karyawanAktif:staff.length,hadir:new Set(attendance.map(r=>r[3]+'|'+r[5]+'|'+r[6])).size,terlambat:logs.filter(r=>String(r[8]).indexOf('TERLAMBAT')===0).length,izin:logs.filter(r=>['Izin','Sakit'].includes(r[7])).length,menungguPersetujuan:requests.length,pendaftaranMenunggu:registration.length,tukarShiftMenunggu:tukarShiftMenunggu,belumPulang:pendingCheckout.length,anomalyCount:anomalies,byOutlet:byOutlet,trend:trend,catatanJadwal:schedules.length?'Jadwal tersedia untuk hari ini.':'Belum ada jadwal HC yang disahkan untuk hari ini.'};
}
function getFollowups_(p) {
  ensureFeatureSheets_(); const ss=SpreadsheetApp.getActiveSpreadsheet(); const sh=ss.getSheetByName('Permohonan_HC'); const req=sh.getDataRange().getDisplayValues().slice(1).map(r=>({id:r[0],dibuat:r[1],username:r[2],nama:r[3],outlet:r[4],jenis:r[5],tanggal:r[6],detail:r[7],alasan:r[8],status:r[9],diputuskanOleh:r[10],catatan:r[12]})).filter(r=>!p.status||p.status==='Semua'||r.status===p.status).reverse();
  const today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd'); const logs=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1).filter(r=>r[1]===today); const anomalies=[];
  logs.forEach(r=>{if(String(r[8]).indexOf('TERLAMBAT')===0) anomalies.push({jenis:'Terlambat',nama:r[3],outlet:r[5],tanggal:r[1],detail:r[8],status:'Perlu ditinjau'});});
  const schedules=ss.getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1).filter(r=>r[1]===today&&r[5]==='Disahkan'&&r[4]!=='OFF'); schedules.forEach(s=>{const found=logs.some(r=>((r[13]&&s[9]&&r[13]===s[9])||(!r[13]&&r[3]===s[2]&&r[5]===s[3]))&&(r[7]==='Masuk'||r[7]==='Tukar Shift'||r[7]==='Izin'||r[7]==='Sakit'));if(!found) anomalies.push({jenis:'Belum tercatat',nama:s[2],outlet:s[3],tanggal:s[1],detail:'Ada jadwal '+s[4]+' tetapi belum ada log masuk/izin',status:'Perlu ditinjau'});});
  return {status:'success',requests:req,anomalies:anomalies};
}
function requestDecision_(p) {
  ensureFeatureSheets_(); const id=String(p.id||''), decision=String(p.keputusan||''); if(!id||['Disetujui','Ditolak'].indexOf(decision)<0) return {status:'error',message:'ID dan keputusan tidak valid.'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Permohonan_HC'); const d=sh.getDataRange().getDisplayValues(); for(let i=1;i<d.length;i++) if(d[i][0]===id){if(d[i][9]!=='Menunggu')return {status:'error',message:'Permohonan sudah diputuskan.'};sh.getRange(i+1,10,1,4).setValues([[decision,'admin',new Date(),String(p.catatan||'').slice(0,500)]]);logSecurityEvent_('REQUEST_DECIDED','request_decision',id+' '+decision);return {status:'success',message:'Keputusan tersimpan. Koreksi absensi yang disetujui tetap perlu diterapkan melalui alur koreksi resmi.'};} return {status:'error',message:'Permohonan tidak ditemukan.'};
}
function attendanceMonitoringData_(p) {
  ensureFeatureSheets_();
  const date=String(p.tanggal||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return {status:'error',message:'Tanggal harus berformat YYYY-MM-DD.'};
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const scheduleRows=ss.getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1);
  const schedules=scheduleRows.filter(r=>r[1]===date&&r[5]==='Disahkan').map(r=>({id:r[0],tanggal:r[1],nama:r[2],outlet:r[3],shift:r[4],status:r[5],catatan:r[8],employeeId:r[9]}));
  const logRows=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1);
  const logs=logRows.filter(r=>r[1]===date).map(r=>({ts:r[0],tanggal:r[1],jam:r[2],nama:r[3],role:r[4],outlet:r[5],shift:r[6],tipe:r[7],status:r[8],info:r[9],lembur:r[10]||0,foto:r[11]||'-',requestId:r[12]||'',employeeId:String(r[13]||'')}));
  const reqRows=ss.getSheetByName('Permohonan_HC').getDataRange().getDisplayValues().slice(1);
  const requests=reqRows.filter(r=>r[6]===date).map(r=>({id:r[0],dibuat:r[1],username:r[2],nama:r[3],outlet:r[4],jenis:r[5],tanggal:r[6],detail:r[7],alasan:r[8],status:r[9],diputuskanOleh:r[10],catatan:r[12]}));
  return {status:'success',tanggal:date,schedules:schedules,logs:logs,requests:requests,updatedAt:Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd HH:mm:ss')};
}
function listSchedule_(p) { ensureFeatureSheets_(); const d=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1); return {status:'success',data:d.filter(r=>(p.includeDraft===true||r[5]==='Disahkan')&&(!p.bulan||r[1].indexOf(p.bulan)===0)&&(!p.outlet||p.outlet==='Semua'||r[3]===p.outlet)&&(!p.nama||r[2]===p.nama)&&(!p.employeeId||r[9]===p.employeeId)).map(r=>({id:r[0],tanggal:r[1],nama:r[2],outlet:r[3],shift:r[4],status:r[5],catatan:r[8],employeeId:r[9]}))}; }
function publishSchedule_(p) { ensureFeatureSheets_(); const month=String(p.bulan||''),outlet=String(p.outlet||''); if(!/^\d{4}-\d{2}$/.test(month)||!outlet)return {status:'error',message:'Bulan dan outlet wajib dipilih.'}; const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jadwal_HC'),d=sh.getDataRange().getDisplayValues();let count=0;for(let i=1;i<d.length;i++){if(d[i][1].indexOf(month)===0&&d[i][3]===outlet&&d[i][5]==='Draft'){sh.getRange(i+1,6).setValue('Disahkan');count++;}} if(!count)return {status:'error',message:'Tidak ada draft untuk disahkan. Buat draft dahulu atau periksa apakah jadwal sudah disahkan.'};logSecurityEvent_('SCHEDULE_PUBLISHED','schedule_publish',month+' '+outlet+' count='+count);return {status:'success',count:count,message:'Jadwal disahkan. Periksa ulang daftar penugasan sebelum dibagikan ke karyawan.'}; }
function generateSchedule_(p) {
  ensureFeatureSheets_(); const month=String(p.bulan||''); const outlet=String(p.outlet||''); if(!/^\d{4}-\d{2}$/.test(month)||!outlet) return {status:'error',message:'Pilih bulan YYYY-MM dan outlet.'};
  const ss=SpreadsheetApp.getActiveSpreadsheet(); const staff=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1).filter(r=>r[1]&&r[3]===outlet); const shifts=ss.getSheetByName('Master_Shift').getDataRange().getDisplayValues().slice(1).filter(r=>r[0]===outlet); if(!staff.length||!shifts.length)return {status:'error',message:'Outlet harus memiliki karyawan dan aturan shift.'};
  const sh=ss.getSheetByName('Jadwal_HC'); const old=sh.getDataRange().getDisplayValues(); const preserve=[]; for(let i=0;i<old.length;i++){if(i===0){preserve.push(old[i]);continue;}if(!(old[i][1].indexOf(month)===0&&old[i][3]===outlet&&['Draft','Perlu Ditinjau'].includes(old[i][5])))preserve.push(old[i]);} sh.clearContents(); sh.getRange(1,1,preserve.length,preserve[0].length).setValues(preserve);
  const [yy,mm]=month.split('-').map(Number); const days=new Date(yy,mm,0).getDate(); const headcount=Math.max(1,Math.min(20,Number(p.headcountPerShift)||2)); const rows=[]; let idx=0;
  for(let day=1;day<=days;day++){
    const dt=month+'-'+String(day).padStart(2,'0');
    const offToday=staff.filter((s,i)=>((day+i)%7)===0);
    const candidates=staff.filter((s,i)=>((day+i)%7)!==0);
    const rotated=candidates.length?candidates.slice(idx%candidates.length).concat(candidates.slice(0,idx%candidates.length)):[];
    const usedToday={}; let cursor=0;
    shifts.forEach((shift)=>{
      let assigned=0;
      while(assigned<headcount && cursor<rotated.length){
        const person=rotated[cursor++]; if(usedToday[person[1]]) continue;
        usedToday[person[1]]=true; assigned++;
        rows.push([Utilities.getUuid(),dt,person[1],outlet,shift[1],'Draft',new Date(),'admin','Draft otomatis; verifikasi kebutuhan staf dan hari libur sebelum disahkan.',person[5]||'']);
      }
    });
    const rest=offToday.concat(candidates.filter(person=>!usedToday[person[1]]));
    rest.forEach(person=>rows.push([Utilities.getUuid(),dt,person[1],outlet,'OFF','Draft',new Date(),'admin',offToday.some(x=>x[1]===person[1])?'Hari libur rotasi draft.':'Tidak ditugaskan pada shift draft ini; verifikasi sebelum disahkan.',person[5]||'']));
    idx=(idx+1)%Math.max(1,candidates.length);
  }
  if(rows.length) sh.getRange(sh.getLastRow()+1,1,rows.length,10).setValues(rows); logSecurityEvent_('SCHEDULE_DRAFT_CREATED','schedule_generate',month+' '+outlet+' rows='+rows.length); return {status:'success',count:rows.length,message:'Draft jadwal dibuat. Jadwal belum disahkan dan perlu ditinjau supervisor.'};
}
function analyticsSummary_(p) {
  ensureFeatureSheets_(); const month=String(p.bulan||Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM')); const outlet=String(p.outlet||'Semua'); const ss=SpreadsheetApp.getActiveSpreadsheet(); const logs=ss.getSheetByName('Data_Absen').getDataRange().getDisplayValues().slice(1).filter(r=>r[1].indexOf(month)===0&&(outlet==='Semua'||r[5]===outlet)); const schedule=ss.getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1).filter(r=>r[1].indexOf(month)===0&&(outlet==='Semua'||r[3]===outlet)&&r[5]==='Disahkan'&&r[4]!=='OFF');
  const summary={status:'success',bulan:month,outlet:outlet,terjadwal:schedule.length,hadir:logs.filter(r=>['Masuk','Tukar Shift'].includes(r[7])).length,terlambat:logs.filter(r=>String(r[8]).indexOf('TERLAMBAT')===0).length,izinSakit:logs.filter(r=>['Izin','Sakit'].includes(r[7])).length,pulangAwal:logs.filter(r=>String(r[8]).indexOf('PULANG AWAL')===0).length,lembur:logs.filter(r=>Number(r[10])>0).length,totalLog:logs.length,byOutlet:[]};
  const outlets=ss.getSheetByName('Master_Outlet').getDataRange().getDisplayValues().slice(1).map(r=>r[0]).filter(Boolean); summary.byOutlet=outlets.filter(o=>outlet==='Semua'||o===outlet).map(o=>({outlet:o,terjadwal:schedule.filter(r=>r[3]===o&&r[4]!=='OFF').length,hadir:logs.filter(r=>r[5]===o&&['Masuk','Tukar Shift'].includes(r[7])).length,terlambat:logs.filter(r=>r[5]===o&&String(r[8]).indexOf('TERLAMBAT')===0).length,izinSakit:logs.filter(r=>r[5]===o&&['Izin','Sakit'].includes(r[7])).length})); return summary;
}
function generateMonthlyReport_(p) {
  const a=analyticsSummary_(p),sh=ensureSheet_('Laporan_Bulanan_HC',['Periode','Outlet','Terjadwal','Hadir','Terlambat','Izin_Sakit','Alpa','Dihasilkan_Pada']),now=new Date();
  const old=sh.getDataRange().getDisplayValues(),insert=[];let updated=0;
  a.byOutlet.forEach(o=>{const row=[a.bulan,o.outlet,o.terjadwal,o.hadir,o.terlambat,o.izinSakit,Math.max(0,o.terjadwal-o.hadir-o.izinSakit),now];let found=-1;for(let i=1;i<old.length;i++)if(old[i][0]===a.bulan&&old[i][1]===o.outlet){found=i+1;break;}if(found>0){sh.getRange(found,1,1,8).setValues([row]);updated++;}else insert.push(row);});
  if(insert.length)sh.getRange(sh.getLastRow()+1,1,insert.length,8).setValues(insert);
  logSecurityEvent_('MONTHLY_REPORT_GENERATED','generate_monthly_report',a.bulan+' updated='+updated+' inserted='+insert.length);
  return {status:'success',summary:a,message:'Rekap tersimpan/ diperbarui pada sheet Laporan_Bulanan_HC.'};
}
function createBackup_() { const ss=SpreadsheetApp.getActiveSpreadsheet(); const root=DriveApp.getFoldersByName('AiMoy_Backup'); const folder=root.hasNext()?root.next():DriveApp.createFolder('AiMoy_Backup'); const name='Backup_AiMoy_'+Utilities.formatDate(new Date(),TIMEZONE,'yyyyMMdd_HHmmss'); const file=DriveApp.getFileById(ss.getId()).makeCopy(name,folder); logSecurityEvent_('BACKUP_CREATED','backup_create','fileId='+file.getId()); return {status:'success',name:name,fileId:file.getId(),message:'Salinan spreadsheet dibuat di folder AiMoy_Backup. Verifikasi akses dan uji pemulihan secara berkala.'}; }
function setupDailyBackup_() { const existing=ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='dailyBackupAiMoy_'); if(!existing) ScriptApp.newTrigger('dailyBackupAiMoy_').timeBased().everyDays(1).atHour(2).create(); return {status:'success',message:existing?'Trigger backup harian sudah ada.':'Trigger backup harian dibuat.'}; }
function dailyBackupAiMoy_() { createBackup_(); }
function setupMonthlyReportTrigger_() {
  const exists=ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='monthlyReportAiMoy_');
  if(!exists) ScriptApp.newTrigger('monthlyReportAiMoy_').timeBased().onMonthDay(1).atHour(3).create();
  return {status:'success',message:exists?'Trigger rekap bulanan sudah ada.':'Trigger rekap bulanan dibuat pada tanggal 1 sekitar pukul 03.00.'};
}
function monthlyReportAiMoy_() {
  const now=new Date(); const previous=new Date(now.getFullYear(),now.getMonth()-1,1);
  generateMonthlyReport_({bulan:Utilities.formatDate(previous,TIMEZONE,'yyyy-MM'),outlet:'Semua'});
}
function setupAnomalyWatch_() {
  ensureFeatureSheets_(); const exists=ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='hourlyAnomalyWatchAiMoy_');
  if(!exists) ScriptApp.newTrigger('hourlyAnomalyWatchAiMoy_').timeBased().everyHours(1).create();
  return {status:'success',message:exists?'Pemantauan anomali berkala sudah aktif.':'Pemantauan anomali berkala diaktifkan (pemeriksaan tiap jam). Hasil dicatat di Notifikasi_HC; tidak mengirim WhatsApp otomatis.'};
}
function hourlyAnomalyWatchAiMoy_() {
  ensureFeatureSheets_(); const result=getFollowups_({status:'Menunggu'}); const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Notifikasi_HC');
  const existing=sh.getLastRow()>1?sh.getDataRange().getDisplayValues().slice(1):[]; const seen={}; existing.forEach(r=>seen[r[2]+'|'+r[3]+'|'+r[4]+'|'+r[5]]=true);
  const now=new Date(), today=Utilities.formatDate(now,TIMEZONE,'yyyy-MM-dd'), rows=[];
  (result.anomalies||[]).forEach(a=>{const key=today+'|'+a.jenis+'|'+a.nama+'|'+a.outlet;if(!seen[key])rows.push([Utilities.getUuid(),now,today,a.jenis,a.nama,a.outlet,a.detail,'Baru']);});
  if(rows.length)sh.getRange(sh.getLastRow()+1,1,rows.length,8).setValues(rows);
  if(rows.length)logSecurityEvent_('ANOMALY_NOTIFICATIONS_CREATED','hourlyAnomalyWatchAiMoy_',String(rows.length));
}


function simpanFotoDrive(base64Data, namaFile) {

  if (!base64Data) return "-";

  try {

    let folders = DriveApp.getFoldersByName("Foto_Absen_Aicha");

    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Foto_Absen_Aicha");

    // Folder foto baru dipaksa privat; file lama perlu audit permission terpisah.
    try { folder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); }
    catch (sharingError) { logSecurityEvent_('PHOTO_FOLDER_SHARING_CHECK','simpanFotoDrive',String(sharingError.message||sharingError)); }

    let blob = Utilities.newBlob(Utilities.base64Decode(base64Data.split(',')[1]), 'image/jpeg', namaFile + ".jpg");

    return folder.createFile(blob).getUrl();

  } catch(e) { return "Error: " + e.message; }

}



function validasiPayloadAbsensi_(p) {
  if (!p || !String(p.nama || '').trim() || !String(p.outlet || '').trim() || !String(p.tipe || '').trim()) return {ok:false,message:'Nama, outlet, dan tipe absensi wajib diisi.'};
  const ss=SpreadsheetApp.getActiveSpreadsheet(), kSheet=ss.getSheetByName('Data_Karyawan'), oSheet=ss.getSheetByName('Master_Outlet');
  if(!kSheet||!oSheet)return {ok:false,message:'Master karyawan/outlet belum tersedia.'};
  const staff=kSheet.getDataRange().getDisplayValues().slice(1).some(r=>r[1]===String(p.nama)&&r[2]===String(p.role||'')&&r[3]===String(p.outlet)&&(!p.employeeId||r[5]===String(p.employeeId)));
  const outletRows=oSheet.getDataRange().getDisplayValues().slice(1); const outlet=outletRows.find(r=>r[0]===String(p.outlet));
  if(!staff||!outlet)return {ok:false,message:'Identitas karyawan atau outlet tidak cocok dengan data master.'};
  const allowed=['Masuk','Pulang','Izin','Sakit','Tukar Shift','Libur']; if(allowed.indexOf(String(p.tipe))<0)return {ok:false,message:'Tipe absensi tidak dikenal.'};
  if(['Masuk','Pulang','Tukar Shift'].includes(String(p.tipe))){const shifts=ss.getSheetByName('Master_Shift').getDataRange().getDisplayValues().slice(1);if(!shifts.some(r=>r[0]===String(p.outlet)&&r[1]===String(p.namaShift||'')))return {ok:false,message:'Shift tidak sesuai master shift untuk outlet ini.'};}
  const lat=Number(p.lat),lng=Number(p.lng),accuracy=Number(p.accuracy);
  if(p.accuracy===undefined||p.accuracy===null||p.accuracy===''||!isFinite(accuracy))return {ok:false,message:'Akurasi GPS tidak tersedia. Aktifkan lokasi lalu coba kembali.'};
  if(!isFinite(lat)||!isFinite(lng)||lat < -90||lat>90||lng < -180||lng>180)return {ok:false,message:'Koordinat GPS tidak tersedia/valid. Aktifkan lokasi dan coba kembali.'};
  if(!isFinite(accuracy)||accuracy<0||accuracy>150)return {ok:false,message:'Akurasi GPS terlalu rendah. Pindah ke area terbuka lalu coba kembali.'};
  const oLat=Number(String(outlet[1]||'').replace(/[^0-9.\-]/g,'')),oLng=Number(String(outlet[2]||'').replace(/[^0-9.\-]/g,''));
  const radius=Math.max(1,Number(outlet[3])||100);
  if(!isFinite(oLat)||!isFinite(oLng)||Math.abs(oLat)>90||Math.abs(oLng)>180)return {ok:false,message:'Koordinat outlet belum dikonfigurasi dengan benar.'};
  const rad=x=>x*Math.PI/180, dLat=rad(lat-oLat),dLng=rad(lng-oLng),a=Math.sin(dLat/2)**2+Math.cos(rad(oLat))*Math.cos(rad(lat))*Math.sin(dLng/2)**2;
  const distance=6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  if(distance>radius+accuracy)return {ok:false,message:'Lokasi di luar radius outlet. Jarak perkiraan server '+Math.round(distance)+' m; radius '+radius+' m dan akurasi GPS '+Math.round(accuracy)+' m.'};
  return {ok:true,distanceMeters:distance,radius:radius,accuracy:accuracy};
}

function prosesAbsensi(p) {

  const validation=validasiPayloadAbsensi_(p);
  if(!validation.ok)return {status:'error',message:validation.message};
  p.jarak=validation.distanceMeters;
  const lock = LockService.getScriptLock();



  try {

    lock.waitLock(15000); // Mengantre maksimal 15 detik



    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen');

    removeFilterSafely(sheet); // MATIKAN FILTER AGAR TIDAK TERTEMPA



    const now = new Date();

    const tanggalHariIni = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd");

    const jamStr = Utilities.formatDate(now, TIMEZONE, "HH:mm");

    const ts = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd_HH-mm-ss");

    const timestampDB = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss");



    if (sheet.getLastColumn() < 13) sheet.getRange(1,13).setValue('Request_ID');
    if (sheet.getLastColumn() < 14) sheet.getRange(1,14).setValue('Employee_ID');
    const requestId = String(p.requestId || '');
    if (requestId) {
      const ids = sheet.getLastRow() > 1 ? sheet.getRange(2,13,sheet.getLastRow()-1,1).getDisplayValues().flat() : [];
      const duplicateAt = ids.indexOf(requestId);
      if (duplicateAt >= 0) {
        const old = sheet.getRange(duplicateAt+2,1,1,13).getDisplayValues()[0];
        return {status:'success',idempotentReplay:true,message:'Transaksi ini sudah tersimpan sebelumnya; tidak dibuat ulang.',jam:old[2],statusWaktu:old[8],linkFoto:old[11],summaryWA:getRekapBulanIni(sheet,String(p.nama),parseInt(p.ambangLembur||60),now)};
      }
    }
    const dataAbsen = sheet.getDataRange().getValues();

    const semuaAbsenHariIni = dataAbsen.filter(r => {

      let tglLog = r[1]; if (tglLog instanceof Date) tglLog = Utilities.formatDate(tglLog, TIMEZONE, "yyyy-MM-dd");

      return tglLog === tanggalHariIni && r[3] === p.nama;

    });



    const totalMasuk = semuaAbsenHariIni.filter(r => r[7] === 'Masuk' || r[7] === 'Tukar Shift').length;

    const totalPulang = semuaAbsenHariIni.filter(r => r[7] === 'Pulang').length;

    const absenShiftIni = semuaAbsenHariIni.filter(r => r[6] === p.namaShift);

    const sudahMasukShiftIni = absenShiftIni.some(r => r[7] === 'Masuk' || r[7] === 'Tukar Shift');

    const sudahPulangShiftIni = absenShiftIni.some(r => r[7] === 'Pulang');



    const batasLembur = parseInt(p.ambangLembur || 60);



    if (p.tipe === 'Masuk' || p.tipe === 'Tukar Shift') {

        if (totalMasuk > totalPulang) {

            // 🚀 FITUR KIRIM ULANG WA: Ambil log gantung dan kembalikan datanya ke aplikasi

            const lastLog = semuaAbsenHariIni.filter(r => r[7] === 'Masuk' || r[7] === 'Tukar Shift').pop();

            const shiftGantung = lastLog[6];

            const summaryWA = getRekapBulanIni(sheet, p.nama, batasLembur, now);

            // 🚀 FIX TANGGAL 1899: Format ulang jam dari Google Sheets ke format HH:mm biasa

            let jamGantung = lastLog[2];

            if (jamGantung instanceof Date) {

                jamGantung = Utilities.formatDate(jamGantung, TIMEZONE, "HH:mm");

            }

            return {

                status: 'duplicate_masuk', 

                message: `Anda sudah tercatat MASUK di shift ${shiftGantung}.`,

                jam: jamGantung, // <-- Data ini sekarang sudah rapi (misal: "00:09")

                statusWaktu: lastLog[8],

                linkFoto: lastLog[11],

                shiftTarget: shiftGantung,

                summaryWA: summaryWA

            };

        }

        if (sudahMasukShiftIni) return {status: 'error', message: `Sudah Absen Masuk untuk Shift ${p.namaShift}.`};

    }

    if (p.tipe === 'Pulang') {

        if (!sudahMasukShiftIni && p.namaShift !== "-") return {status: 'error', message: `Gagal! Anda belum Absen MASUK.`};

        if (sudahPulangShiftIni) return {status: 'error', message: `Sudah Absen PULANG untuk Shift ${p.namaShift}.`};

    }



    let statusWaktu = "ON TIME", metrik = Math.round(p.jarak) + " m", lemburMnt = 0;



    if (p.tipe === 'Izin') { 

        statusWaktu = "IZIN / SAKIT"; metrik = p.keterangan; 

    } else if (p.tipe === 'Tukar Shift') {

        statusWaktu = "MENUNGGU OTORISASI"; metrik = p.keterangan;

    } else if (p.tipe === 'Masuk' && p.shiftTarget) {

        const mAktual = parseInt(jamStr.split(':')[0]) * 60 + parseInt(jamStr.split(':')[1]);

        const mShift = parseInt(p.shiftTarget.split(':')[0]) * 60 + parseInt(p.shiftTarget.split(':')[1]);

        if (mAktual > (mShift + parseInt(p.toleransi || 15))) statusWaktu = `TERLAMBAT (${mAktual - mShift} mnt)`;

    } else if (p.tipe === 'Pulang' && p.shiftKeluar) {

        const pAktual = parseInt(jamStr.split(':')[0]) * 60 + parseInt(jamStr.split(':')[1]);

        const pShift = parseInt(p.shiftKeluar.split(':')[0]) * 60 + parseInt(p.shiftKeluar.split(':')[1]);



        if (pAktual > pShift) { 

            lemburMnt = pAktual - pShift; 

            if (lemburMnt >= batasLembur) {

                statusWaktu = `LEMBUR (${lemburMnt} mnt)`; 

            } else {

                statusWaktu = "ON TIME";

                lemburMnt = 0; 

            }

        } else if (pAktual < pShift) {

            const pulangCepat = pShift - pAktual;

            statusWaktu = `PULANG AWAL (${pulangCepat} mnt)`;

        } else {

            statusWaktu = "ON TIME";

        }

    }



    const linkFoto = simpanFotoDrive(p.foto, p.nama.replace(/\s+/g, '_') + "_" + p.tipe.replace(/\s+/g, '_') + "_" + ts);

    // Simpan Log Absen Saat Ini

    sheet.appendRow([timestampDB, tanggalHariIni, jamStr, p.nama, p.role, p.outlet, p.namaShift || "-", p.tipe, statusWaktu, metrik, lemburMnt, linkFoto, requestId || Utilities.getUuid(), String(p.employeeId||'')]);

    // Panggil helper pembuat laporan WA

    const summaryWANew = getRekapBulanIni(sheet, p.nama, batasLembur, now);



    return { status: 'success', statusWaktu: statusWaktu, jam: jamStr, linkFoto: linkFoto, summaryWA: summaryWANew };



  } catch (e) {

    if (e.message.toLowerCase().includes("batas waktu penguncian") || e.message.toLowerCase().includes("lock timeout") || e.message.toLowerCase().includes("kunci terlalu lama")) {

      return { status: 'error', message: 'Mohon maaf antrean server penuh karena banyak staf absen secara bersamaan. Silakan tunggu 5 detik dan ulangi kembali.' };

    }

    return { status: 'error', message: e.message };

  } finally {

    lock.releaseLock(); 

  }

}



// 🚀 FUNGSI BANTUAN BARU: Taruh di bagian paling bawah Code.gs

function getRekapBulanIni(sheet, namaKaryawan, batasLembur, nowObj) {

    const yyyy = nowObj.getFullYear();

    const month = nowObj.getMonth() + 1;

    const mmStr = String(month).padStart(2, '0');

    const todayDate = nowObj.getDate();

    const daysInMonth = new Date(yyyy, month, 0).getDate();

    const allData = sheet.getDataRange().getValues().slice(1);

    const myLogs = allData.filter(r => {

        if (!r[1]) return false;

        let tgl = r[1]; if (tgl instanceof Date) tgl = Utilities.formatDate(tgl, TIMEZONE, "yyyy-MM-dd");

        return tgl.startsWith(`${yyyy}-${mmStr}`) && r[3] === namaKaryawan;

    });



    let totalHadir = 0;

    let offDates = [], izinDates = [], alpaDates = [], lemburDates = [];



    for (let i = 1; i <= daysInMonth; i++) {

        let dayStr = String(i).padStart(2, '0');

        let dStr = `${yyyy}-${mmStr}-${dayStr}`;

        let displayDate = `${dayStr}/${mmStr}`; 

        let logsToday = myLogs.filter(r => {

            let tgl = r[1]; if (tgl instanceof Date) tgl = Utilities.formatDate(tgl, TIMEZONE, "yyyy-MM-dd");

            return tgl === dStr;

        });



        let isMasuk = false, isLibur = false, isIzin = false, dLembur = 0;



        logsToday.forEach(r => {

            if (r[7] === 'Masuk' || r[7] === 'Pulang' || r[7] === 'Tukar Shift') {

                isMasuk = true;

                if (r[10] && !isNaN(r[10]) && parseInt(r[10]) >= batasLembur) dLembur = Math.max(dLembur, parseInt(r[10]));

            } 

            else if (r[7] === 'Libur') isLibur = true;

            else if (r[7] === 'Izin') isIzin = true;

        });



        if (isMasuk) {

            totalHadir++;

            if (dLembur > 0) lemburDates.push(`${displayDate}(${dLembur}m)`);

        } else if (isLibur) {

            let passed = (i <= todayDate) ? '✅' : '';

            offDates.push(`${displayDate}${passed}`);

        } else if (isIzin) {

            izinDates.push(`${displayDate}`);

        } else {

            if (i < todayDate) alpaDates.push(`${displayDate}`); 

        }

    }



    let summaryWA = `📊 *Kerja:* ${totalHadir}/${daysInMonth} Hari%0A`;

    summaryWA += `🏖️ *Off:* ${offDates.length ? offDates.join(', ') : '-'}%0A`;

    summaryWA += `📝 *Izin:* ${izinDates.length ? izinDates.join(', ') : '-'}%0A`;

    summaryWA += `⚠️ *Alpa:* ${alpaDates.length ? alpaDates.join(', ') : '-'}%0A`;

    summaryWA += `🔥 *Lembur:* ${lemburDates.length ? lemburDates.join(', ') : '-'}`;

    return summaryWA;

}



function hapusJadwalLama(p) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen');

  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {

    let tgl = data[i][1];

    if(tgl instanceof Date) tgl = Utilities.formatDate(tgl, TIMEZONE, "yyyy-MM-dd");

    if (tgl === p.tanggal && data[i][3] === p.nama) {

        sheet.deleteRow(i + 1);

    }

  }

  return { status: 'success' };

}



function hapusLogLiburSaja(p) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen');

  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {

    let tgl = data[i][1];

    if(tgl instanceof Date) tgl = Utilities.formatDate(tgl, TIMEZONE, "yyyy-MM-dd");

    if (tgl === p.tanggal && data[i][3] === p.nama && data[i][7] === 'Libur') {

        sheet.deleteRow(i + 1);

    }

  }

  return { status: 'success' };

}



function absenManual(p) {
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Data_Absen');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(p.tanggal||''))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.jam||'')))return {status:'error',message:'Tanggal/jam manual tidak valid.'};
    const master=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1);const employee=master.find(r=>(p.employeeId?r[5]===String(p.employeeId):r[1]===p.nama&&r[3]===p.outlet)&&r[1]===p.nama&&r[3]===p.outlet);if(!employee)return {status:'error',message:'Karyawan/ID/outlet tidak cocok dengan master.'};
    const outletExists=ss.getSheetByName('Master_Outlet').getDataRange().getDisplayValues().slice(1).some(r=>r[0]===p.outlet);if(!outletExists)return {status:'error',message:'Outlet tidak ditemukan di master.'};
    const validTypes=['Masuk','Pulang','Izin','Sakit','Libur','Tukar Shift'];if(!validTypes.includes(String(p.tipe)))return {status:'error',message:'Tipe absensi manual tidak valid.'};
    if(sheet.getLastColumn()<13) sheet.getRange(1,13).setValue('Request_ID');
    if(sheet.getLastColumn()<14) sheet.getRange(1,14).setValue('Employee_ID');
    removeFilterSafely(sheet);
    const data=sheet.getDataRange().getDisplayValues();
    const key=[p.tanggal,p.jam,p.nama,p.outlet,p.shift,p.tipe].map(String).join('|');
    const duplicate=data.slice(1).some(r=>[r[1],r[2],r[3],r[5],r[6],r[7]].map(String).join('|')===key);
    if(duplicate) return {status:'error',code:'DUPLICATE_ATTENDANCE',message:'Catatan dengan tanggal, jam, karyawan, outlet, shift, dan tipe yang sama sudah ada.'};
    const dataKar=ss.getSheetByName('Data_Karyawan').getDataRange().getValues();
    let roleKar=employee[2]||'Staff';
    const statusKhusus=p.tipe==='Libur'?'DAY OFF':'MANUAL (HRD)';
    const requestId=String(p.requestId||Utilities.getUuid());
    sheet.appendRow([Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd HH:mm:ss'),p.tanggal,p.jam,p.nama,roleKar,p.outlet,p.shift,p.tipe,statusKhusus,p.keterangan||'Input by Admin',0,'Bypass HRD',requestId,employee[5]||'']);
    logSecurityEvent_('MANUAL_ATTENDANCE_CREATED','absen_manual',JSON.stringify({nama:p.nama,outlet:p.outlet,tanggal:p.tanggal,tipe:p.tipe,requestId:requestId}));
    return {status:'success'};
  } catch(e){return {status:'error',message:'Gagal menyimpan absensi manual: '+String(e.message||e)};}
  finally {try{lock.releaseLock();}catch(e){}}
}


function importCsvAbsen(p) {
  if(!p||!Array.isArray(p.data)||p.data.length>2000)return {status:'error',message:'Data impor harus berupa array maksimal 2.000 baris per batch.'};
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Data_Absen');
    if(sheet.getLastColumn()<13)sheet.getRange(1,13).setValue('Request_ID');
    removeFilterSafely(sheet);
    const existing=sheet.getDataRange().getDisplayValues().slice(1);
    const keyOf=r=>[r[1],r[2],r[3],r[5],r[6],r[7]].map(String).join('|');
    const seen={};existing.forEach(r=>seen[keyOf(r)]=true);
    const dataKar=ss.getSheetByName('Data_Karyawan').getDataRange().getValues();
    const staffKeys=new Set(dataKar.slice(1).map(r=>String(r[1])+'|'+String(r[3])));const outletKeys=new Set(ss.getSheetByName('Master_Outlet').getDataRange().getDisplayValues().slice(1).map(r=>r[0]));
    const rowsToAppend=[];let skippedDuplicates=0,skippedInvalid=0;
    p.data.forEach(row=>{
      const dateText=String(row.tanggal||''),timeText=String(row.jam||''),type=String(row.tipe||'');
      const dateVal=new Date(dateText+'T00:00:00Z');const validDate=/^\d{4}-\d{2}-\d{2}$/.test(dateText)&&!isNaN(dateVal.getTime())&&dateVal.toISOString().slice(0,10)===dateText;
      if(!validDate||!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeText)||!staffKeys.has(String(row.nama)+'|'+String(row.outlet))||!outletKeys.has(String(row.outlet))||!['Masuk','Pulang','Izin','Sakit','Tukar Shift','Libur'].includes(type)){skippedInvalid++;return;}
      const key=[row.tanggal,row.jam,row.nama,row.outlet,row.shift,row.tipe].map(String).join('|');
      if(seen[key]){skippedDuplicates++;return;} seen[key]=true;
      let roleKar='Staff';for(let i=1;i<dataKar.length;i++){if(dataKar[i][1]===row.nama){roleKar=dataKar[i][2];break;}}
      let statusKhusus='MANUAL (HRD)';if(row.tipe==='Libur')statusKhusus='DAY OFF';else if(row.tipe==='Izin'||row.tipe==='Sakit')statusKhusus='IZIN / SAKIT';
      rowsToAppend.push([Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd HH:mm:ss'),row.tanggal,row.jam,row.nama,roleKar,row.outlet,row.shift,row.tipe,statusKhusus,row.keterangan||'Import Bulk CSV / Matriks',0,'Bypass HRD',Utilities.getUuid(),(function(){const x=dataKar.slice(1).find(r=>r[1]===row.nama&&r[3]===row.outlet);return x?x[5]:'';})()]);
    });
    if(rowsToAppend.length)sheet.getRange(sheet.getLastRow()+1,1,rowsToAppend.length,14).setValues(rowsToAppend);
    logSecurityEvent_('CSV_IMPORT','import_csv_absen',JSON.stringify({inserted:rowsToAppend.length,skippedDuplicates:skippedDuplicates}));
    return {status:'success',count:rowsToAppend.length,skippedDuplicates:skippedDuplicates,skippedInvalid:skippedInvalid};
  } catch(e){return {status:'error',message:'Impor gagal: '+String(e.message||e)};}
  finally {try{lock.releaseLock();}catch(e){}}
}


function hapusAbsen(p) { 

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen'); 

    removeFilterSafely(sheet); 

    const displayData = sheet.getDataRange().getDisplayValues(); 

    const rawData = sheet.getDataRange().getValues();            

    for (let i = displayData.length - 1; i >= 1; i--) { 

        let rowTsDisplay = displayData[i][0]; 

        let rowTsRaw = rawData[i][0];

        let formattedRaw = "";

        if (rowTsRaw instanceof Date) {

            formattedRaw = Utilities.formatDate(rowTsRaw, TIMEZONE, "yyyy-MM-dd HH:mm:ss");

        } else if (typeof rowTsRaw === 'string') {

            formattedRaw = rowTsRaw.replace('T', ' ').split('.')[0]; 

        }



        if (rowTsDisplay === p.ts || formattedRaw.includes(p.ts) || (typeof p.ts === 'string' && p.ts.includes(formattedRaw))) { 

            sheet.deleteRow(i + 1); 

            return { status: 'success' }; 

        } 

    } 

    return { status: 'error', message: 'Data dengan timestamp [' + p.ts + '] gagal dihapus. Format tidak cocok.' }; 

}



function daftarWajah(p) {
  if(!p||!Array.isArray(p.descriptor)||p.descriptor.length!==128||!p.descriptor.every(v=>isFinite(Number(v))))return {status:'error',message:'Descriptor wajah tidak valid.'};
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('Data_Karyawan');const d=sh.getDataRange().getValues();let row=-1;
  for(let i=1;i<d.length;i++){if((p.employeeId&&String(d[i][5])===String(p.employeeId))||(!p.employeeId&&d[i][1]===p.nama&&d[i][2]===p.role&&d[i][3]===p.outlet)){row=i+1;break;}}
  if(row<0)return {status:'error',message:'Karyawan/outlet tidak cocok dengan master. Tambahkan karyawan terlebih dahulu.'};
  if(d[row-1][1]!==p.nama||d[row-1][2]!==p.role||d[row-1][3]!==p.outlet)return {status:'error',message:'Data karyawan tidak cocok dengan Employee_ID.'};
  sh.getRange(row,5).setValue(JSON.stringify(p.descriptor));logSecurityEvent_('BIOMETRIC_ENROLL','enroll',JSON.stringify({nama:p.nama,outlet:p.outlet}));return {status:'success',message:'Descriptor wajah diperbarui.'};
}

function editKaryawan(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Data_Karyawan'),data=sheet.getDataRange().getValues();
  for(let i=1;i<data.length;i++){
    if((p.oldId&&String(data[i][5])===String(p.oldId))||(!p.oldId&&data[i][1]===p.oldNama)){
      const employeeId=String(data[i][5]||''); const oldOutlet=String(data[i][3]||'');
      sheet.getRange(i+1,2,1,3).setValues([[p.nama,p.role,p.outlet]]);
      const accounts=ss.getSheetByName('Akun_Karyawan');if(accounts){const a=accounts.getDataRange().getDisplayValues();for(let j=1;j<a.length;j++)if(a[j][9]===employeeId){accounts.getRange(j+1,2,1,3).setValues([[p.nama,p.outlet,p.role]]);}}
      const schedules=ss.getSheetByName('Jadwal_HC');if(schedules){const a=schedules.getDataRange().getDisplayValues(),today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');for(let j=1;j<a.length;j++)if(a[j][9]===employeeId&&a[j][1]>=today){schedules.getRange(j+1,3,1,3).setValues([[p.nama,p.outlet,a[j][4]]]);schedules.getRange(j+1,6).setValue('Perlu Ditinjau');schedules.getRange(j+1,9).setValue('Profil karyawan berubah; jadwal harus ditinjau ulang.');}}
      logSecurityEvent_('EMPLOYEE_UPDATED','edit_karyawan',JSON.stringify({employeeId:employeeId,oldNama:data[i][1],nama:p.nama,oldOutlet:oldOutlet,outlet:p.outlet}));return {status:'success',message:'Data karyawan diperbarui. Jadwal mendatang ditandai untuk ditinjau ulang.'};
    }
  }
  return {status:'error',message:'Karyawan tidak ditemukan.'};
}

function hapusKaryawan(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Data_Karyawan'),data=sheet.getDataRange().getDisplayValues();let employeeId='',deletedName='';
  for(let i=data.length-1;i>=1;i--){if((p.employeeId&&data[i][5]===String(p.employeeId))||(!p.employeeId&&data[i][1]===p.nama)){employeeId=data[i][5];deletedName=data[i][1];sheet.deleteRow(i+1);break;}}
  if(!deletedName)return {status:'error',message:'Karyawan tidak ditemukan.'};
  const accounts=ss.getSheetByName('Akun_Karyawan');if(accounts){const a=accounts.getDataRange().getDisplayValues();for(let j=1;j<a.length;j++)if(a[j][9]===employeeId)accounts.getRange(j+1,7).setValue(false);}
  const schedules=ss.getSheetByName('Jadwal_HC');if(schedules){const a=schedules.getDataRange().getDisplayValues(),today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');for(let j=1;j<a.length;j++)if(a[j][9]===employeeId&&a[j][1]>=today){schedules.getRange(j+1,6).setValue('Dibatalkan');schedules.getRange(j+1,9).setValue('Karyawan dinonaktifkan/dihapus dari master.');}}
  logSecurityEvent_('EMPLOYEE_DELETED','hapus_karyawan',JSON.stringify({employeeId:employeeId,nama:deletedName}));return {status:'success',message:'Karyawan dihapus dari master; akun dinonaktifkan dan jadwal mendatang dibatalkan.'};
}

function tambahOutlet(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('Master_Outlet'),name=String(p.nama||'').trim(),lat=Number(p.lat),lng=Number(p.lng),radius=Number(p.radius||100);
  if(!name||!isFinite(lat)||Math.abs(lat)>90||!isFinite(lng)||Math.abs(lng)>180||!isFinite(radius)||radius<10||radius>5000)return {status:'error',message:'Nama, koordinat GPS, dan radius outlet tidak valid (radius 10–5.000 m).'};
  if(sh.getDataRange().getDisplayValues().slice(1).some(r=>r[0]===name))return {status:'error',message:'Nama outlet sudah digunakan.'};
  sh.appendRow([name,"'"+lat,"'"+lng,radius]);logSecurityEvent_('OUTLET_CREATED','tambah_outlet',name);return {status:'success'};
}

function editOutlet(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Master_Outlet'),data=sheet.getDataRange().getValues();
  for(let i=1;i<data.length;i++)if(data[i][0]===p.oldNama){
    sheet.getRange(i+1,1,1,4).setValues([[p.nama,"'"+p.lat,"'"+p.lng,p.radius]]);
    if(p.oldNama!==p.nama){
      const master=ss.getSheetByName('Data_Karyawan'),m=master.getDataRange().getDisplayValues();for(let j=1;j<m.length;j++)if(m[j][3]===p.oldNama)master.getRange(j+1,4).setValue(p.nama);
      const shifts=ss.getSheetByName('Master_Shift'),sh=shifts.getDataRange().getDisplayValues();for(let j=1;j<sh.length;j++)if(sh[j][0]===p.oldNama)shifts.getRange(j+1,1).setValue(p.nama);
      const accounts=ss.getSheetByName('Akun_Karyawan');if(accounts){const a=accounts.getDataRange().getDisplayValues();for(let j=1;j<a.length;j++)if(a[j][2]===p.oldNama)accounts.getRange(j+1,3).setValue(p.nama);}
      const schedule=ss.getSheetByName('Jadwal_HC');if(schedule){const a=schedule.getDataRange().getDisplayValues(),today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');for(let j=1;j<a.length;j++)if(a[j][3]===p.oldNama&&a[j][1]>=today){schedule.getRange(j+1,4).setValue(p.nama);schedule.getRange(j+1,6).setValue('Perlu Ditinjau');schedule.getRange(j+1,9).setValue('Outlet berubah; jadwal harus ditinjau ulang.');}}
    }
    logSecurityEvent_('OUTLET_UPDATED','edit_outlet',JSON.stringify({oldNama:p.oldNama,nama:p.nama}));return {status:'success',message:'Outlet diperbarui. Jadwal mendatang ditandai untuk ditinjau ulang jika nama outlet berubah.'};
  }
  return {status:'error',message:'Outlet tidak ditemukan.'};
}

function hapusOutlet(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),name=String(p.nama||'');
  const staff=ss.getSheetByName('Data_Karyawan').getDataRange().getDisplayValues().slice(1).some(r=>r[3]===name);
  const shifts=ss.getSheetByName('Master_Shift').getDataRange().getDisplayValues().slice(1).some(r=>r[0]===name);
  const today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd'),futureSchedule=ss.getSheetByName('Jadwal_HC').getDataRange().getDisplayValues().slice(1).some(r=>r[3]===name&&r[1]>=today&&r[5]!=='Dibatalkan');
  if(staff||shifts||futureSchedule)return {status:'error',message:'Outlet masih memiliki karyawan, shift, atau jadwal mendatang. Pindahkan/nonaktifkan data terkait terlebih dahulu.'};
  deleteDataByFilter('Master_Outlet',0,name);logSecurityEvent_('OUTLET_DELETED','hapus_outlet',name);return {status:'success'};
}



function tambahShift(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('Master_Shift'),outlet=String(p.outlet||''),kode=String(p.kode||'').trim(),masuk=String(p.jamMasuk||''),keluar=String(p.jamKeluar||''),tol=Number(p.toleransi||0),lembur=Number(p.ambangLembur||60);
  if(!ss.getSheetByName('Master_Outlet').getDataRange().getDisplayValues().slice(1).some(r=>r[0]===outlet)||!kode||!/^([01]\d|2[0-3]):[0-5]\d$/.test(masuk)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(keluar)||masuk===keluar||tol<0||tol>240||lembur<0||lembur>1440)return {status:'error',message:'Outlet atau aturan jam shift tidak valid.'};
  if(sh.getDataRange().getDisplayValues().slice(1).some(r=>r[0]===outlet&&r[1]===kode))return {status:'error',message:'Kode shift sudah ada untuk outlet ini.'};
  sh.appendRow([outlet,kode,"'"+masuk,"'"+keluar,tol,lembur]);logSecurityEvent_('SHIFT_CREATED','tambah_shift',outlet+' '+kode);return {status:'success'};
}

function editShift(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Master_Shift'),data=sheet.getDataRange().getValues();
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.jamMasuk||''))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.jamKeluar||''))||p.jamMasuk===p.jamKeluar)return {status:'error',message:'Jam shift tidak valid.'};
  for(let i=1;i<data.length;i++)if(data[i][0]===p.oldOutlet&&data[i][1]===p.oldKode){
    sheet.getRange(i+1,1,1,6).setValues([[p.outlet,p.kode,"'"+p.jamMasuk,"'"+p.jamKeluar,p.toleransi,p.ambangLembur]]);
    const schedule=ss.getSheetByName('Jadwal_HC'),a=schedule.getDataRange().getDisplayValues(),today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');
    for(let j=1;j<a.length;j++)if(a[j][3]===p.oldOutlet&&a[j][4]===p.oldKode&&a[j][1]>=today&&a[j][5]!=='Dibatalkan'){schedule.getRange(j+1,4,1,2).setValues([[p.outlet,p.kode]]);schedule.getRange(j+1,6).setValue('Perlu Ditinjau');schedule.getRange(j+1,9).setValue('Aturan shift berubah; jadwal harus ditinjau ulang.');}
    logSecurityEvent_('SHIFT_UPDATED','edit_shift',p.oldOutlet+' '+p.oldKode+' -> '+p.outlet+' '+p.kode);return {status:'success',message:'Shift diperbarui. Jadwal mendatang ditandai untuk ditinjau ulang.'};
  }
  return {status:'error',message:'Shift tidak ditemukan.'};
}



function hapusShift(p) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName('Master_Shift'),schedule=ss.getSheetByName('Jadwal_HC'),today=Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd');
  if(schedule.getDataRange().getDisplayValues().slice(1).some(r=>r[3]===p.outlet&&r[4]===p.kode&&r[1]>=today&&r[5]!=='Dibatalkan'))return {status:'error',message:'Shift masih digunakan pada jadwal mendatang. Ubah/tinjau jadwal terlebih dahulu.'};
  const data=sheet.getDataRange().getValues();let count=0;for(let i=data.length-1;i>=1;i--)if(data[i][0]===p.outlet&&data[i][1]===p.kode){sheet.deleteRow(i+1);count++;}
  logSecurityEvent_('SHIFT_DELETED','hapus_shift',p.outlet+' '+p.kode);return {status:count?'success':'error',message:count?'Shift dihapus.':'Shift tidak ditemukan.'};
}

function deleteDataByFilter(sheetName, colIndex, valueToMatch) { const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); const data = sheet.getDataRange().getValues(); for(let i = data.length-1; i >= 1; i--) { if(data[i][colIndex] === valueToMatch) sheet.deleteRow(i+1); } }

/** Owner-only decision for face-kiosk shift-swap requests. Rejection is non-destructive: retain the original attendance evidence. */
function decideShiftSwap_(p, adminToken) {
  const token=readSignedToken_(adminToken)||{};
  const decision=String(p.keputusan||'').trim();
  if(decision!=='Ditolak') return {status:'error',message:'Keputusan yang didukung endpoint ini adalah Ditolak.'};
  const requestId=String(p.requestId||'').trim(), ts=String(p.ts||'').trim();
  if(!requestId&&!ts) return {status:'error',message:'ID permintaan tidak tersedia. Muat ulang daftar otorisasi.'};
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen');
    if(!sh||sh.getLastRow()<2) return {status:'error',message:'Data absensi tidak ditemukan.'};
    const rows=sh.getDataRange().getDisplayValues(); let rowIndex=-1, row=null;
    for(let i=rows.length-1;i>=1;i--){const r=rows[i];if(r[7]!=='Tukar Shift')continue;if(requestId&&String(r[12]||'')===requestId){rowIndex=i+1;row=r;break;}if(!requestId&&String(r[0]||'')===ts){rowIndex=i+1;row=r;break;}}
    if(!row) return {status:'error',message:'Permintaan tukar shift tidak ditemukan atau sudah berubah.'};
    const info=String(row[9]||'');
    if(!/Menggantikan .+\(Ganti OFF: .+\) - .+/.test(info)) return {status:'error',message:'Format detail permintaan tukar shift tidak valid.'};
    const current=String(row[8]||'').toUpperCase();
    if(current.includes('DITOLAK OWNER')) return {status:'error',message:'Permintaan ini sudah pernah ditolak.'};
    if(current.includes('DISETUJUI OWNER')||info.includes('ACC Owner')) return {status:'error',message:'Permintaan ini sudah disetujui dan tidak dapat ditolak.'};
    const note=String(p.catatan||'').trim().slice(0,500);
    sh.getRange(rowIndex,9).setValue('DITOLAK OWNER');
    sh.getRange(rowIndex,10).setValue(info+' | DITOLAK OWNER: '+(note||'Tidak ada catatan')+' | Oleh: '+String(token.sub||'admin'));
    logSecurityEvent_('SHIFT_SWAP_REJECTED','shift_swap_decision',JSON.stringify({requestId:String(row[12]||''),nama:String(row[3]||''),outlet:String(row[5]||''),tanggal:String(row[1]||''),oleh:String(token.sub||'admin'),catatan:note}));
    return {status:'success',message:'Permintaan tukar shift ditolak. Bukti absensi tetap disimpan.',requestId:String(row[12]||'')};
  } catch(e){return {status:'error',message:'Gagal menyimpan keputusan: '+String(e.message||e)};}
  finally {try{lock.releaseLock();}catch(e){}}
}

function getLaporanAdmin(p) { const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data_Absen').getDataRange().getDisplayValues(); const laporan = data.slice(1).map(r => ({ ts: r[0], tanggal: r[1], jam: r[2], nama: r[3], role: r[4], outlet: r[5], shift: r[6], tipe: r[7], status: r[8], info: r[9], lembur: r[10] || 0, foto: r[11] || "-", requestId: r[12] || '', employeeId: String(r[13] || '') })).reverse(); return { status: 'success', data: laporan }; }