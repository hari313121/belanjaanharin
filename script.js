document.addEventListener('DOMContentLoaded', () => {
    const shoppingForm = document.getElementById('shoppingForm');
    const itemNameInput = document.getElementById('itemName');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemUnitSelect = document.getElementById('itemUnit');
    const shoppingList = document.getElementById('shoppingList');
    const printButton = document.getElementById('printButton');
    const printPdfButton = document.getElementById('printPdfButton'); // **Tambahan ini**
    const whatsappButton = document.getElementById('whatsappButton');
    const clearListButton = document.getElementById('clearListButton');
    const printHeaderInput = document.getElementById('printHeaderInput');

    let items = [];

    // Fungsi untuk menampilkan item di daftar pada halaman web
    function renderShoppingList() {
        shoppingList.innerHTML = ''; // Kosongkan daftar sebelum merender ulang
        if (items.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Daftar belanja masih kosong.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.fontStyle = 'italic';
            shoppingList.appendChild(emptyMessage);
        } else {
            items.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${item.name} (${item.quantity} ${item.unit})</span>
                    <button class="removeItem" data-index="${index}">X</button>
                `;
                shoppingList.appendChild(listItem);
            });
        }
    }

    // Menambahkan item ke daftar
    shoppingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemName = itemNameInput.value.trim();
        const itemQuantity = itemQuantityInput.value;
        const itemUnit = itemUnitSelect.value;

        if (itemName && itemQuantity) {
            items.push({ name: itemName, quantity: itemQuantity, unit: itemUnit });
            renderShoppingList();
            itemNameInput.value = '';
            itemQuantityInput.value = '';
            itemUnitSelect.value = 'Pcs'; // Reset ke Pcs
            itemNameInput.focus();
        }
    });

    // Menghapus item dari daftar
    shoppingList.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItem')) {
            const indexToRemove = parseInt(e.target.dataset.index);
            items.splice(indexToRemove, 1);
            renderShoppingList();
        }
    });

    // Membersihkan seluruh daftar
    clearListButton.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua item dari daftar?')) {
            items = [];
            renderShoppingList();
        }
    });

    // --- Fungsionalitas Printer Bluetooth (Tidak Berubah) ---
    printButton.addEventListener('click', async () => {
        if (items.length === 0) {
            alert('Daftar belanja kosong, tidak ada yang bisa dicetak.');
            return;
        }

        const customHeader = printHeaderInput.value.trim();
        const headerToPrint = customHeader.length > 0 ? customHeader : "Daftar Belanja Harinfood";

        if ('bluetooth' in navigator) {
            try {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
                });

                const server = await device.gatt.connect();
                const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
                const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

                let printData = new Uint8Array([]);
                printData = new Uint8Array([...printData, 0x1B, 0x40]);

                printData = new Uint8Array([...printData,
                    0x1B, 0x45, 0x01,
                    0x1D, 0x21, 0x01
                ]);
                const headerPrinted = `${headerToPrint}\n`;
                printData = new Uint8Array([...printData, ...new TextEncoder().encode(headerPrinted)]);

                printData = new Uint8Array([...printData,
                    0x1D, 0x21, 0x00,
                    0x0A, 0x0A
                ]);

                items.forEach((item, index) => {
                    const itemLine = `${item.name} (${item.quantity} ${item.unit})\n`;
                    printData = new Uint8Array([...printData, ...new TextEncoder().encode(itemLine)]);
                    const lineSeparator = "--------------------------------\n";
                    printData = new Uint8Array([...printData, ...new TextEncoder().encode(lineSeparator)]);
                });

                const footer = "\nTerima kasih!\n\n\n";
                printData = new Uint8Array([...printData, ...new TextEncoder().encode(footer)]);
                printData = new Uint8Array([...printData, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A]);

                await characteristic.writeValue(printData);
                alert('Daftar belanja berhasil dikirim ke printer!');

            } catch (error) {
                console.error('Error saat mencetak:', error);
                alert('Gagal terhubung atau mencetak. Pastikan printer menyala dan dalam mode pairing, serta browser mendukung Web Bluetooth API (gunakan HTTPS). ' + error.message);
            }
        } else {
            alert('Browser Anda tidak mendukung Web Bluetooth API. Silakan gunakan Chrome di perangkat yang mendukung.');
        }
    });

    // --- Fungsionalitas Cetak PDF (BARU) ---
    printPdfButton.addEventListener('click', () => {
        if (items.length === 0) {
            alert('Daftar belanja kosong, tidak ada yang bisa dicetak ke PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;

        // Dimensi kertas thermal 58mm x 200mm
        // 1 mm = 1 / 25.4 * 72 points (standard PDF unit) ≈ 2.8346 points
        const widthMm = 58;
        const heightMm = 200; // Asumsi panjang maksimal, PDF akan memanjang jika konten lebih banyak

        // Konversi mm ke points (pt)
        const widthPt = widthMm * 2.8346;
        const heightPt = heightMm * 2.8346;

        // Membuat instance jsPDF dengan ukuran kustom
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt', // Menggunakan points sebagai unit
            format: [widthPt, heightPt] // [width, height] in points
        });

        // Ambil nilai header dari input teks
        const customHeader = printHeaderInput.value.trim();
        const headerToPrint = customHeader.length > 0 ? customHeader : "Daftar Belanja Harinfood";

        let yPos = 20; // Posisi Y awal
        const marginX = 10; // Margin horizontal

        // Set font untuk Header (bold dan sedikit lebih besar)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14); // Ukuran font untuk header (bisa disesuaikan)
        const headerTextWidth = doc.getTextWidth(headerToPrint);
        const headerX = (widthPt - headerTextWidth) / 2; // Pusatkan header
        doc.text(headerToPrint, headerX, yPos);
        yPos += 20; // Jarak setelah header

        // Set font untuk Item Daftar (normal dan tebal)
        doc.setFont('helvetica', 'bold'); // Tetap bold
        doc.setFontSize(10); // Ukuran font untuk item (bisa disesuaikan)
        yPos += 10; // Jarak sebelum item pertama

        items.forEach((item, index) => {
            const itemLine = `${item.name} (${item.quantity} ${item.unit})`;
            doc.text(itemLine, marginX, yPos);
            yPos += 12; // Jarak antar baris item

            // Tambahkan garis pemisah
            doc.line(marginX, yPos - 3, widthPt - marginX, yPos - 3); // Garis horizontal
            yPos += 5; // Jarak setelah garis
        });

        // Tambahkan Footer
        doc.setFont('helvetica', 'normal'); // Kembali ke font normal untuk footer
        doc.setFontSize(9);
        yPos += 15;
        const footerText = "Terima kasih!";
        const footerTextWidth = doc.getTextWidth(footerText);
        const footerX = (widthPt - footerTextWidth) / 2;
        doc.text(footerText, footerX, yPos);

        // Simpan PDF
        doc.save('daftar_belanja_harinfood.pdf');
        alert('PDF daftar belanja berhasil dibuat dan diunduh!');
    });

    // --- Fungsionalitas WhatsApp (Tidak Berubah) ---
    whatsappButton.addEventListener('click', () => {
        if (items.length === 0) {
            alert('Daftar belanja kosong, tidak ada yang bisa dikirim.');
            return;
        }

        const customHeader = printHeaderInput.value.trim();
        const headerForWhatsapp = customHeader.length > 0 ? customHeader : "Daftar Belanja Harinfood";

        let message = `${headerForWhatsapp}:\n\n`;
        items.forEach(item => {
            message += `${item.name} (${item.quantity} ${item.unit})\n`;
        });
        message += "\nTerima kasih!";

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Inisialisasi tampilan daftar saat halaman dimuat
    renderShoppingList();
});
