const MONTHS = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
];

const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let employees = [];
let overtimeRate = 0;

const $ = id => document.getElementById(id);

function storageKey() {
    return `absen-${currentYear}-${currentMonth}`;
}

function loadData() {
    const saved = localStorage.getItem(storageKey());
    if (!saved) {
        employees = [];
        overtimeRate = 0;
        return;
    }

    try {
        const data = JSON.parse(saved);
        employees = Array.isArray(data.employees) ? data.employees : [];
        overtimeRate = Number(data.overtimeRate || 0);
    } catch {
        employees = [];
        overtimeRate = 0;
    }
}

function saveData() {
    localStorage.setItem(storageKey(), JSON.stringify({
        employees,
        overtimeRate
    }));
}

function daysInMonth() {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
}

function rupiah(value) {
    return Number(value || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    });
}

function number(value) {
    return Number(value || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 1
    });
}

function attendanceTotal(employee) {
    let total = 0;
    for (let day = 1; day <= daysInMonth(); day++) {
        const v = employee.attendance?.[day];
        if (v === "1" || v === "0.5") total += Number(v);
    }
    return total;
}

function employeePay(employee) {
    return attendanceTotal(employee) * Number(employee.rate || 0)
        + Number(employee.overtime || 0) * overtimeRate
        - Number(employee.debt || 0);
}

function populatePeriod() {
    $("monthSelect").innerHTML = MONTHS.map((m, i) =>
        `<option value="${i}">${m}</option>`
    ).join("");

    $("monthSelect").value = currentMonth;

    const start = currentYear - 3;
    const end = currentYear + 3;

    $("yearSelect").innerHTML = "";
    for (let y = start; y <= end; y++) {
        $("yearSelect").insertAdjacentHTML(
            "beforeend",
            `<option value="${y}">${y}</option>`
        );
    }
    $("yearSelect").value = currentYear;
}

function render() {
    const days = daysInMonth();

    let header = `
        <tr>
            <th class="name-head name-head">Nama</th>
            <th class="rate-col">Tarif<br>/ Hari</th>
    `;

    for (let d = 1; d <= days; d++) {
        const date = new Date(currentYear, currentMonth, d);
        header += `
            <th class="day-col">
                ${d}
                <span class="subday">${DAYS[date.getDay()]}</span>
            </th>
        `;
    }

    header += `
            <th class="total-col">Total</th>
            <th class="overtime-col">Lembur</th>
            <th class="bon-col">Bon</th>
            <th class="pay-col">Total Bayar</th>
            <th class="action-col">Aksi</th>
        </tr>
    `;

    $("tableHeader").innerHTML = header;

    let body = "";

    employees.forEach((employee, index) => {
        body += `
            <tr>
                <td class="name-cell">
                    <input class="row-input" data-action="name" data-index="${index}"
                        value="${escapeHtml(employee.name)}">
                </td>

                <td>
                    <input class="row-input" type="number" min="0" step="1000"
                        data-action="rate" data-index="${index}"
                        value="${Number(employee.rate || 0)}">
                </td>
        `;

        for (let d = 1; d <= days; d++) {
            const value = employee.attendance?.[d] ?? "";
            body += `
                <td>
                    <select class="attendance" data-action="attendance"
                        data-index="${index}" data-day="${d}">
                        <option value="" ${value === "" ? "selected" : ""}>-</option>
                        <option value="1" ${value === "1" ? "selected" : ""}>1</option>
                        <option value="0.5" ${value === "0.5" ? "selected" : ""}>½</option>
                        <option value="0" ${value === "0" ? "selected" : ""}>0</option>
                        <option value="X" ${value === "X" ? "selected" : ""}>X</option>
                        <option value="R" ${value === "R" ? "selected" : ""}>R</option>
                    </select>
                </td>
            `;
        }

        body += `
            <td><b>${number(attendanceTotal(employee))}</b></td>
            <td>
                <input class="row-input" type="number" min="0" step="0.5"
                    data-action="overtime" data-index="${index}"
                    value="${Number(employee.overtime || 0)}">
            </td>
            <td>
                <input class="row-input" type="number" min="0" step="1000"
                    data-action="debt" data-index="${index}"
                    value="${Number(employee.debt || 0)}">
            </td>
            <td><b>${rupiah(employeePay(employee))}</b></td>
            <td class="action-cell">
                <button class="delete-btn" data-action="delete" data-index="${index}">
                    Hapus
                </button>
            </td>
        </tr>
        `;
    });

    $("tableBody").innerHTML = body;
    renderFooter();
    renderSummary();
}

