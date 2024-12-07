let participants = [];
let tableBody = document.querySelector("#scoreTable tbody");

// Tambahkan peserta ke tabel
document.querySelector("#addParticipant").addEventListener("click", () => {
    const nama = document.querySelector("#nama").value.trim();
    const kelas = document.querySelector("#kelas").value.trim();

    if (nama && kelas) {
        participants.push({ nama, kelas, scores: [0, 0, 0, 0, 0, 0], total: 0, grade: "B" });
        renderTable();
        document.querySelector("#nama").value = ""; // Kosongkan input nama
        document.querySelector("#kelas").value = ""; // Kosongkan input kelas
    }
});

// Render tabel
function renderTable() {
    tableBody.innerHTML = "";
    participants.forEach((participant, index) => {
        participant.total = participant.scores.reduce((sum, score) => sum + score, 0);
        participant.grade = participant.total > 60 ? "A" : "B";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${participant.nama}</td>
            <td>${participant.kelas}</td>
            ${participant.scores
                .map(
                    (score, i) =>
                        `<td><input type="number" value="${score}" data-index="${index}" data-score="${i}" class="scoreInput"></td>`
                )
                .join("")}
            <td>${participant.total}</td>
            <td class="grade ${participant.grade}">${participant.grade}</td>
        `;
        tableBody.appendChild(row);
    });

    // Tangani input nilai
    document.querySelectorAll(".scoreInput").forEach((input) => {
        input.addEventListener("input", (e) => {
            const index = e.target.dataset.index;
            const scoreIndex = e.target.dataset.score;
            participants[index].scores[scoreIndex] = parseInt(e.target.value) || 0;
            updateGrades(); // Perbarui total dan grade
        });
    });
}

// Perbarui grade dan total nilai
function updateGrades() {
    participants.forEach((participant) => {
        participant.total = participant.scores.reduce((sum, score) => sum + score, 0);
        participant.grade = participant.total > 60 ? "A" : "B";
    });
    renderGrades(); // Perbarui tampilan grade tanpa merender ulang tabel
}

// Render ulang hanya kolom total dan grade
function renderGrades() {
    document.querySelectorAll(".grade").forEach((cell, i) => {
        cell.textContent = participants[i].grade;
    });

    tableBody.querySelectorAll("tr").forEach((row, i) => {
        const totalCell = row.querySelector("td:nth-last-child(2)");
        totalCell.textContent = participants[i].total;
    });
}

// Download Excel
document.querySelector("#downloadExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["No", "Nama", "Kelas", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda", "Total", "Nilai"],
        ...participants.map((p, i) => [i + 1, p.nama, p.kelas, ...p.scores, p.total, p.grade]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Penilaian");
    XLSX.writeFile(wb, "Penilaian-Silat.xlsx");
});

// Download PDF
document.querySelector("#downloadPDF").addEventListener("click", () => {
    const doc = new jsPDF();
    doc.text("Penilaian Ekskul Pencak Silat", 10, 10);
    let startY = 20;
    participants.forEach((p, i) => {
        const scoresText = `Push-up: ${p.scores[0]}, Sit-up: ${p.scores[1]}, Plank: ${p.scores[2]}, Pukulan: ${p.scores[3]}, Tendangan: ${p.scores[4]}, Kuda-kuda: ${p.scores[5]}`;
        doc.text(
            `${i + 1}. ${p.nama} (Kelas: ${p.kelas}) - Total: ${p.total}, Nilai: ${p.grade} - ${scoresText}`,
            10,
            startY
        );
        startY += 10;
    });
    doc.save("Penilaian-Silat.pdf");
});

// Inisialisasi tabel
renderTable();
