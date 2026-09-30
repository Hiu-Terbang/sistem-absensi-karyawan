<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$month = max(1, min(12, (int) ($_GET['month'] ?? date('n'))));
$year = (int) ($_GET['year'] ?? date('Y'));
$days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
$employees = $pdo->query("SELECT id, name, daily_rate FROM employees WHERE is_active=1 ORDER BY name")->fetchAll();

$start = sprintf('%04d-%02d-01', $year, $month);
$end = sprintf('%04d-%02d-%02d', $year, $month, $days);

$stmt = $pdo->prepare("SELECT employee_id, DAY(attendance_date) day, status FROM attendances WHERE attendance_date BETWEEN ? AND ?");
$stmt->execute([$start, $end]);
$att=[];
foreach($stmt as $r) $att[$r['employee_id']][(int)$r['day']]=$r['status'];

$stmt=$pdo->prepare("SELECT employee_id,overtime,debt FROM monthly_extras WHERE month=? AND year=?");
$stmt->execute([$month,$year]);
$extra=[];
foreach($stmt as $r) $extra[$r['employee_id']]=[$r['overtime'],$r['debt']];

$months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="ABSEN-'.$months[$month-1].'-'.$year.'.csv"');
echo "\xEF\xBB\xBF";
$out=fopen('php://output','w');
$headers=['Nama','Tarif / Hari'];
for($d=1;$d<=$days;$d++) $headers[]=$d;
$headers=array_merge($headers,['Total','Lembur','Bon','Total Bayar']);
fputcsv($out,['ABSEN - '.strtoupper($months[$month-1]).' '.$year]);
fputcsv($out,$headers);

foreach($employees as $e){
    $total=0; $row=[$e['name'],(float)$e['daily_rate']];
    for($d=1;$d<=$days;$d++){
        $v=$att[$e['id']][$d]??'';
        $row[]=$v;
        $total+=attendanceValue($v);
    }
    $ot=(float)($extra[$e['id']][0]??0);
    $debt=(float)($extra[$e['id']][1]??0);
    $row=array_merge($row,[$total,$ot,$debt,($total*(float)$e['daily_rate'])-$debt]);
    fputcsv($out,$row);
}
fclose($out);
?>