function renderFooter() {
    const days = daysInMonth();

    let grandAttendance = 0;
    let grandOvertime = 0;
    let grandDebt = 0;
    let grandPay = 0;

    const perDay = Array(days + 1).fill(0);

    employees.forEach(employee => {
        grandAttendance += attendanceTotal(employee);
        grandOvertime += Number(employee.overtime || 0);
        grandDebt += Number(employee.debt || 0);
        grandPay += employeePay(employee);

        for (let d = 1; d <= days; d++) {
            const v = employee.attendance?.[d];
            if (v === "1" || v === "0.5") perDay[d] += Number(v);
        }
    });

    let html = `
        <tr>
            <th>TOTAL</th>
            <th>-</th>
    `;

    for (let d = 1; d <= days; d++) {
        html += `<th>${number(perDay[d])}</th>`;
    }

    html += `
        <th>${number(grandAttendance)}</th>
        <th>${number(grandOvertime)}</th>
        <th>${rupiah(grandDebt)}</th>
        <th>${rupiah(grandPay)}</th>
        <th class="action-col">-</th>
    </tr>
    `;

    $("tableFooter").innerHTML = html;
}

function renderSummary() {
    let attendance = 0;
    let overtime = 0;
    let debt = 0;
    let salary = 0;

    employees.forEach(employee => {
        attendance += attendanceTotal(employee);
        overtime += Number(employee.overtime || 0);
        debt += Number(employee.debt || 0);
        salary += employeePay(employee);
    });

    $("summaryEmployees").textContent = employees.length;
    $("summaryAttendance").textContent = number(attendance);
    $("summaryOvertime").textContent = number(overtime);
    $("summaryDebt").textContent = rupiah(debt);
    $("summarySalary").textContent = rupiah(salary);
    $("overtimeRate").value = overtimeRate;
}

