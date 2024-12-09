let participants = JSON.parse(localStorage.getItem("participants")) || [];
const tableBody = document.querySelector("#scoreTable tbody");

// Tambahkan peserta ke tabel
document.querySelector("#addParticipant").addEventListener("click", () => {
    const nama = document.querySelector("#nama").value.trim();
    const kelas = document.querySelector("#kelas").value.trim();
    if (nama && kelas) {
        participants.push({ nama, kelas, scores: [0, 0, 0, 0, 0, 0], sikap: "B", total: 0, grade: "" });
        saveToLocalStorage();
        renderTable();
        document.querySelector("#nama").value = "";
        document.querySelector("#kelas").value = "";
    }
});

// Simpan data ke localStorage
function saveToLocalStorage() {
    localStorage.setItem("participants", JSON.stringify(participants));
}

// Render tabel
function renderTable() {
    tableBody.innerHTML = "";
    participants.forEach((participant, index) => {
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
            <td>
                <select data-index="${index}" class="sikapSelect">
                    <option value="B" ${participant.sikap === "B" ? "selected" : ""}>B</option>
                    <option value="B-" ${participant.sikap === "B-" ? "selected" : ""}>B-</option>
                </select>
            </td>
            <td class="total">${participant.total}</td>
            <td class="grade">${participant.grade}</td>
            <td>
                <button class="edit-btn" data-index="${index}">&#9998;</button>
                <button class="delete-btn" data-index="${index}">&#128465;</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Event listener untuk input nilai
    document.querySelectorAll(".scoreInput").forEach((input) => {
        input.addEventListener("input", (e) => {
            const index = e.target.dataset.index;
            const scoreIndex = e.target.dataset.score;
            participants[index].scores[scoreIndex] = parseInt(e.target.value) || 0;
            updateGrade(index);
        });
    });

    // Event listener untuk pilihan sikap
    document.querySelectorAll(".sikapSelect").forEach((select) => {
        select.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            participants[index].sikap = e.target.value;
            updateGrade(index);
        });
    });

    // Event listener untuk tombol edit
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            const newName = prompt("Edit Nama:", participants[index].nama);
            const newClass = prompt("Edit Kelas:", participants[index].kelas);
            if (newName && newClass) {
                participants[index].nama = newName.trim();
                participants[index].kelas = newClass.trim();
                saveToLocalStorage();
                renderTable();
            }
        });
    });

    // Event listener untuk tombol hapus
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            if (confirm(`Yakin ingin menghapus peserta "${participants[index].nama}"?`)) {
                participants.splice(index, 1);
                saveToLocalStorage();
                renderTable();
            }
        });
    });
}

// Hitung total nilai dan grade
function updateGrade(index) {
    const participant = participants[index];
    participant.total = participant.scores.reduce((sum, score) => sum + score, 0);

    // Logika sikap
    if (participant.sikap === "B-") {
        participant.total -= 5;
    } else if (participant.sikap === "B") {
        participant.total += 5;
        participant.total = Math.min(participant.total, 100);
    }

    participant.grade = participant.total >= 75 ? "A" : "B";
    saveToLocalStorage();

    // Render ulang nilai total dan grade
    const row = tableBody.children[index];
    row.querySelector(".total").textContent = participant.total;
    row.querySelector(".grade").textContent = participant.grade;
}

// Unduh Excel
document.querySelector("#downloadExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["No", "Nama", "Kelas", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda", "Sikap", "Total", "Grade"],
        ...participants.map((p, i) => [i + 1, p.nama, p.kelas, ...p.scores, p.sikap, p.total, p.grade]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Penilaian");
    XLSX.writeFile(wb, "Penilaian-Silat.xlsx");
});

// Unduh PDF
document.querySelector("#downloadPDF").addEventListener("click", () => {
    const doc = new jsPDF();
    doc.text("Penilaian Ekskul Pencak Silat", 10, 10);
    const tableColumn = ["No", "Nama", "Kelas", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda", "Sikap", "Total", "Grade"];
    const tableRows = participants.map((p, i) => [i + 1, p.nama, p.kelas, ...p.scores, p.sikap, p.total, p.grade]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("Penilaian-Silat.pdf");
});

// Unduh JPEG
document.querySelector("#downloadJPEG").addEventListener("click", () => {
    const element = document.querySelector("#scoreTable");
    html2canvas(element).then((canvas) => {
        const link = document.createElement("a");
        link.download = "Penilaian-Silat.jpeg";
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
    });
});

// Fitur Tanda Tangan
const canvas = document.querySelector("#signatureCanvas");
const signaturePad = new SignaturePad(canvas);

document.querySelector("#clearSignature").addEventListener("click", () => {
    signaturePad.clear();
});

renderTable();
