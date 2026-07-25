<?php
// Golden Age Wisdom — real signup handler (upload next to the site files)
// Stores signups in SQLite (data/signups.db), rate-limits by IP, honeypot-protected,
// and emails info@goldenagewisdom.org on each signup.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Method not allowed']); exit; }

// Same-origin only
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && !preg_match('~^https?://(www\.)?goldenagewisdom\.org$~', $origin)) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Forbidden']); exit; }

// Honeypot: hidden "website" field must be empty
if (!empty($_POST['website'])) { echo json_encode(['ok'=>true]); exit; } // pretend success to bots

// strip control chars (blocks email header injection via \r\n)
$clean = fn($v, $n) => trim(mb_substr(preg_replace('/[\x00-\x1F\x7F]/u', '', $v ?? ''), 0, $n));
$name  = $clean($_POST['name'] ?? '', 120);
$email = $clean($_POST['email'] ?? '', 200);
$city  = $clean($_POST['city'] ?? '', 120);
$lang  = $clean($_POST['lang'] ?? 'EN', 20);
$role  = in_array($_POST['role'] ?? '', ['member','volunteer','donor'], true) ? $_POST['role'] : 'member';
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Please provide your name and a valid email.']); exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) { mkdir($dataDir, 0750, true); file_put_contents($dataDir.'/.htaccess', "Require all denied\n"); }

// Rate limit: max 5 signups per IP per hour
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = $dataDir . '/rl_' . md5($ip) . '.json';
$hits = is_file($rlFile) ? json_decode(file_get_contents($rlFile), true) : [];
$hits = array_values(array_filter((array)$hits, fn($t) => $t > time() - 3600));
if (count($hits) >= 5) { http_response_code(429); echo json_encode(['ok'=>false,'error'=>'Too many attempts — please try again later.']); exit; }
$hits[] = time(); file_put_contents($rlFile, json_encode($hits));

try {
  $db = new PDO('sqlite:' . $dataDir . '/signups.db');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->exec('CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, city TEXT, lang TEXT, roles TEXT DEFAULT "member",
    ip TEXT, created_at TEXT DEFAULT (datetime("now")))');
  // Member IDs start at 100001 (6 digits) and grow naturally past a million (7+ digits)
  $db->exec("INSERT INTO sqlite_sequence(name, seq) SELECT 'signups', 100000 WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name='signups')");
  $stmt = $db->prepare('INSERT INTO signups (name, email, city, lang, roles, ip) VALUES (?,?,?,?,?,?)');
  $stmt->execute([$name, $email, $city, $lang, $role, $ip]);
  $memberId = 'GAW-' . $db->lastInsertId();
} catch (PDOException $e) {
  if (str_contains($e->getMessage(), 'UNIQUE')) {
    // existing member: reuse their record, just add the new role
    $row = $db->prepare('SELECT id, roles FROM signups WHERE email = ?'); $row->execute([$email]);
    $rec = $row->fetch(PDO::FETCH_ASSOC);
    $memberId = 'GAW-' . ($rec['id'] ?? '');
    $roles = array_filter(explode(',', (string)($rec['roles'] ?? '')));
    if (!in_array($role, $roles, true)) {
      $roles[] = $role;
      $upd = $db->prepare('UPDATE signups SET roles = ? WHERE email = ?');
      $upd->execute([implode(',', $roles), $email]);
      @mail('info@goldenagewisdom.org', "Member added role: $role", "Name: $name\nEmail: $email\nRoles: " . implode(',', $roles), "From: no-reply@goldenagewisdom.org\r\n");
      echo json_encode(['ok'=>true,'member_id'=>$memberId,'message'=>"Welcome back! You are now also registered as a $role. Your member ID is $memberId."]); exit;
    }
    echo json_encode(['ok'=>true,'member_id'=>$memberId,'message'=>"You are already on the list — welcome back! Your member ID is $memberId."]); exit;
  }
  error_log('GAW signup: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['ok'=>false,'error'=>'Something went wrong on our side. Please email info@goldenagewisdom.org.']); exit;
}

// Notify the team (GoDaddy relays mail() for hosted domains; M365 receives it)
@mail('info@goldenagewisdom.org',
  "New $role signup: " . $name,
  "Name: $name\nEmail: $email\nCity: $city\nLanguage: $lang\nRole: $role\nTime: " . gmdate('c'),
  "From: no-reply@goldenagewisdom.org\r\nReply-To: $email\r\n");

echo json_encode(['ok'=>true,'member_id'=>$memberId,'message'=>'Welcome to the community! Your member ID is ' . $memberId . '. We will write to you at ' . $email . '.']);
