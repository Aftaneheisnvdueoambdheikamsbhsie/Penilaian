let participants = [];
let tableBody = document.querySelector("#scoreTable tbody");

// Tambahkan peserta ke tabel
document.querySelector("#addParticipant").addEventListener("click", () => {
    const nama = document.querySelector("#nama").value.trim();
    if (nama) {
        participants.push({ nama, scores: [0, 0, 0, 0, 0, 0], grade: "B" });
        renderTable();
        document.querySelector("#nama").value = ""; // Kosongkan input
    }
});

// Render tabel
function renderTable() {
    tableBody.innerHTML = "";
    participants.forEach((participant, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${participant.nama}</td>
            ${participant.scores
                .map(
                    (score, i) =>
                        `<td><input type="number" value="${score}" data-index="${index}" data-score="${i}" class="scoreInput"></td>`
                )
                .join("")}
            <td class="grade">${participant.grade}</td>
        `;
        tableBody.appendChild(row);
    });

    // Tangani input nilai
    document.querySelectorAll(".scoreInput").forEach((input) => {
        input.addEventListener("input", (e) => {
            const index = e.target.dataset.index;
            const scoreIndex = e.target.dataset.score;
            participants[index].scores[scoreIndex] = parseInt(e.target.value) || 0;
            updateGrades(); // Perbarui grade setelah semua input
        });
    });
}

// Perbarui grade berdasarkan nilai
function updateGrades() {
    participants.forEach((participant) => {
        const totalScore = participant.scores.reduce((sum, score) => sum + score, 0);
        participant.grade = totalScore > 60 ? "A" : "B";
    });
    renderGrades(); // Perbarui tampilan grade tanpa merender ulang tabel
}

// Render ulang hanya kolom grade
function renderGrades() {
    document.querySelectorAll(".grade").forEach((cell, i) => {
        cell.textContent = participants[i].grade;
    });
}

// Download Excel
document.querySelector("#downloadExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["No", "Nama", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda", "Nilai"],
        ...participants.map((p, i) => [i + 1, p.nama, ...p.scores, p.grade]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Penilaian");
    XLSX.writeFile(wb, "Penilaian-Fighter.xlsx");
});

// Download PDF
document.querySelector("#downloadPDF").addEventListener("click", () => {
    const doc = new jsPDF();
    doc.text("Penilaian Fighter Pencak Silat", 10, 10);
    let startY = 20;
    participants.forEach((p, i) => {
        const scoresText = `Push-up: ${p.scores[0]}, Sit-up: ${p.scores[1]}, Plank: ${p.scores[2]}, Pukulan: ${p.scores[3]}, Tendangan: ${p.scores[4]}, Kuda-kuda: ${p.scores[5]}, Nilai: ${p.grade}`;
        doc.text(`${i + 1}. ${p.nama} - ${scoresText}`, 10, startY);
        startY += 10;
    });
    doc.save("Penilaian-Fighter.pdf");
});

// Inisialisasi tabel
renderTable();
