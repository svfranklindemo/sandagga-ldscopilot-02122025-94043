// Create and manage loader
export const showLoader = () => {
    const loader = document.createElement('div');
    loader.id = 'upload-loader';
    loader.innerHTML = `
        <div class="loader-overlay">
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Uploading assets...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
};

export const hideLoader = () => {
    const loader = document.getElementById('upload-loader');
    if (loader) {
        loader.remove();
    }
};

// Create and manage popup
export const showPopup = (message, type = 'success', autoClose = true) => {
    const popup = document.createElement('div');
    popup.id = 'status-popup';
    popup.innerHTML = `
        <div class="popup-overlay">
            <div class="popup-content ${type}">
                <div class="popup-header">
                    <h3>${type === 'success' ? 'Success' : 'Notice'}</h3>
                    <button class="close-popup">&times;</button>
                </div>
                <div class="popup-body">
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Add close button functionality
    const closeBtn = popup.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => {
        popup.remove();
    });

    // Auto-close after 5 seconds only if autoClose is true
    if (autoClose) {
        setTimeout(() => {
            if (popup && document.body.contains(popup)) {
                popup.remove();
            }
        }, 5000);
    }
}; 