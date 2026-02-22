// Common JavaScript Functions

// Flash message auto-hide
document.addEventListener('DOMContentLoaded', function () {
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('[class*="bg-green-100"], [class*="bg-red-100"]');
    flashMessages.forEach(function (msg) {
        setTimeout(function () {
            msg.style.transition = 'opacity 0.5s ease-out';
            msg.style.opacity = '0';
            setTimeout(function () {
                msg.remove();
            }, 500);
        }, 5000);
    });
});

// Confirm delete
function confirmDelete(message) {
    return confirm(message || 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?');
}

// Format date to Thai
function formatDateThai(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Bangkok'
    };
    return date.toLocaleDateString('th-TH', options);
}

// Format time to Thai
function formatTimeThai(dateString) {
    const date = new Date(dateString);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    };
    return date.toLocaleTimeString('th-TH', options);
}
