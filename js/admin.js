/* =========================================
   Dynamic Classroom - Admin JavaScript
   কাজ: এডমিন লগইন, ড্যাশবোর্ড, শিক্ষার্থী ব্যবস্থাপনা,
        নোটিশ তৈরি, সেটিংস
   ========================================= */

// ===== ডিফল্ট এডমিন তথ্য =====
// ⚠️ এখানে আপনার আসল ইমেইল ও পাসওয়ার্ড বসান
const DEFAULT_ADMIN = {
    email: 'admin@dynamic.com',
    password: 'admin1234',
    name: 'এডমিন'
};

// ===== ডিফল্ট ডেটা সেটআপ =====
function initDefaultData() {
    // এডমিন তথ্য না থাকলে তৈরি করুন
    if (!localStorage.getItem('dc_admin')) {
        localStorage.setItem('dc_admin', JSON.stringify(DEFAULT_ADMIN));
    }

    // শিক্ষার্থী ডেটা না থাকলে ডেমো ডেটা দিন
    if (!localStorage.getItem('dc_students')) {
        const demoStudents = [
            { name: 'রাহুল আহমেদ', roll: '101', pin: '1234', class: '10' },
            { name: 'সাদিয়া ইসলাম', roll: '102', pin: '1234', class: '9' },
            { name: 'তানভীর হোসেন', roll: '103', pin: '1234', class: '8' }
        ];
        localStorage.setItem('dc_students', JSON.stringify(demoStudents));
    }

    // নোটিশ না থাকলে ডিফল্ট নোটিশ দিন
    if (!localStorage.getItem('dc_notices')) {
        const demoNotices = [
            {
                title: 'ছুটি',
                body: 'আগামীকাল কোচিং বন্ধ থাকবে',
                urgent: true,
                date: new Date().toLocaleDateString('bn-BD')
            },
            {
                title: 'Dynamic Classroom-এ স্বাগতম',
                body: 'নতুন ব্যাচ শুরু হয়েছে, ভর্তি চলছে।',
                urgent: false,
                date: new Date().toLocaleDateString('bn-BD')
            }
        ];
        localStorage.setItem('dc_notices', JSON.stringify(demoNotices));
    }
}

// ===== লগইন পেজ লজিক =====
function initLoginPage() {
    const loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const errorEl = document.getElementById('adminError');

        const admin = JSON.parse(localStorage.getItem('dc_admin') || '{}');

        if (email === admin.email && password === admin.password) {
            // লগইন সফল
            localStorage.setItem('dc_admin_logged_in', 'true');
            localStorage.setItem('dc_admin_name', admin.name || 'এডমিন');
            errorEl.style.color = '#10b981';
            errorEl.textContent = '✓ লগইন সফল! ড্যাশবোর্ডে যাচ্ছেন...';
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 800);
        } else {
            // লগইন ব্যর্থ
            errorEl.style.color = '#ef4444';
            errorEl.textContent = '✗ ইমেইল বা পাসওয়ার্ড ভুল!';
            document.getElementById('adminPassword').value = '';
        }
    });
}

// ===== লগইন চেক =====
function checkAdminLogin() {
    if (localStorage.getItem('dc_admin_logged_in') !== 'true') {
        window.location.href = 'admin.html';
    }
}

// ===== ড্যাশবোর্ড লজিক =====
function initDashboard() {
    // লগইন চেক
    checkAdminLogin();

    // এডমিন নাম দেখান
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = localStorage.getItem('dc_admin_name') || 'এডমিন';
    }

    // লগআউট বাটন
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('আপনি কি লগআউট করতে চান?')) {
                localStorage.removeItem('dc_admin_logged_in');
                localStorage.removeItem('dc_admin_name');
                window.location.href = 'admin.html';
            }
        });
    }

    // ট্যাব সুইচিং
    initTabs();

    // শিক্ষার্থী লোড
    loadStudents();

    // নোটিশ লোড
    loadNotices();

    // স্ট্যাটস আপডেট
    updateStats();

    // ফর্ম ইভেন্ট
    initStudentForm();
    initNoticeForm();
    initSettingsForm();

    // মডাল বন্ধ করার ইভেন্ট
    initModalClose();
}

// ===== ট্যাব সুইচিং =====
function initTabs() {
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('pageTitle');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // মেনু অ্যাক্টিভ
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');

            // কনটেন্ট সুইচ
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });

            // পেজ টাইটেল আপডেট
            if (pageTitle) {
                pageTitle.textContent = this.textContent.trim();
            }

            // ডেটা রিফ্রেশ
            if (tabId === 'students') loadStudents();
            if (tabId === 'notices') loadNotices();
            if (tabId === 'overview') updateStats();
        });
    });
}

