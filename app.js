// script.js

document.addEventListener('DOMContentLoaded', function() {
    const paymentList = document.getElementById('payment-list');
    const paymentMethodForm = document.getElementById('payment-method-form');
    const methodSelect = document.getElementById('method');
    const valueInput = document.getElementById('value');
    let userLat, userLon;
    const payPoints = JSON.parse(localStorage.getItem('PayPoints')) || [];

    function createPaymentRow(payPoint) {
        const defaultMethod = payPoint.paymentMethods[0];

        const paymentMethodsHTML = payPoint.paymentMethods.length > 1 ? payPoint.paymentMethods.map(method => `
            <div class="payment-method" data-value="${method.value}">
                ${method.method.toUpperCase()}: ${method.value}
            </div>
        `).join('') : '';

        const expandButtonHTML = payPoint.paymentMethods.length > 1 ? `<button class="expand-button">▼</button>` : '';

        const rowHTML = `
            <div class="payment-row">
                <div class="payment-header">
                    <span class="default-method">${defaultMethod.value}</span>
                    ${expandButtonHTML}
                </div>
                ${paymentMethodsHTML ? `<div class="payment-details">${paymentMethodsHTML}</div>` : ''}
            </div>
        `;

        return rowHTML;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in meters
        return distance;
    }

    function filterNearbyPayPoints(payPoints, userLat, userLon) {
        return payPoints.filter(payPoint => {
            const { lattitude, longitude } = payPoint.location;
            const distance = calculateDistance(userLat, userLon, lattitude, longitude);
            return distance <= 30; // Filter for pay points within 30 meters
        });
    }

    function loadPayPoints(userLat, userLon) {
        const nearbyPayPoints = filterNearbyPayPoints(payPoints, userLat, userLon);

        paymentList.innerHTML = '';
        nearbyPayPoints.forEach(payPoint => {
            const rowHTML = createPaymentRow(payPoint);
            paymentList.insertAdjacentHTML('beforeend', rowHTML);
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLat = position.coords.latitude;
            userLon = position.coords.longitude;
            loadPayPoints(userLat, userLon);
        }, error => {
            console.error("Error obtaining location", error);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    paymentList.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('expand-button')) {
            const row = target.closest('.payment-row');
            const details = row.querySelector('.payment-details');
            const isVisible = details.style.display === 'block';
            details.style.display = isVisible ? 'none' : 'block';
            target.textContent = isVisible ? '▼' : '▲';
        } else if (target.classList.contains('payment-method')) {
            const value = target.dataset.value.replace(/[^\w]/g, ''); // Remove special characters
            const row = target.closest('.payment-row');
            const defaultMethodSpan = row.querySelector('.default-method');
            defaultMethodSpan.textContent = value;
            navigator.clipboard.writeText(value).then(() => {
                alert(`Copied: ${value}`);
            });
        } else if (target.closest('.payment-row')) {
            const row = target.closest('.payment-row');
            const defaultMethodSpan = row.querySelector('.default-method');
            const value = defaultMethodSpan.textContent.replace(/[^\w]/g, ''); // Remove special characters
            navigator.clipboard.writeText(value).then(() => {
                alert(`Copied: ${value}`);
            });
        }
    });

    methodSelect.addEventListener('change', function() {
        const selectedMethod = methodSelect.value;
        if (selectedMethod === 'phone' || selectedMethod === 'account') {
            valueInput.type = 'tel';
            valueInput.placeholder = 'Enter digits only';
            valueInput.pattern = '[0-9]*'; // Ensures only digits can be entered
        } else {
            valueInput.type = 'text';
            valueInput.placeholder = 'Enter value';
            valueInput.removeAttribute('pattern'); // Remove the pattern attribute
        }
    });

    paymentMethodForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const method = paymentMethodForm.method.value;
        const value = paymentMethodForm.value.value;

        if (userLat !== undefined && userLon !== undefined) {
            const newPayPoint = {
                paymentMethods: [
                    { method, value }
                ],
                location: {
                    lattitude: userLat,
                    longitude: userLon
                },
                description: `New Payment Point`
            };

            payPoints.push(newPayPoint);
            localStorage.setItem('PayPoints', JSON.stringify(payPoints));
            loadPayPoints(userLat, userLon);
            paymentMethodForm.reset();
            methodSelect.value = 'phone'; // Reset to default selection
            valueInput.type = 'tel';
            valueInput.placeholder = 'Enter digits only';
            valueInput.pattern = '[0-9]*';
        } else {
            alert("Unable to detect current location. Please try again.");
        }
    });

    // Set the initial input type based on the default selection
    if (methodSelect.value === 'phone' || methodSelect.value === 'account') {
        valueInput.type = 'tel';
        valueInput.placeholder = 'Enter digits only';
        valueInput.pattern = '[0-9]*';
    } else {
        valueInput.type = 'text';
        valueInput.placeholder = 'Enter value';
    }
});