function escapeHtml(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function addEmployee() {
    const name = $("employeeName").value.trim();
    const rate = Number($("employeeRate").value || 0);

    if (!name) {
        alert("Nama karyawan belum diisi.");
        $("employeeName").focus();
        return;
    }

    employees.push({
        id: Date.now(),
        name,
        rate,
        attendance: {},
        overtime: 0,
        debt: 0
    });

    saveData();
    closeModal();
    render();
}

function openModal() {
    $("employeeName").value = "";
    $("employeeRate").value = "";
    $("employeeModal").classList.remove("hidden");
    $("employeeName").focus();
}

function closeModal() {
    $("employeeModal").classList.add("hidden");
}

$("monthSelect").addEventListener("change", e => {
    currentMonth = Number(e.target.value);
    loadData();
    render();
});

$("yearSelect").addEventListener("change", e => {
    currentYear = Number(e.target.value);
    loadData();
    render();
});

$("overtimeRate").addEventListener("change", e => {
    overtimeRate = Number(e.target.value || 0);
    saveData();
    render();
});

$("addEmployeeBtn").addEventListener("click", openModal);
$("closeModalBtn").addEventListener("click", closeModal);
$("cancelEmployeeBtn").addEventListener("click", closeModal);
$("saveEmployeeBtn").addEventListener("click", addEmployee);

$("employeeName").addEventListener("keydown", e => {
    if (e.key === "Enter") addEmployee();
});

$("employeeModal").addEventListener("click", e => {
    if (e.target === $("employeeModal")) closeModal();
});

$("tableBody").addEventListener("change", e => {
    const target = e.target;
    const action = target.dataset.action;
    const index = Number(target.dataset.index);

    if (!employees[index]) return;

    if (action === "name") {
        employees[index].name = target.value;
    }

    if (action === "rate") {
        employees[index].rate = Number(target.value || 0);
    }

    if (action === "overtime") {
        employees[index].overtime = Number(target.value || 0);
    }

    if (action === "debt") {
        employees[index].debt = Number(target.value || 0);
    }

    if (action === "attendance") {
        const day = Number(target.dataset.day);
        employees[index].attendance[day] = target.value;
    }

    saveData();
    render();
});

$("tableBody").addEventListener("click", e => {
    const button = e.target.closest("[data-action='delete']");
    if (!button) return;

    const index = Number(button.dataset.index);
    const employee = employees[index];

    if (!employee) return;

    if (confirm(`Hapus ${employee.name}?`)) {
        employees.splice(index, 1);
        saveData();
        render();
    }
});

$("printBtn").addEventListener("click", () => {
    window.print();
});

$("exportBtn").addEventListener("click", exportExcel);

function exportExcel() {
    if (typeof XLSX === "undefined") {
        alert("Library Excel belum termuat. Pastikan koneksi internet aktif.");
        return;
    }

    const days = daysInMonth();
    const data = [];

    const title = [
        [`ABSEN - ${MONTHS[currentMonth].toUpperCase()} ${currentYear}`]
    ];
    data.push(...title);
    data.push([]);

    const headers = ["Nama", "Tarif / Hari"];

    for (let d = 1; d <= days; d++) {
        const date = new Date(currentYear, currentMonth, d);
        headers.push(`${d} ${DAYS[date.getDay()]}`);
    }

    headers.push("Total", "Lembur", "Bon", "Total Bayar");
    data.push(headers);

    employees.forEach(employee => {
        const row = [
            employee.name,
            Number(employee.rate || 0)
        ];

        for (let d = 1; d <= days; d++) {
            row.push(employee.attendance?.[d] ?? "");
        }

        row.push(
            attendanceTotal(employee),
            Number(employee.overtime || 0),
            Number(employee.debt || 0),
            employeePay(employee)
        );

        data.push(row);
    });

    const totalRow = ["TOTAL", ""];

    const perDay = Array(days + 1).fill(0);
    let totalAttendance = 0;
    let totalOvertime = 0;
    let totalDebt = 0;
    let totalPay = 0;

    employees.forEach(employee => {
        totalAttendance += attendanceTotal(employee);
        totalOvertime += Number(employee.overtime || 0);
        totalDebt += Number(employee.debt || 0);
        totalPay += employeePay(employee);

        for (let d = 1; d <= days; d++) {
            const v = employee.attendance?.[d];
            if (v === "1" || v === "0.5") perDay[d] += Number(v);
        }
    });

    for (let d = 1; d <= days; d++) totalRow.push(perDay[d]);
    totalRow.push(totalAttendance, totalOvertime, totalDebt, totalPay);
    data.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

    const widths = [
        { wch: 23 },
        { wch: 14 },
        ...Array(days).fill({ wch: 7 }),
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 18 }
    ];
    ws["!cols"] = widths;

    const currencyColumns = [1, headers.length - 2, headers.length - 1];
    for (let r = 3; r < data.length; r++) {
        currencyColumns.forEach(c => {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (cell && typeof cell.v === "number") {
                cell.z = '"Rp" #,##0';
            }
        });
    }

    ws["!freeze"] = { xSplit: 2, ySplit: 3 };
    ws["!autofilter"] = {
        ref: `A3:${XLSX.utils.encode_col(headers.length - 1)}${data.length - 1}`
    };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ABSEN");

    // Sheet rekap
    const recap = [
        ["REKAP PEMBAYARAN", `${MONTHS[currentMonth]} ${currentYear}`],
        [],
        ["Nama", "Tarif / Hari", "Total Hari", "Lembur", "Bon", "Total Bayar"]
    ];

    employees.forEach(employee => {
        recap.push([
            employee.name,
            Number(employee.rate || 0),
            attendanceTotal(employee),
            Number(employee.overtime || 0),
            Number(employee.debt || 0),
            employeePay(employee)
        ]);
    });

    recap.push([
        "TOTAL",
        "",
        totalAttendance,
        totalOvertime,
        totalDebt,
        totalPay
    ]);

    const ws2 = XLSX.utils.aoa_to_sheet(recap);
    ws2["!cols"] = [
        { wch: 23 }, { wch: 14 }, { wch: 12 },
        { wch: 10 }, { wch: 15 }, { wch: 18 }
    ];

    for (let r = 3; r < recap.length; r++) {
        [1, 4, 5].forEach(c => {
            const cell = ws2[XLSX.utils.encode_cell({ r, c })];
            if (cell && typeof cell.v === "number") cell.z = '"Rp" #,##0';
        });
    }

    XLSX.utils.book_append_sheet(wb, ws2, "REKAP");

    XLSX.writeFile(
        wb,
        `ABSEN-${MONTHS[currentMonth]}-${currentYear}.xlsx`
    );
}

populatePeriod();
loadData();
render();
