<?php
// Golden Age Wisdom — Stripe donation handler.
// Setup: put your Stripe SECRET key in data/stripe_key.txt (never commit it),
// or set the STRIPE_SECRET_KEY environment variable in cPanel.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Method not allowed']); exit; }
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && !preg_match('~^https?://(www\.)?goldenagewisdom\.org$~', $origin)) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Forbidden']); exit; }

$clean = fn($v, $n) => trim(mb_substr(preg_replace('/[\x00-\x1F\x7F]/u', '', $v ?? ''), 0, $n));
$email  = $clean($_POST['email'] ?? '', 200);
$name   = $clean($_POST['name'] ?? '', 120);
$amount = (int)($_POST['amount'] ?? 0);           // whole rupees
$currency = ($_POST['currency'] ?? 'inr') === 'usd' ? 'usd' : 'inr';
if ($amount < 50 || $amount > 500000) { http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Amount must be between ₹50 and ₹5,00,000.']); exit; }
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';

$key = getenv('STRIPE_SECRET_KEY') ?: (is_file(__DIR__.'/data/stripe_key.txt') ? trim(file_get_contents(__DIR__.'/data/stripe_key.txt')) : '');
if (!$key) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'Donations are not configured yet — add your Stripe key to data/stripe_key.txt.']); exit; }

$params = [
  'mode' => 'payment',
  'line_items[0][quantity]' => 1,
  'line_items[0][price_data][currency]' => $currency,
  'line_items[0][price_data][unit_amount]' => $amount * 100, // paise/cents
  'line_items[0][price_data][product_data][name]' => 'Donation — Golden Age Wisdom (non-profit)',
  'success_url' => 'https://goldenagewisdom.org/?donation=thankyou',
  'cancel_url'  => 'https://goldenagewisdom.org/?donation=cancelled',
  'metadata[donor_name]' => $name,
];
if ($email) $params['customer_email'] = $email;

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query($params),
  CURLOPT_USERPWD => $key . ':',
  CURLOPT_TIMEOUT => 20,
]);
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$j = json_decode($res, true);
if ($http !== 200 || empty($j['url'])) {
  error_log('GAW donate: HTTP ' . $http . ' ' . substr((string)$res, 0, 500));
  http_response_code(502); echo json_encode(['ok'=>false,'error'=>'Could not start the payment. Please try again or email goldenageguruteachings@gmail.com.']); exit;
}
// Record the donor (reuses the member record if the email exists)
try {
  $db = new PDO('sqlite:' . __DIR__ . '/data/signups.db');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  if ($email) {
    $row = $db->prepare('SELECT roles FROM signups WHERE email = ?'); $row->execute([$email]);
    $roles = $row->fetchColumn();
    if ($roles !== false) {
      $r = array_filter(explode(',', (string)$roles));
      if (!in_array('donor', $r, true)) { $r[] = 'donor'; $u = $db->prepare('UPDATE signups SET roles = ? WHERE email = ?'); $u->execute([implode(',', $r), $email]); }
    } else {
      $i = $db->prepare('INSERT INTO signups (name, email, roles, ip) VALUES (?,?,?,?)');
      $i->execute([$name ?: 'Donor', $email, 'donor', $_SERVER['REMOTE_ADDR'] ?? '']);
    }
  }
} catch (PDOException $e) { error_log('GAW donate db: ' . $e->getMessage()); }

echo json_encode(['ok'=>true, 'url' => $j['url']]);
