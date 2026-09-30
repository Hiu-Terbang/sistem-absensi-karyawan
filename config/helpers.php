<?php
function e($value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
function attendanceValue($value): float {
    if ($value === '1' || $value === 1) return 1;
    if ($value === '0.5' || $value === 0.5) return 0.5;
    return 0;
}
?>
