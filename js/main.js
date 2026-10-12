/* =========================================
   Dynamic Classroom - Main JavaScript
   কাজ: নেভিগেশন, হ্যামবার্গার মেনু, নোটিশ লোড, স্মুথ স্ক্রল
   ========================================= */

// ===== হ্যামবার্গার মেনু টগল =====
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // মেনু লিংকে ক্লিক করলে মেনু বন্ধ হবে
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // ===== স্মুথ স্ক্রল (Navbar লিংকের জন্য) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80; // Navbar এর উচ্চতা
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== নোটিশ বোর্ড লোড করা (হোম পেজে) =====
    loadNoticesOnHomePage();

    // ===== ক্লাস কার্ডে ক্লিক করলে =====
    document.querySelectorAll('.class-card[data-class]').forEach(card => {
        card.addEventListener('click', function () {
            const classNum = this.getAttribute('data-class');
            alert(`শ্রেণী ${classNum} - বিস্তারিত জানতে লগইন করুন বা আমাদের সাথে যোগাযোগ করুন।`);
        });
    });

    // ===== স্ক্রল এ navbar shadow =====
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // ===== ফেড-ইন এনিমেশন (যখন স্ক্রল করবে) =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // যেসব এলিমেন্টে এনিমেশন হবে
    const animatedElements = document.querySelectorAll(
        '.feature-card, .class-card, .contact-card, .founder-card, .notice-item'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== হোম পেজে নোটিশ লোড =====
function loadNoticesOnHomePage() {
    const noticeBoard = document.getElementById('noticeBoard');
    if (!noticeBoard) return; // হোম পেজে না থাকলে কিছু করবে না

    // LocalStorage থেকে নোটিশ নিন
    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');

    if (notices.length === 0) {
        // কিছু নোটিশ না থাকলে ডিফল্ট দেখাবে
        return;
    }

    // আপডেট নোটিশ বোর্ড
    noticeBoard.innerHTML = '';

    // সর্বশেষ ৪টি নোটিশ দেখাবে
    notices.slice(0, 4).forEach(notice => {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'notice-item' + (notice.urgent ? ' urgent' : '');

        noticeDiv.innerHTML = `
            <span class="notice-badge">${notice.urgent ? 'জরুরি' : 'নোটিশ'}</span>
            <h4>${escapeHtml(notice.title)}</h4>
            <p>${escapeHtml(notice.body)}</p>
            <small style="color: #94a3b8; margin-top: 8px; display: block;">
                ${notice.date || ''}
            </small>
        `;

        noticeBoard.appendChild(noticeDiv);
    });
}

// ===== HTML Escape (নিরাপত্তার জন্য) =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== সংখ্যা রূপান্তর (ইংরেজি থেকে বাংলা) =====
function toBanglaNumber(num) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => {
        return banglaDigits[parseInt(digit)] || digit;
    }).join('');
}

// ===== নোটিফিকেশন দেখানো =====
function showNotification(message, type = 'success') {
    // পুরনো নোটিফিকেশন সরান
    const oldNotif = document.querySelector('.dc-notification');
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement('div');
    notif.className = 'dc-notification';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-family: 'Hind Siliguri', sans-serif;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    // ৩ সেকেন্ড পর সরান
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== Animation CSS যোগ করা =====
(function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();

// ===== পেজ লোড হওয়ার সময় কনসোল মেসেজ =====
console.log('%c Dynamic Classroom ', 'background: #2563eb; color: white; font-size: 16px; padding: 5px 10px; border-radius: 5px;');
console.log('%c শিক্ষার্থীদের সাফল্যের পথে ', 'color: #f59e0b; font-size: 12px;');
