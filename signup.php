<?php
// Golden Age Wisdom — signup / volunteer handler.
//
// Volunteer applications go to Supabase, which is now the single source of
// member numbers for the whole platform. If Supabase is unreachable the
// signup is appended to data/signups.jsonl instead, so nothing is ever lost.
// The notification email is sent either way.

const GAW_NOTIFY   = 'goldenageguruteachings@gmail.com';
const GAW_DIAG_KEY = 'gaw2026';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$dataDir = __DIR__ . '/data';

// Secrets live OUTSIDE the web root. Two common layouts are checked.
$secrets = [];
foreach ([dirname(__DIR__) . '/gaw-secrets.php', dirname(__DIR__, 2) . '/gaw-secrets.php'] as $sf) {
  if (is_file($sf)) { $secrets = (array)include $sf; break; }
}
$SUPA_URL = rtrim($secrets['supabase_url'] ?? '', '/');
$SUPA_KEY = $secrets['supabase_service_key'] ?? '';
$supaReady = $SUPA_URL !== '' && $SUPA_KEY !== '' && $SUPA_KEY !== 'PASTE_THE_SERVICE_ROLE_KEY_HERE';

// --- Diagnostics: /signup.php?diag=gaw2026 -------------------------------
if (($_GET['diag'] ?? '') === GAW_DIAG_KEY) {
  if (!is_dir($dataDir)) { @mkdir($dataDir, 0755, true); }
  $probe = $dataDir . '/.probe';
  $canWrite = @file_put_contents($probe, 'x') !== false;
  if ($canWrite) { @unlink($probe); }
  echo json_encode([
    'php'            => PHP_VERSION,
    'curl'           => function_exists('curl_init'),
    'secrets_found'  => $secrets !== [],
    'supabase_ready' => $supaReady,
    'dir_writable'   => $canWrite,
    'jsonl_exists'   => is_file($dataDir . '/signups.jsonl'),
    'mail_fn'        => function_exists('mail'),
    'doc_root'       => __DIR__,
  ], JSON_PRETTY_PRINT);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Method not allowed']); exit; }

// Same-origin only
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && !preg_match('~^https?://(www\.)?goldenagewisdom\.org$~', $origin)) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Forbidden']); exit; }

// Honeypot: hidden "website" field must be empty
if (!empty($_POST['website'])) { echo json_encode(['ok'=>true]); exit; } // pretend success to bots

// strip control chars (blocks email header injection via \r\n)
$clean = function ($v, $n) { return trim(mb_substr(preg_replace('/[\x00-\x1F\x7F]/u', '', $v === null ? '' : $v), 0, $n)); };
$name  = $clean($_POST['name'] ?? '', 120);
$email = strtolower($clean($_POST['email'] ?? '', 200));
$city  = $clean($_POST['city'] ?? '', 120);
$lang  = $clean($_POST['lang'] ?? 'EN', 20);
$role  = in_array($_POST['role'] ?? '', ['member','volunteer','donor'], true) ? $_POST['role'] : 'member';
$phone = $clean($_POST['phone'] ?? '', 40);
$note  = $clean($_POST['note'] ?? '', 1000);
$occ   = $clean($_POST['occupation'] ?? '', 120);
$avail = $clean($_POST['avail'] ?? '', 120);
$TEAMS = ['events-setup','helpline','local-event','kundalini-share','donor','social-media','tech'];
$teams = array_values(array_intersect($TEAMS, array_map('trim', explode(',', $_POST['teams'] ?? ''))));
$teamsStr = implode(',', $teams);
if ($role === 'volunteer' && !$teams) {
  http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Please choose at least one team you would like to serve on.']); exit;
}
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Please provide your name and a valid email.']); exit;
}

if (!is_dir($dataDir)) { @mkdir($dataDir, 0755, true); }
if (is_dir($dataDir) && !is_file($dataDir . '/.htaccess')) {
  @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n");
}

// Rate limit: 1000 per IP per hour. Indian mobile carriers put many real
// members behind one address, so this is a flood guard only — the honeypot
// above is what actually stops bots.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = $dataDir . '/rl_' . md5($ip) . '.json';
$hits = is_file($rlFile) ? json_decode((string)@file_get_contents($rlFile), true) : [];
$hits = array_values(array_filter((array)$hits, function ($t) { return $t > time() - 3600; }));
if (count($hits) >= 1000) { http_response_code(429); echo json_encode(['ok'=>false,'error'=>'Too many attempts — please try again later.']); exit; }
$hits[] = time(); @file_put_contents($rlFile, json_encode($hits));