// ===== স্ট্যাটস আপডেট =====
function updateStats() {
    const students = JSON.parse(localStorage.getItem('dc_students') || '[]');
    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');

    const totalStudentsEl = document.getElementById('totalStudents');
    const totalNoticesEl = document.getElementById('totalNotices');

    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (totalNoticesEl) totalNoticesEl.textContent = notices.length;
}

// ===== শিক্ষার্থী লোড =====
function loadStudents() {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    const students = JSON.parse(localStorage.getItem('dc_students') || '[]');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    এখনো কোনো শিক্ষার্থী যোগ করা হয়নি
                </td>
            </tr>
        `;
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.roll)}</td>
            <td>${escapeHtml(student.pin)}</td>
            <td>শ্রেণী ${escapeHtml(student.class)}</td>
            <td>
                <button class="action-btn" onclick="editStudent(${index})">
                    <i class="fas fa-edit"></i> এডিট
                </button>
                <button class="action-btn delete" onclick="deleteStudent(${index})">
                    <i class="fas fa-trash"></i> ডিলিট
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateStats();
}

// ===== শিক্ষার্থী ফর্ম =====
function initStudentForm() {
    const addBtn = document.getElementById('addStudentBtn');
    const form = document.getElementById('studentForm');

    if (addBtn) {
        addBtn.addEventListener('click', function () {
            openStudentModal();
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveStudent();
        });
    }
}

// ===== শিক্ষার্থী মডাল খোলা =====
function openStudentModal(index = null) {
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('studentModalTitle');

    if (index === null) {
        // নতুন
        title.textContent = 'নতুন শিক্ষার্থী যোগ করুন';
        document.getElementById('studentIndex').value = '';
        document.getElementById('studentName').value = '';
        document.getElementById('studentRoll').value = '';
        document.getElementById('studentPin').value = '';
        document.getElementById('studentClass').value = '6';
    } else {
        // এডিট
        const students = JSON.parse(localStorage.getItem('dc_students') || '[]');
        const student = students[index];
        title.textContent = 'শিক্ষার্থী এডিট করুন';
        document.getElementById('studentIndex').value = index;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentRoll').value = student.roll;
        document.getElementById('studentPin').value = student.pin;
        document.getElementById('studentClass').value = student.class;
    }

    modal.classList.add('active');
}

// ===== শিক্ষার্থী সেভ =====
function saveStudent() {
    const name = document.getElementById('studentName').value.trim();
    const roll = document.getElementById('studentRoll').value.trim();
    const pin = document.getElementById('studentPin').value.trim();
    const cls = document.getElementById('studentClass').value;
    const index = document.getElementById('studentIndex').value;

    // ভ্যালিডেশন
    if (!name || !roll || !pin) {
        showNotification('সব তথ্য পূরণ করুন!', 'error');
        return;
    }

    if (pin.length !== 4) {
        showNotification('পিন ৪ ডিজিটের হতে হবে!', 'error');
        return;
    }

    const students = JSON.parse(localStorage.getItem('dc_students') || '[]');

    // রোল ডুপ্লিকেট চেক
    const duplicate = students.find((s, i) =>
        s.roll === roll && i !== parseInt(index)
    );
    if (duplicate) {
        showNotification('এই রোল আগে থেকেই আছে!', 'error');
        return;
    }

    const studentData = { name, roll, pin, class: cls };

    if (index === '') {
        // নতুন
        students.push(studentData);
        showNotification('শিক্ষার্থী সফলভাবে যোগ হয়েছে!');
    } else {
        // এডিট
        students[parseInt(index)] = studentData;
        showNotification('শিক্ষার্থী আপডেট হয়েছে!');
    }

    localStorage.setItem('dc_students', JSON.stringify(students));
    closeModal('studentModal');
    loadStudents();
}

// ===== শিক্ষার্থী এডিট =====
function editStudent(index) {
    openStudentModal(index);
}

// ===== শিক্ষার্থী ডিলিট =====
function deleteStudent(index) {
    const students = JSON.parse(localStorage.getItem('dc_students') || '[]');
    const student = students[index];

    if (!confirm(`আপনি কি "${student.name}" কে ডিলিট করতে চান?`)) return;

    students.splice(index, 1);
    localStorage.setItem('dc_students', JSON.stringify(students));
    showNotification('শিক্ষার্থী ডিলিট হয়েছে!');
    loadStudents();
}

// ===== নোটিশ লোড =====
function loadNotices() {
    const noticesList = document.getElementById('noticesList');
    if (!noticesList) return;

    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');
    noticesList.innerHTML = '';

    if (notices.length === 0) {
        noticesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-bullhorn" style="font-size: 50px; margin-bottom: 15px; display: block;"></i>
                <p>এখনো কোনো নোটিশ নেই</p>
            </div>
        `;
        return;
    }

    notices.forEach((notice, index) => {
        const div = document.createElement('div');
        div.className = 'notice-item' + (notice.urgent ? ' urgent' : '');
        div.innerHTML = `
            <div>
                <span class="notice-badge">${notice.urgent ? 'জরুরি' : 'নোটিশ'}</span>
                <h4>${escapeHtml(notice.title)}</h4>
                <p>${escapeHtml(notice.body)}</p>
                <small style="color: #94a3b8;">${notice.date || ''}</small>
            </div>
            <div style="display: flex; gap: 5px; align-items: flex-start;">
                <button class="action-btn" onclick="toggleUrgent(${index})" title="জরুরি টগল">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
                <button class="action-btn delete" onclick="deleteNotice(${index})" title="ডিলিট">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        noticesList.appendChild(div);
    });

    updateStats();
}

// ===== নোটিশ ফর্ম =====
function initNoticeForm() {
    const addBtn = document.getElementById('addNoticeBtn');
    const form = document.getElementById('noticeForm');

    if (addBtn) {
        addBtn.addEventListener('click', function () {
            document.getElementById('noticeForm').reset();
            document.getElementById('noticeModal').classList.add('active');
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveNotice();
        });
    }
}

// ===== নোটিশ সেভ =====
function saveNotice() {
    const title = document.getElementById('noticeTitle').value.trim();
    const body = document.getElementById('noticeBody').value.trim();

    if (!title || !body) {
        showNotification('সব তথ্য পূরণ করুন!', 'error');
        return;
    }

    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');

    notices.unshift({
        title,
        body,
        urgent: false,
        date: new Date().toLocaleDateString('bn-BD')
    });

    localStorage.setItem('dc_notices', JSON.stringify(notices));
    closeModal('noticeModal');
    loadNotices();
    showNotification('নোটিশ সফলভাবে প্রকাশিত হয়েছে!');
}

// ===== নোটিশ ডিলিট =====
function deleteNotice(index) {
    if (!confirm('আপনি কি এই নোটিশটি ডিলিট করতে চান?')) return;

    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');
    notices.splice(index, 1);
    localStorage.setItem('dc_notices', JSON.stringify(notices));
    loadNotices();
    showNotification('নোটিশ ডিলিট হয়েছে!');
}

// ===== জরুরি টগল =====
function toggleUrgent(index) {
    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');
    notices[index].urgent = !notices[index].urgent;
    localStorage.setItem('dc_notices', JSON.stringify(notices));
    loadNotices();
    showNotification('নোটিশ আপডেট হয়েছে!');
}

// ===== সেটিংস ফর্ম =====
function initSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    // বর্তমান ইমেইল দেখান
    const admin = JSON.parse(localStorage.getItem('dc_admin') || '{}');
    const emailInput = document.getElementById('newAdminEmail');
    if (emailInput && admin.email) {
        emailInput.value = admin.email;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const newEmail = document.getElementById('newAdminEmail').value.trim();
        const newPassword = document.getElementById('newAdminPassword').value;

        if (!newEmail) {
            showNotification('ইমেইল দিন!', 'error');
            return;
        }

        const admin = JSON.parse(localStorage.getItem('dc_admin') || '{}');
        admin.email = newEmail;
        if (newPassword) {
            if (newPassword.length < 6) {
                showNotification('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!', 'error');
                return;
            }
            admin.password = newPassword;
        }

        localStorage.setItem('dc_admin', JSON.stringify(admin));
        document.getElementById('newAdminPassword').value = '';
        showNotification('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    });
}

// ===== মডাল বন্ধ =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// ===== মডাল বাইরে ক্লিক করলে বন্ধ =====
function initModalClose() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // ESC চাপলে বন্ধ
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(m => {
                m.classList.remove('active');
            });
        }
    });
}

// ===== HTML Escape =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== নোটিফিকেশন =====
function showNotification(message, type = 'success') {
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
        max-width: 350px;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.transition = 'opacity 0.3s';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== পেজ লোড =====
document.addEventListener('DOMContentLoaded', function () {
    initDefaultData();

    // কোন পেজে আছি সেটা চেক
    if (document.getElementById('adminLoginForm')) {
        // লগইন পেজ
        initLoginPage();
    } else if (document.querySelector('.dashboard-layout')) {
        // ড্যাশবোর্ড পেজ
        initDashboard();
    }
});

console.log('%c Admin Panel ', 'background: #ef4444; color: white; font-size: 16px; padding: 5px 10px; border-radius: 5px;');
