document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const medicineTableBody = document.getElementById('medicineTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Modals
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    const addMedicineBtn = document.getElementById('addMedicineBtn');
    const closeAddModal = document.getElementById('closeAddModal');
    const closeEditModal = document.getElementById('closeEditModal');
    
    // Forms
    const addMedicineForm = document.getElementById('addMedicineForm');
    const editMedicineForm = document.getElementById('editMedicineForm');
    
    // State
    let currentMedicines = [];

    // Initial Load
    fetchMedicines();

    // Event Listeners
    searchBtn.addEventListener('click', () => fetchMedicines(searchInput.value));
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchMedicines(searchInput.value); });
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchMedicines();
    });

    addMedicineBtn.addEventListener('click', () => openModal(addModal));
    closeAddModal.addEventListener('click', () => closeModal(addModal));
    closeEditModal.addEventListener('click', () => closeModal(editModal));

    addMedicineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newMedicine = {
            fullName: document.getElementById('fullName').value,
            brand: document.getElementById('brand').value,
            notes: document.getElementById('notes').value,
            expiryDate: document.getElementById('expiryDate').value,
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value)
        };

        try {
            const resp = await fetch('/api/medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMedicine)
            });

            if (resp.ok) {
                closeModal(addModal);
                addMedicineForm.reset();
                fetchMedicines();
            } else {
                alert('Failed to add medicine');
            }
        } catch (error) {
            console.error('Error adding medicine', error);
        }
    });

    editMedicineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const updatedMedicine = {
            id: id,
            fullName: document.getElementById('editFullName').value,
            brand: document.getElementById('editBrand').value,
            notes: document.getElementById('editNotes').value,
            expiryDate: document.getElementById('editExpiryDate').value,
            quantity: parseInt(document.getElementById('editQuantity').value),
            price: parseFloat(document.getElementById('editPrice').value)
        };

        try {
            const resp = await fetch(`/api/medicine/${id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMedicine)
            });
            
            if (resp.ok) {
                closeModal(editModal);
                editMedicineForm.reset();
                fetchMedicines();
            } else {
                const data = await resp.text();
                alert(`Edit failed: ${data}`);
            }
        } catch (error) {
            console.error('Error editing medicine', error);
        }
    });

    // Functions
    async function fetchMedicines(searchQuery = '') {
        try {
            let url = '/api/medicine';
            if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
            
            const resp = await fetch(url);
            const data = await resp.json();
            
            currentMedicines = data;
            renderTable(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            medicineTableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            emptyState.textContent = 'Error loading data from the server.';
        }
    }

    function renderTable(medicines) {
        medicineTableBody.innerHTML = '';
        
        if (medicines.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');

        medicines.forEach(med => {
            const tr = document.createElement('tr');
            
            // Check Conditions
            const expiry = new Date(med.expiryDate);
            const today = new Date();
            const daysToExpiry = (expiry - today) / (1000 * 60 * 60 * 24);

            if (daysToExpiry < 30) {
                tr.style.backgroundColor = 'red';
            } else if (med.quantity < 10) {
                tr.style.backgroundColor = 'yellow';
                tr.style.color = 'black';
            } else if (expiry > today) {
                tr.style.backgroundColor = 'black';
            }

            tr.innerHTML = `
                <td><strong>${med.fullName}</strong></td>
                <td>${med.brand}</td>
                <td>${med.notes || '-'}</td>
                <td>${expiry.toLocaleDateString()}</td>
                <td><strong style="color: ${med.quantity < 10 ? 'var(--warning)' : 'inherit'}">${med.quantity}</strong></td>
                <td>$${med.price.toFixed(2)}</td>
                <td>
                    <button class="btn success-btn action-btn" onclick="openEditModal('${med.id}')">Edit</button>
                </td>
            `;

            medicineTableBody.appendChild(tr);
        });
    }

    function openModal(modal) {
        modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    window.openEditModal = function(id) {
        const med = currentMedicines.find(m => m.id === id);
        if (!med) return;
        
        document.getElementById('editId').value = med.id;
        document.getElementById('editFullName').value = med.fullName;
        document.getElementById('editBrand').value = med.brand;
        document.getElementById('editNotes').value = med.notes;
        // Format date to YYYY-MM-DD for input type="date"
        document.getElementById('editExpiryDate').value = med.expiryDate.split('T')[0];
        document.getElementById('editQuantity').value = med.quantity;
        document.getElementById('editPrice').value = med.price;
        
        openModal(editModal);
    };
});
