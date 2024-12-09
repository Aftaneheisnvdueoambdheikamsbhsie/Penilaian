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
            <td contenteditable="true" class="editable nama">${participant.nama}</td>
            <td contenteditable="true" class="editable kelas">${participant.kelas}</td>
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

        // Navigasi dengan Enter
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll(".scoreInput"));
                const currentIndex = inputs.indexOf(e.target);
                if (currentIndex !== -1) {
                    const nextInput = inputs[currentIndex + 1] || inputs[0];
                    nextInput.focus();
                }
            }
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

    // Event listener untuk pengeditan nama dan kelas
    document.querySelectorAll(".editable").forEach((cell) => {
        cell.addEventListener("blur", (e) => {
            const rowIndex = [...e.target.parentElement.parentElement.children].indexOf(e.target.parentElement) - 1;
            const key = e.target.classList.contains("nama") ? "nama" : "kelas";
            participants[rowIndex][key] = e.target.textContent.trim();
            saveToLocalStorage();
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
    const evaluatorName = document.querySelector("#evaluatorName").value.trim();
    const signatureImage = signaturePad.isEmpty() ? null : signaturePad.toDataURL("image/png");

    const wb = XLSX.utils.book_new();

    // Data Header
    const wsData = [
        ["Penilaian Ekskul Pencak Silat"],
        evaluatorName ? [`Penguji: ${evaluatorName}`] : [],
        [],
        ["No", "Nama", "Kelas", "Push-up", "Sit-up", "Plank", "Pukulan", "Tendangan", "Kuda-kuda", "Sikap", "Total", "Grade"]
    ];

    // Tambahkan Data Peserta
    participants.forEach((p, i) => {
        wsData.push([i + 1, p.nama, p.kelas, ...p.scores, p.sikap, p.total, p.grade]);
    });

    // Tambahkan Worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Tambahkan Tanda Tangan sebagai Base64 (jika ada)
    if (signatureImage) {
        ws["!images"] = [
            {
                name: "Signature",
                data: signatureImage,
                type: "image/png",
                position: {
                    type: "twoCellAnchor",
                    attrs: {
                        from: { col: 0, row: wsData.length + 2 },
                        to: { col: 5, row: wsData.length + 4 }
                    }
                }
            }
        ];
    }

    XLSX.utils.book_append_sheet(wb, ws, "Penilaian");

    // Unduh File
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
// Inisialisasi Signature Pad
const canvas = document.getElementById("signatureCanvas");
const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgba(255, 255, 255, 1)', // Warna latar belakang kanvas
    penColor: 'black',                        // Warna tinta
});

// Fungsi untuk menghapus tanda tangan
document.getElementById("clearSignature").addEventListener("click", () => {
    signaturePad.clear();
});

// Pastikan kanvas dapat disesuaikan ukurannya dengan layar
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // Kosongkan tanda tangan setelah resize
}

// Panggil fungsi resizeCanvas setiap kali halaman di-load
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
});

renderTable();