$memberId = '';
$returning = false;
$storeNote = '';

// ---- 1. Supabase — the source of truth ----------------------------------
if ($supaReady && function_exists('curl_init')) {
  $payload = json_encode([
    'p_name'  => $name,  'p_email' => $email, 'p_phone' => $phone,
    'p_city'  => $city,  'p_lang'  => $lang,  'p_teams' => $teams,
    'p_avail' => $avail, 'p_note'  => $note, 'p_occupation' => $occ,
  ]);
  $ch = curl_init($SUPA_URL . '/rest/v1/rpc/gaw_volunteer_apply');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'apikey: ' . $SUPA_KEY,
      'Authorization: Bearer ' . $SUPA_KEY,
    ],
  ]);
  $res  = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $cerr = curl_error($ch);
  curl_close($ch);

  if ($res !== false && $code >= 200 && $code < 300) {
    $j = json_decode($res, true);
    if (is_array($j) && !empty($j['ok'])) {
      $memberId  = (string)($j['memberId'] ?? '');
      $returning = !empty($j['returning']);
    } elseif (is_array($j) && isset($j['error'])) {
      http_response_code(422); echo json_encode(['ok'=>false,'error'=>$j['error']]); exit;
    } else {
      $storeNote = 'supabase replied without ok: ' . substr((string)$res, 0, 300);
    }
  } else {
    $storeNote = 'supabase HTTP ' . $code . ' ' . $cerr . ' ' . substr((string)$res, 0, 300);
  }
} else {
  $storeNote = $supaReady ? 'curl missing' : 'supabase secrets not configured';
}

// ---- 2. Fallback: append-only file --------------------------------------
if ($memberId === '') {
  $jsonl = $dataDir . '/signups.jsonl';
  $existing = is_file($jsonl) ? (array)file($jsonl, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
  foreach ($existing as $line) {
    $r = json_decode($line, true);
    if (is_array($r) && ($r['email'] ?? '') === $email && !empty($r['member_id'])) {
      $memberId = $r['member_id']; $returning = true; break;
    }
  }
  // Pending — a real number is issued by Supabase when the row is imported.
  if ($memberId === '') { $memberId = 'pending'; }
  if (@file_put_contents($jsonl, json_encode([
        'member_id'=>$memberId, 'name'=>$name, 'email'=>$email, 'phone'=>$phone, 'city'=>$city,
        'lang'=>$lang, 'role'=>$role, 'teams'=>$teamsStr, 'avail'=>$avail, 'note'=>$note, 'occupation'=>$occ,
        'ip'=>$ip, 'at'=>gmdate('c'), 'why'=>$storeNote,
      ]) . "\n", FILE_APPEND | LOCK_EX) === false) {
    $storeNote .= ' | file fallback ALSO failed';
  }
}

// ---- 3. Always notify ---------------------------------------------------
@mail(GAW_NOTIFY,
  "New $role signup: " . $name,
  "Member ID: $memberId\nName: $name\nEmail: $email\nPhone: $phone\nCity: $city\nLanguage: $lang\n"
  . "Role: $role\nTeams: $teamsStr\nAvailability: $avail\nOccupation: $occ\nNote: $note\nTime: " . gmdate('c')
  . ($storeNote ? "\n\n[storage] $storeNote" : "\n\n[storage] supabase ok"),
  "From: no-reply@goldenagewisdom.org\r\nReply-To: $email\r\n");

if ($storeNote) { error_log('GAW signup storage: ' . $storeNote); }

$idLine = ($memberId === 'pending') ? '' : ' Your member ID is ' . $memberId . '.';
echo json_encode(['ok'=>true, 'member_id'=>$memberId, 'message'=>($returning
  ? 'You are already on the list — welcome back!' . $idLine
  : ($role === 'volunteer'
    ? 'Thank you for offering to serve.' . $idLine . ' A team coordinator will write to you at ' . $email . '.'
    : 'Welcome to the community!' . $idLine . ' We will write to you at ' . $email . '.'))]);
