<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'data') {
    $month = max(1, min(12, (int) ($_GET['month'] ?? date('n'))));
    $year = (int) ($_GET['year'] ?? date('Y'));
    $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);

    $setting = $pdo->prepare(
        "SELECT overtime_rate FROM monthly_settings WHERE month = ? AND year = ?"
    );
    $setting->execute([$month, $year]);
    $overtimeRate = (float) ($setting->fetchColumn() ?: 0);

    $employees = $pdo->query(
        "SELECT id, name, daily_rate AS rate FROM employees
         WHERE is_active = 1 ORDER BY name"
    )->fetchAll();

    $start = sprintf('%04d-%02d-01', $year, $month);
    $end = sprintf('%04d-%02d-%02d', $year, $month, $days);

    $stmt = $pdo->prepare(
        "SELECT employee_id, DAY(attendance_date) day, status
         FROM attendances
         WHERE attendance_date BETWEEN ? AND ?"
    );
    $stmt->execute([$start, $end]);
    $att = [];
    foreach ($stmt as $row) {
        $att[$row['employee_id']][(int) $row['day']] = $row['status'];
    }

    $stmt = $pdo->prepare(
        "SELECT employee_id, overtime, debt FROM monthly_extras
         WHERE month = ? AND year = ?"
    );
    $stmt->execute([$month, $year]);
    $extras = [];
    foreach ($stmt as $row) {
        $extras[$row['employee_id']] = [
            'overtime' => (float) $row['overtime'],
            'debt' => (float) $row['debt']
        ];
    }

    foreach ($employees as &$employee) {
        $employee['id'] = (int) $employee['id'];
        $employee['rate'] = (float) $employee['rate'];
        $employee['attendance'] = $att[$employee['id']] ?? [];
        $employee['overtime'] = $extras[$employee['id']]['overtime'] ?? 0;
        $employee['debt'] = $extras[$employee['id']]['debt'] ?? 0;
    }

    echo json_encode([
        'success' => true,
        'overtimeRate' => $overtimeRate,
        'employees' => $employees
    ]);
    exit;
}

if ($action === 'employee-create') {
    $name = trim($_POST['name'] ?? '');
    $rate = max(0, (float) ($_POST['rate'] ?? 0));
    if ($name === '') jsonError('Nama karyawan wajib diisi.');

    $stmt = $pdo->prepare("INSERT INTO employees (name, daily_rate) VALUES (?, ?)");
    $stmt->execute([$name, $rate]);

    echo json_encode(['success' => true, 'id' => (int) $pdo->lastInsertId()]);
    exit;
}

if ($action === 'employee-update') {
    $id = (int) ($_POST['id'] ?? 0);
    $field = $_POST['field'] ?? '';
    $value = $_POST['value'] ?? '';

    if ($id < 1 || !in_array($field, ['name', 'rate'], true)) jsonError('Data tidak valid.');

    if ($field === 'name') {
        $value = trim($value);
        if ($value === '') jsonError('Nama tidak boleh kosong.');
        $stmt = $pdo->prepare("UPDATE employees SET name = ? WHERE id = ?");
        $stmt->execute([$value, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE employees SET daily_rate = ? WHERE id = ?");
        $stmt->execute([max(0, (float) $value), $id]);
    }

    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'employee-delete') {
    $id = (int) ($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'attendance') {
    $employeeId = (int) ($_POST['employeeId'] ?? 0);
    $month = (int) ($_POST['month'] ?? 0);
    $year = (int) ($_POST['year'] ?? 0);
    $day = (int) ($_POST['day'] ?? 0);
    $value = $_POST['value'] ?? '';

    $allowed = ['', '1', '0.5', '0', 'X', 'R'];
    if ($employeeId < 1 || $month < 1 || $month > 12 ||
        $day < 1 || $day > cal_days_in_month(CAL_GREGORIAN, $month, $year) ||
        !in_array($value, $allowed, true)) {
        jsonError('Data absensi tidak valid.');
    }

    $date = sprintf('%04d-%02d-%02d', $year, $month, $day);

    if ($value === '') {
        $stmt = $pdo->prepare(
            "DELETE FROM attendances WHERE employee_id = ? AND attendance_date = ?"
        );
        $stmt->execute([$employeeId, $date]);
    } else {
        $stmt = $pdo->prepare(
            "INSERT INTO attendances (employee_id, attendance_date, status)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status)"
        );
        $stmt->execute([$employeeId, $date, $value]);
    }

    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'extras') {
    $employeeId = (int) ($_POST['employeeId'] ?? 0);
    $month = (int) ($_POST['month'] ?? 0);
    $year = (int) ($_POST['year'] ?? 0);
    $overtime = max(0, (float) ($_POST['overtime'] ?? 0));
    $debt = max(0, (float) ($_POST['debt'] ?? 0));

    $stmt = $pdo->prepare(
        "INSERT INTO monthly_extras (employee_id, month, year, overtime, debt)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE overtime = VALUES(overtime), debt = VALUES(debt)"
    );
    $stmt->execute([$employeeId, $month, $year, $overtime, $debt]);

    echo json_encode(['success' => true]);
    exit;
}

jsonError('Aksi tidak ditemukan.', 404);
?>
