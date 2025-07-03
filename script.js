const shoppingForm = document.getElementById('shopping-item-form');
const itemNameInput = document.getElementById('item-name');
const itemQuantityInput = document.getElementById('item-quantity');
const itemUnitInput = document.getElementById('item-unit');
const shoppingListDiv = document.getElementById('shopping-list');
const printButton = document.getElementById('print-button');
const whatsappButton = document.getElementById('whatsapp-button');
const printDateSpan = document.getElementById('print-date');

let shoppingItems = [];

// Fungsi untuk merender ulang daftar belanja
function renderShoppingList() {
    shoppingListDiv.innerHTML = ''; // Kosongkan daftar sebelumnya
    if (shoppingItems.length === 0) {
        shoppingListDiv.innerHTML = '<p style="text-align: center; color: #777;">Daftar belanja kosong.</p>';
        return;
    }

    shoppingItems.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        
        listItem.innerHTML = `
            <div class="item-line-print">
                <span>${item.name.toUpperCase()}</span> 
                <span>${item.quantity} ${item.unit}</span>
            </div>
            <button class="remove-item-btn" data-index="${index}">X</button>
        `;

        shoppingListDiv.appendChild(listItem);
    });

    // Tambahkan event listener untuk tombol hapus setelah item dirender
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const indexToRemove = parseInt(event.target.dataset.index);
            removeItem(indexToRemove);
        });
    });
}

// Fungsi untuk menambahkan item
shoppingForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Mencegah reload halaman
    const newItem = {
        name: itemNameInput.value.trim(),
        quantity: parseInt(itemQuantityInput.value),
        unit: itemUnitInput.value
    };

    if (newItem.name && newItem.quantity > 0) {
        shoppingItems.push(newItem);
        renderShoppingList(); // Perbarui tampilan
        // Reset form
        itemNameInput.value = '';
        itemQuantityInput.value = '1';
        itemUnitInput.value = 'Pcs';
        itemNameInput.focus();
    }
});

// Fungsi untuk mencetak
printButton.addEventListener('click', () => {
    if (shoppingItems.length === 0) {
        alert('Daftar belanja masih kosong!');
        return;
    }

    // Set tanggal cetak
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    printDateSpan.textContent = now.toLocaleDateString('id-ID', options);

    // Panggil fungsi cetak bawaan browser
    window.print();
});

// Fungsi untuk mengirim via WhatsApp
whatsappButton.addEventListener('click', () => {
    if (shoppingItems.length === 0) {
        alert('Daftar belanja masih kosong!');
        return;
    }

    // --- REKONSTRUKSI PESAN WHATSAPP AGAR MIRIP CETAKAN ---
    let message = "";

    // 1. Header (mirip dengan print-header)
    message += "*HARINFOOD*\n"; // Menggunakan Markdown untuk tebal
    message += "Daftar Belanja\n";
    
    // Ambil tanggal yang sama dengan cetakan
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const printDate = now.toLocaleDateString('id-ID', options);
    message += `Tanggal: ${printDate}\n`;
    message += "-----------------------------------\n"; // Garis pemisah simulasi

    // 2. List Belanjaan
    shoppingItems.forEach((item) => {
        // Format mirip dengan item-line-print, menggunakan uppercase dan spasi
        // Menggunakan '*' untuk membuat baris tebal di WhatsApp jika memungkinkan
        message += `*${item.name.toUpperCase().padEnd(20)} ${item.quantity} ${item.unit}*\n`;
        message += "-----------------------------------\n"; // Garis di bawah setiap item
    });
    // Hapus garis terakhir agar tidak ada garis ganda sebelum footer
    if (shoppingItems.length > 0) {
        message = message.substring(0, message.lastIndexOf("-----------------------------------\n"));
    }


    // 3. Footer
    message += "-----------------------------------\n"; // Garis pemisah simulasi
    message += "Terima Kasih!\n";
    message += "Dibuat oleh Aplikasi Harinfood\n";
    // --- AKHIR REKONSTRUKSI ---

    // --- PERUBAHAN DI SINI: NOMOR WHATSAPP LANGSUNG DIISI ---
    // Nomor WhatsApp tujuan yang sudah ditentukan
    const rawWhatsappNumber = "081235368643";
    let targetWhatsappNumber = rawWhatsappNumber.replace(/\D/g, ''); // Hapus semua non-digit

    // Konversi ke format internasional jika belum
    if (targetWhatsappNumber.startsWith('0')) {
        targetWhatsappNumber = '62' + targetWhatsappNumber.substring(1);
    } else if (!targetWhatsappNumber.startsWith('62')) {
        // Asumsi jika tidak dimulai dengan 0 atau 62, tambahkan 62 jika panjangnya memungkinkan
        if (targetWhatsappNumber.length > 5) { // Minimal 5 digit untuk asumsi nomor valid
            targetWhatsappNumber = '62' + targetWhatsappNumber;
        }
    }
    // --- AKHIR PERUBAHAN ---

    // Validasi sederhana, meskipun nomor sudah hardcode, jaga-jaga jika ada kesalahan format
    if (!targetWhatsappNumber || targetWhatsappNumber.length < 9) { // Nomor WhatsApp minimal sekitar 9 digit untuk Indonesia
        alert("Nomor WhatsApp tidak valid. Pengiriman dibatalkan.");
        return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetWhatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
});

// Inisialisasi tampilan daftar saat halaman pertama kali dimuat
renderShoppingList();
