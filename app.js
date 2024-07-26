document.addEventListener('DOMContentLoaded', function() {
    const paymentList = document.getElementById('payment-list');
    const paymentMethodForm = document.getElementById('payment-method-form');
    const methodSelect = document.getElementById('method');
    const valueInput = document.getElementById('value');
    const saveButton = document.getElementById('save');
    let userLat, userLon;
    let payPoints = JSON.parse(localStorage.getItem('PayPoints')) || [];

    function createPaymentRow(payPoint) {
        const defaultMethod = payPoint.paymentMethods[0];

        const rowHTML = `
            <div class="payment-row">
                <div class="payment-header">
                    <span class="default-method">${defaultMethod.value}</span>
                </div>
                <span class="trash-icon">🗑️</span>
            </div>
        `;

        return rowHTML;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon1 - lon2) * Math.PI / 180;

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
        if (nearbyPayPoints.length === 0) {
            document.getElementById('empty-list-description').style.display = 'block';
        } else {
            document.getElementById('empty-list-description').style.display = 'none';
            nearbyPayPoints.forEach((payPoint) => {
                const rowHTML = createPaymentRow(payPoint);
                paymentList.insertAdjacentHTML('beforeend', rowHTML);
            });
        }
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
        const paymentRow = target.closest('.payment-row');
        const defaultMethodSpan = paymentRow.querySelector('.default-method');
        const valueToDelete = defaultMethodSpan.textContent.trim();

        if (target.classList.contains('trash-icon')) {
            payPoints = payPoints.filter(payPoint => {
                return payPoint.paymentMethods[0].value.trim() !== valueToDelete;
            });
            localStorage.setItem('PayPoints', JSON.stringify(payPoints));
            loadPayPoints(userLat, userLon);
        } else if (target.closest('.payment-row')) {
            const value = defaultMethodSpan.textContent.replace(/[^\w]/g, ''); // Remove special characters
            navigator.clipboard.writeText(value).then(() => {
                alert(`Copied: ${value}`);
            });
        }
    });

    methodSelect.addEventListener('change', function() {
        const selectedMethod = methodSelect.value;
        if (selectedMethod === 'phone') {
            valueInput.type = 'number';
            valueInput.setAttribute('inputmode', 'numeric'); // Set inputmode to numeric for phone
            valueInput.placeholder = 'Enter phone number';
            valueInput.pattern = '\\d*'; // Ensures only digits can be entered
        } else if (selectedMethod === 'account') {
            valueInput.type = 'number';
            valueInput.setAttribute('inputmode', 'numeric');
            valueInput.placeholder = 'Enter digits only';
            valueInput.pattern = '\\d*'; // Ensures only digits can be entered
        } else {
            valueInput.type = 'text';
            valueInput.removeAttribute('inputmode');
            valueInput.placeholder = 'Enter value';
            valueInput.removeAttribute('pattern');
        }
    });

    saveButton.addEventListener('click', function(event) {
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
            
            // Reset to default selection
            paymentMethodForm.reset();
            methodSelect.value = 'phone';
            valueInput.type = 'number';
            valueInput.setAttribute('inputmode', 'numeric');
            valueInput.placeholder = 'Enter phone number';
            valueInput.pattern = '\\d*';

        } else {
            alert("Unable to detect current location. Please try again.");
        }
    });
});
