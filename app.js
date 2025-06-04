// DOM Elements
const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemsList = document.getElementById('itemsList');
const clearAllBtn = document.getElementById('clearAllBtn');
const completeTripBtn = document.getElementById('completeTripBtn');
const receiptModal = document.getElementById('receiptModal');
const closeModal = document.querySelector('.close');
const saveTripBtn = document.getElementById('saveTripBtn');
const tripTitle = document.getElementById('tripTitle');
const receiptUpload = document.getElementById('receiptUpload');
const imagePreview = document.getElementById('imagePreview');
const tripsList = document.getElementById('tripsList');

// State
let items = JSON.parse(localStorage.getItem('shoppingItems')) || [];
let receiptImage = null;

// Initialize the app
function init() {
    renderItems();
    loadCompletedTrips();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Add item
    addBtn.addEventListener('click', addItem);
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Clear all items
    clearAllBtn.addEventListener('click', clearAllItems);

    // Complete trip
    completeTripBtn.addEventListener('click', () => {
        if (items.length === 0) {
            alert('Your shopping list is empty!');
            return;
        }
        receiptModal.style.display = 'flex';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        receiptModal.style.display = 'none';
        resetReceiptForm();
    });

    // Save trip
    saveTripBtn.addEventListener('click', saveTrip);

    // Handle receipt upload
    receiptUpload.addEventListener('change', handleReceiptUpload);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
            receiptModal.style.display = 'none';
            resetReceiptForm();
        }
    });
}

// Add a new item to the list
function addItem() {
    const itemText = itemInput.value.trim();
    if (itemText === '') return;

    const newItem = {
        id: Date.now(),
        text: itemText,
        inCart: false
    };

    items.push(newItem);
    saveItems();
    renderItems();
    
    // Clear input and focus
    itemInput.value = '';
    itemInput.focus();
}

// Render all items
function renderItems() {
    if (items.length === 0) {
        itemsList.innerHTML = '<p class="empty-message">Your shopping list is empty. Add some items to get started!</p>';
        return;
    }

    itemsList.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `item ${item.inCart ? 'in-cart' : ''}`;
        itemElement.innerHTML = `
            <span class="item-text">${item.inCart ? 'Put in Cart ✅' : item.text}</span>
            <div class="item-actions">
                <button class="edit-btn" aria-label="Edit item">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" aria-label="Delete item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Toggle item in cart - handle both click and touch events
        const handleItemTap = (e) => {
            // Prevent default to avoid any unwanted behaviors
            e.preventDefault();
            e.stopPropagation();
            
            // Only toggle if not clicking on action buttons
            if (!e.target.closest('.item-actions')) {
                toggleItemInCart(item.id);
            }
        };
        
        // Add both click and touch events
        itemElement.addEventListener('click', handleItemTap);
        itemElement.addEventListener('touchend', handleItemTap, { passive: true });

        // Edit button
        const editBtn = itemElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editItem(item.id);
        });

        // Delete button
        const deleteBtn = itemElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(item.id);
        });

        itemsList.appendChild(itemElement);
    });
}

// Toggle item in cart
function toggleItemInCart(id) {
    items = items.map(item => {
        if (item.id === id) {
            return { ...item, inCart: !item.inCart };
        }
        return item;
    });
    saveItems();
    renderItems();
}

// Edit item
function editItem(id) {
    const item = items.find(item => item.id === id);
    if (!item) return;

    const newText = prompt('Edit item:', item.text);
    if (newText === null || newText.trim() === '') return;

    items = items.map(item => {
        if (item.id === id) {
            return { ...item, text: newText.trim() };
        }
        return item;
    });
    
    saveItems();
    renderItems();
}

// Delete item
function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    items = items.filter(item => item.id !== id);
    saveItems();
    renderItems();
}

// Clear all items
function clearAllItems() {
    if (items.length === 0) return;
    
    if (confirm('Are you sure you want to clear all items?')) {
        items = [];
        saveItems();
        renderItems();
    }
}

// Handle receipt upload
function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        receiptImage = e.target.result;
        imagePreview.innerHTML = `
            <p>Receipt Preview:</p>
            <img src="${receiptImage}" alt="Receipt preview">
        `;
    };
    reader.readAsDataURL(file);
}

// Save trip
function saveTrip() {
    const trip = {
        id: Date.now(),
        title: tripTitle.value.trim() || 'Shopping Trip',
        date: new Date().toISOString(),
        items: [...items],
        receipt: receiptImage
    };

    // Save to local storage
    const trips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
    trips.unshift(trip);
    localStorage.setItem('completedTrips', JSON.stringify(trips));

    // Clear current list
    items = [];
    saveItems();
    renderItems();

    // Close modal and reset form
    receiptModal.style.display = 'none';
    resetReceiptForm();

    // Reload completed trips
    loadCompletedTrips();
}

// Load completed trips
function loadCompletedTrips() {
    const trips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
    
    if (trips.length === 0) {
        tripsList.innerHTML = '<p>No completed trips yet.</p>';
        return;
    }

    tripsList.innerHTML = trips.map(trip => {
        const date = new Date(trip.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="trip-card">
                <h3>${trip.title}</h3>
                <div class="trip-date">${date}</div>
                <div class="trip-items">
                    <strong>Items (${trip.items.length}):</strong>
                    <ul>
                        ${trip.items.slice(0, 3).map(item => 
                            `<li>${item.inCart ? '✅' : '⬜'} ${item.text}</li>`
                        ).join('')}
                        ${trip.items.length > 3 ? '<li>...</li>' : ''}
                    </ul>
                </div>
                ${trip.receipt ? `
                    <div class="trip-receipt" onclick="viewReceipt('${trip.id}')">
                        <p><i class="fas fa-receipt"></i> View Receipt</p>
                        <img src="${trip.receipt}" alt="Receipt">
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// View receipt in full screen
window.viewReceipt = function(tripId) {
    const trips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
    const trip = trips.find(t => t.id === parseInt(tripId));
    
    if (!trip || !trip.receipt) return;
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    modal.style.cursor = 'zoom-out';
    
    const img = document.createElement('img');
    img.src = trip.receipt;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
};

// Reset receipt form
function resetReceiptForm() {
    tripTitle.value = '';
    receiptUpload.value = '';
    imagePreview.innerHTML = '';
    receiptImage = null;
}

// Save items to local storage
function saveItems() {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
