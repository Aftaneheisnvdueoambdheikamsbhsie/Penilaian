let participants = [];
let tableBody = document.querySelector("#scoreTable tbody");

// Tambahkan peserta ke tabel
document.querySelector("#addParticipant").addEventListener("click", () => {
    const nama = document.querySelector("#nama").value.trim();
    if (nama) {
        participants.push({ nama, scores: [0, 0, 0, 0, 0, 0] });
        renderTable();
        document.querySelector("#nama").value = "";
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
        `;
        tableBody.appendChild(row);
    });

    // Update nilai
    document.querySelectorAll(".scoreInput").forEach((input) => {
        input.addEventListener("input", (e) => {
            const index = e.target.dataset.index;
            const scoreIndex = e.target.dataset.score;
            participants[index].scores[scoreIndex] = parseInt(e.target.value) || 0;
        });
    });
}

// Download Excel
document.querySelector("#downloadExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["No", "Nama", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda"],
        ...participants.map((p, i) => [i + 1, p.nama, ...p.scores]),
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
        doc.text(
            `${i + 1}. ${p.nama} - Push-up: ${p.scores[0]}, Sit-up: ${p.scores[1]}, Plank: ${p.scores[2]}, Pukulan: ${p.scores[3]}, Tendangan: ${p.scores[4]}, Kuda-kuda: ${p.scores[5]}`,
            10,
            startY
        );
        startY += 10;
    });
    doc.save("Penilaian-Fighter.pdf");
});