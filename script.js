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
        
        // Menggunakan struktur yang sama dengan item-line-print untuk konsistensi
        // Walaupun belum ada CSS print yang spesifik untuk .item-line-print di versi paling awal ini,
        // struktur ini penting untuk pengembangan selanjutnya.
        listItem.innerHTML = `
            <div class="item-line-print">
                <span>${item.name}</span> 
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

// Fungsi untuk menghapus item
function removeItem(index) {
    shoppingItems.splice(index, 1); // Hapus item dari array
    renderShoppingList(); // Perbarui tampilan
}

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

    let message = "";

    // 1. Header WhatsApp
    message += "HARINFOOD\n"; 
    message += "Daftar Belanja\n";
    
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const printDate = now.toLocaleDateString('id-ID', options);
    message += `Tanggal: ${printDate}\n`;
    message += "-----------------------------------\n";

    // 2. List Belanjaan WhatsApp
    shoppingItems.forEach((item) => {
        message += `${item.name} - ${item.quantity} ${item.unit}\n`;
    });
    
    // 3. Footer WhatsApp
    message += "-----------------------------------\n";
    message += "Terima Kasih!\n";
    message += "Dibuat oleh Aplikasi Harinfood\n";

    // Nomor WhatsApp tujuan yang sudah ditentukan
    const rawWhatsappNumber = "081235368643";
    let targetWhatsappNumber = rawWhatsappNumber.replace(/\D/g, ''); 

    if (targetWhatsappNumber.startsWith('0')) {
        targetWhatsappNumber = '62' + targetWhatsappNumber.substring(1);
    } else if (!targetWhatsappNumber.startsWith('62') && targetWhatsappNumber.length > 5) {
        targetWhatsappNumber = '62' + targetWhatsappNumber;
    }
    
    if (!targetWhatsappNumber || targetWhatsappNumber.length < 9) {
        alert("Nomor WhatsApp tidak valid. Pengiriman dibatalkan.");
        return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetWhatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
});

// Inisialisasi tampilan daftar saat halaman pertama kali dimuat
renderShoppingList();
