const items = {
    "clothesA": { name: "Short Sleeve Shirt", price: 25, discount: 10, quantity: 0, image: "images/clothesA.jpg" },
    "clothesB": { name: "Cotton Casual Loose Long Sleeve", price: 38, discount: 15, quantity: 0, image: "images/clothesB.jpg" },
    "pantsC": { name: "Casual Pants", price: 30, discount: 5, quantity: 0, image: "images/pantsC.jpg" },
    "pantsD": { name: "Cargo Pants", price: 20, discount: 8, quantity: 0, image: "images/pantsD.jpg" },
    "comboE": { name: "Versatile V-Neck Long Sleeve Two Piece Set", price: 80, discount: 20, quantity: 0, image: "images/comboE.jpg" }
};

let selectedItems = [];
const fixedDiscount = 5;  // Fixed 5% discount

window.onload = function() {
    // Generate initial content
    const itemContainer = document.getElementById('item-details');
    let content = `
        <center><h2>TapNWear Shopping Cart</h2></center>
        <div class="item-selection">
            <select id="item-selector">
                <option value="">Select an item...</option>
                ${Object.entries(items).map(([key, item]) => 
                    `<option value="${key}">${item.name} - RM${item.price} (${fixedDiscount}% off)</option>`
                ).join('')}
            </select>
            <button class="add-item-btn" onclick="addSelectedItem()">Add Item</button>
        </div>
        <div id="items-list"></div>
        <div class="cart-summary">
            <h3>Cart Summary</h3>
            <p>Total Items: <span id="total-items">0</span></p>
            <p>Total Price: RM<span id="total-price">0.00</span></p>
        </div>
        <center><button onclick="showPaymentOptions()" id="checkout-btn" disabled>Proceed to Payment</button>
        <div id="payment-options" class="hidden">
            <h3>Select Payment Method</h3>
            <button onclick="processPayment('Card')">Credit/Debit Card</button>
            <button onclick="processPayment('Online Banking')">Online Banking</button>
        </div></center>
    `;
    itemContainer.innerHTML = content;

    // Check for item parameter in URL and add to cart if present
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item');
    if (itemId) {
        addItemToCart(itemId);
    }
};

function addItemToCart(selectedKey) {
    const itemsList = document.getElementById('items-list');
    const item = items[selectedKey];

    if (!selectedItems.includes(selectedKey)) {
        selectedItems.push(selectedKey);
        const discountedPrice = item.price * (1 - fixedDiscount / 100);

        const itemHtml = `
            <div class="item-card" id="card-${selectedKey}">
                <img src="${item.image}" alt="${item.name}" style="width: 100px; height: auto; border-radius: 8px;">
                <h3>${item.name}</h3>
                <p>Original Price: RM${item.price.toFixed(2)}</p>
                <p>Discounted Price: RM${discountedPrice.toFixed(2)} (${fixedDiscount}% off)</p>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity('${selectedKey}', -1)">-</button>
                    <span id="quantity-${selectedKey}">0</span>
                    <button class="quantity-btn" onclick="updateQuantity('${selectedKey}', 1)">+</button>
                </div>
            </div>
        `;
        itemsList.insertAdjacentHTML('beforeend', itemHtml);
        updateQuantity(selectedKey, 1);  // Set initial quantity to 1
    }
}

function addSelectedItem() {
    const selector = document.getElementById('item-selector');
    const selectedKey = selector.value;

    if (!selectedKey) {
        alert('Please select an item');
        return;
    }

    addItemToCart(selectedKey);
    selector.value = '';  // Reset selector
}

function updateQuantity(itemKey, change) {
    const currentQuantity = items[itemKey].quantity;
    const newQuantity = Math.max(0, currentQuantity + change);

    items[itemKey].quantity = newQuantity;
    document.getElementById(`quantity-${itemKey}`).textContent = newQuantity;

    updateCartSummary();
}

function updateCartSummary() {
    let totalItems = 0;
    let totalPrice = 0;

    selectedItems.forEach(itemKey => {
        const item = items[itemKey];
        const discountedPrice = item.price * (1 - fixedDiscount / 100);
        totalItems += item.quantity;
        totalPrice += discountedPrice * item.quantity;
    });

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);

    document.getElementById('checkout-btn').disabled = totalItems === 0;
}

function showPaymentOptions() {
    document.getElementById('payment-options').classList.remove('hidden');
}

function processPayment(method) {
    const paymentData = {
        items: selectedItems.map(itemKey => {
            const item = items[itemKey];
            const discountedPrice = item.price * (1 - fixedDiscount / 100);
            return {
                name: item.name,
                originalPrice: item.price.toFixed(2),
                discount: fixedDiscount,
                finalPrice: (discountedPrice * item.quantity).toFixed(2),
                quantity: item.quantity
                
            };
        }),
        paymentMethod: method,
        date: new Date().toLocaleDateString()
    };

    // Calculate total price before discount
    const totalBeforeDiscount = selectedItems.reduce((total, itemKey) => {
        const item = items[itemKey];
        return total + (item.price * item.quantity);
    }, 0);

    // Calculate discount amount
    const discountAmount = totalBeforeDiscount * (fixedDiscount / 100);

    // Add total price and discount amount to paymentData
    paymentData.totalPrice = (totalBeforeDiscount - discountAmount).toFixed(2);
    paymentData.discountAmount = discountAmount.toFixed(2); // Store discount amount

    // Store payment data in localStorage for QR code generation
    localStorage.setItem('paymentData', JSON.stringify(paymentData));

    // Redirect to receipt page
    window.location.href = 'receipt.html';
}

// Populate receipt details
const qrData = JSON.parse(localStorage.getItem('paymentData')); // Ensure this line is present
document.getElementById('receipt-date').textContent = qrData.date;
document.getElementById('payment-method').textContent = qrData.paymentMethod;

const itemsPurchased = document.getElementById('items-purchased');
let totalOriginalPrice = 0; // To calculate total original price
qrData.items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.name}: <span style="text-decoration: line-through;">RM${item.originalPrice}</span> - RM${item.finalPrice} (${item.discount}%)`;
    itemsPurchased.appendChild(li);
    totalOriginalPrice += parseFloat(item.originalPrice) * item.quantity; // Accumulate original price
});

// Display discount information
const discountInfo = document.getElementById('discount-info');
discountInfo.innerHTML = `Original Total: <span style="text-decoration: line-through;">RM${totalOriginalPrice.toFixed(2)}</span> - RM${qrData.totalPrice} (${qrData.discountAmount} discount)`;
document.getElementById('total-price').textContent = `RM${qrData.totalPrice}`;

function redirectToReceipt(items, paymentMethod) {
    // items should be an array of objects like:
    // [{name: "Shirt", quantity: 2, price: 25.00}, {name: "Pants", quantity: 1, price: 45.00}]
    
    const originalTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 5; // 5% discount
    const finalTotal = originalTotal * (1 - discount/100);
    
    const params = new URLSearchParams({
        items: JSON.stringify(items),
        originalTotal: originalTotal.toFixed(2),
        discount: discount,
        finalTotal: finalTotal.toFixed(2),
        paymentMethod: paymentMethod || 'Online Banking',
        date: new Date().toLocaleDateString()
    });

    window.location.href = `receipt.html?${params.toString()}`;
}


