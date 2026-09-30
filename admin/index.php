<?php
require_once __DIR__ . '/../config/database.php';
$employees = $pdo->query(
    "SELECT id, name, daily_rate, is_active, created_at FROM employees ORDER BY name"
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin - ABSEN</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<header class="topbar">
    <div><h1>ABSEN</h1><p>Manajemen Karyawan</p></div>
    <a class="btn" href="../index.php">← Kembali</a>
</header>
<main class="content" style="padding-top:25px">
    <div class="table-shell">
        <table>
            <thead><tr><th>Nama</th><th>Tarif / Hari</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
            <?php foreach ($employees as $employee): ?>
                <tr>
                    <td><?= htmlspecialchars($employee['name']) ?></td>
                    <td>Rp<?= number_format($employee['daily_rate'], 0, ',', '.') ?></td>
                    <td><?= $employee['is_active'] ? 'Aktif' : 'Nonaktif' ?></td>
                    <td>
                        <form method="post" action="employee.php" onsubmit="return confirm('Hapus karyawan ini?')">
                            <input type="hidden" name="id" value="<?= $employee['id'] ?>">
                            <button class="delete-btn">Hapus</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</main>
</body>
</html>
