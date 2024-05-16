// script.js

document.addEventListener('DOMContentLoaded', function() {
    const paymentList = document.getElementById('payment-list');
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

    payPoints.forEach(payPoint => {
        const rowHTML = createPaymentRow(payPoint);
        paymentList.insertAdjacentHTML('beforeend', rowHTML);
    });

    paymentList.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('payment-header') || target.classList.contains('expand-button')) {
            const row = target.closest('.payment-row');
            const details = row.querySelector('.payment-details');
            const expandButton = row.querySelector('.expand-button');
            if (details) {
                const isVisible = details.style.display === 'block';
                details.style.display = isVisible ? 'none' : 'block';
                if (expandButton) {
                    expandButton.textContent = isVisible ? '▼' : '▲';
                }
            }
        } else if (target.classList.contains('payment-method')) {
            const value = target.dataset.value;
            const row = target.closest('.payment-row');
            const defaultMethodSpan = row.querySelector('.default-method');
            defaultMethodSpan.textContent = value;
            navigator.clipboard.writeText(value).then(() => {
                alert(`Copied: ${value}`);
            });
        }
    });
});
