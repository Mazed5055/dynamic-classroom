/* =========================================
   Dynamic Classroom - Student JavaScript
   কাজ: শিক্ষার্থী লগইন (রোল + পিন), ড্যাশবোর্ড,
        নোটিশ দেখা, প্রোফাইল
   ========================================= */

// ===== লগইন পেজ লজিক =====
function initStudentLogin() {
    const loginForm = document.getElementById('studentLoginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const roll = document.getElementById('studentRollInput').value.trim();
        const pin = document.getElementById('studentPinInput').value.trim();
        const errorEl = document.getElementById('studentError');

        // শিক্ষার্থী তালিকা লোড
        const students = JSON.parse(localStorage.getItem('dc_students') || '[]');

        // রোল ও পিন মিলিয়ে দেখা
        const student = students.find(s => s.roll === roll && s.pin === pin);

        if (student) {
            // লগইন সফল
            localStorage.setItem('dc_student_logged_in', 'true');
            localStorage.setItem('dc_student_roll', student.roll);
            localStorage.setItem('dc_student_name', student.name);
            localStorage.setItem('dc_student_class', student.class);

            errorEl.style.color = '#10b981';
            errorEl.textContent = '✓ লগইন সফল! ড্যাশবোর্ডে যাচ্ছেন...';

            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 800);
        } else {
            // লগইন ব্যর্থ
            errorEl.style.color = '#ef4444';
            errorEl.textContent = '✗ রোল বা পিন ভুল! আবার চেষ্টা করুন।';
            document.getElementById('studentPinInput').value = '';
        }
    });
}

// ===== লগইন চেক =====
function checkStudentLogin() {
    if (localStorage.getItem('dc_student_logged_in') !== 'true') {
        window.location.href = 'student.html';
    }
}

// ===== শিক্ষার্থী ড্যাশবোর্ড =====
function initStudentDashboard() {
    // লগইন চেক
    checkStudentLogin();

    // শিক্ষার্থীর নাম ও শ্রেণী দেখান
    const nameEl = document.getElementById('studentNameDisplay');
    const classEl = document.getElementById('studentClassDisplay');

    const studentName = localStorage.getItem('dc_student_name') || 'শিক্ষার্থী';
    const studentClass = localStorage.getItem('dc_student_class') || '-';

    if (nameEl) nameEl.textContent = studentName;
    if (classEl) classEl.textContent = 'শ্রেণী ' + studentClass;

    // লগআউট বাটন
    const logoutBtn = document.getElementById('studentLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('আপনি কি লগআউট করতে চান?')) {
                localStorage.removeItem('dc_student_logged_in');
                localStorage.removeItem('dc_student_roll');
                localStorage.removeItem('dc_student_name');
                localStorage.removeItem('dc_student_class');
                window.location.href = 'student.html';
            }
        });
    }

    // নোটিশ লোড
    loadStudentNotices();

    // সাইডবার মেনু
    initStudentSidebar();
}

// ===== সাইডবার মেনু =====
function initStudentSidebar() {
    const menuItems = document.querySelectorAll('.student-sidebar .sidebar-menu li');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');

            const text = this.textContent.trim();

            if (text.includes('হোম')) {
                loadStudentNotices();
            } else if (text.includes('আমার ক্লাস')) {
                showStudentClasses();
            } else if (text.includes('পরীক্ষা')) {
                showStudentExams();
            } else if (text.includes('নোটিশ')) {
                loadStudentNotices();
            } else if (text.includes('প্রোফাইল')) {
                showStudentProfile();
            }
        });
    });
}

// ===== নোটিশ লোড =====
function loadStudentNotices() {
    const noticesContainer = document.getElementById('studentNotices');
    const noticeCountEl = document.getElementById('studentNoticeCount');

    const notices = JSON.parse(localStorage.getItem('dc_notices') || '[]');

    if (noticeCountEl) noticeCountEl.textContent = notices.length;

    if (!noticesContainer) return;

    if (notices.length === 0) {
        noticesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-bell-slash" style="font-size: 50px; margin-bottom: 15px; display: block;"></i>
                <p>এখনো কোনো নোটিশ নেই</p>
            </div>
        `;
        return;
    }

    noticesContainer.innerHTML = '';

    notices.forEach(notice => {
        const div = document.createElement('div');
        div.className = 'notice-item' + (notice.urgent ? ' urgent' : '');
        div.innerHTML = `
            <div>
                <span class="notice-badge">${notice.urgent ? 'জরুরি' : 'নোটিশ'}</span>
                <h4>${escapeHtml(notice.title)}</h4>
                <p>${escapeHtml(notice.body)}</p>
                <small style="color: #94a3b8; display: block; margin-top: 8px;">
                    <i class="fas fa-calendar"></i> ${notice.date || ''}
                </small>
            </div>
        `;
        noticesContainer.appendChild(div);
    });
}

// ===== আমার ক্লাস দেখানো =====
function showStudentClasses() {
    const studentClass = localStorage.getItem('dc_student_class') || '6';

    // শ্রেণী অনুযায়ী বিষয় নির্ধারণ
    const subjectsByClass = {
        '6': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ধর্ম', 'আইসিটি'],
        '7': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ধর্ম', 'আইসিটি'],
        '8': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ধর্ম', 'আইসিটি'],
        '9': ['বাংলা', 'ইংরেজি', 'গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর গণিত'],
        '10': ['বাংলা', 'ইংরেজি', 'গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর গণিত'],
        '11': ['বাংলা', 'ইংরেজি', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর গণিত', 'আইসিটি'],
        '12': ['বাংলা', 'ইংরেজি', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর গণিত', 'আইসিটি']
    };

    const subjects = subjectsByClass[studentClass] || subjectsByClass['6'];

    // মেইন কনটেন্ট আপডেট
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // আগের কার্ডগুলো লুকান (স্ট্যাটস + নোটিশ কার্ড)
    const statsGrid = mainContent.querySelector('.stats-grid');
    const noticeCard = mainContent.querySelector('.card');

    if (statsGrid) statsGrid.style.display = 'none';
    if (noticeCard) noticeCard.style.display = 'none';

    // পুরনো ক্লাস সেকশন সরান
    const oldSection = document.getElementById('studentClassesSection');
    if (oldSection) oldSection.remove();

    // নতুন সেকশন বানান
    const section = document.createElement('div');
    section.id = 'studentClassesSection';
    section.className = 'card';
    section.style.marginTop = '20px';

    let subjectCards = '';
    subjects.forEach((subject, i) => {
        subjectCards += `
            <div class="feature-card" style="cursor: default;">
                <div class="feature-icon">
                    <i class="fas fa-book"></i>
                </div>
                <h3>${subject}</h3>
                <p>শ্রেণী ${studentClass} - বিষয় কোড: ${String(i + 1).padStart(2, '0')}</p>
            </div>
        `;
    });

    section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h2>আমার ক্লাস - শ্রেণী ${studentClass}</h2>
            <button class="btn btn-outline" style="color: #64748b; border-color: #e2e8f0;" onclick="backToHome()">
                <i class="fas fa-arrow-left"></i> ফিরে যান
            </button>
        </div>
        <div class="features-grid">
            ${subjectCards}
        </div>
    `;

    mainContent.appendChild(section);
}

// ===== পরীক্ষা দেখানো =====
function showStudentExams() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const statsGrid = mainContent.querySelector('.stats-grid');
    const noticeCard = mainContent.querySelector('.card');

    if (statsGrid) statsGrid.style.display = 'none';
    if (noticeCard) noticeCard.style.display = 'none';

    const oldSection = document.getElementById('studentExamsSection');
    if (oldSection) oldSection.remove();

    const section = document.createElement('div');
    section.id = 'studentExamsSection';
    section.className = 'card';
    section.style.marginTop = '20px';

    const exams = [
        { name: 'সাপ্তাহিক পরীক্ষা', date: 'প্রতি শুক্রবার', subject: 'সব বিষয়', marks: '২০' },
        { name: 'মাসিক পরীক্ষা', date: 'মাসের শেষ সপ্তাহে', subject: 'সব বিষয়', marks: '১০০' },
        { name: 'মডেল টেস্ট', date: 'প্রতি ২ মাস পর', subject: 'সব বিষয়', marks: '১০০' }
    ];

    let examRows = '';
    exams.forEach(exam => {
        examRows += `
            <tr>
                <td><strong>${exam.name}</strong></td>
                <td>${exam.date}</td>
                <td>${exam.subject}</td>
                <td>${exam.marks}</td>
            </tr>
        `;
    });

    section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h2>পরীক্ষার তালিকা</h2>
            <button class="btn btn-outline" style="color: #64748b; border-color: #e2e8f0;" onclick="backToHome()">
                <i class="fas fa-arrow-left"></i> ফিরে যান
            </button>
        </div>
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>পরীক্ষার নাম</th>
                        <th>সময়</th>
                        <th>বিষয়</th>
                        <th>পূর্ণ নম্বর</th>
                    </tr>
                </thead>
                <tbody>
                    ${examRows}
                </tbody>
            </table>
        </div>
    `;

    mainContent.appendChild(section);
}

// ===== প্রোফাইল দেখানো =====
function showStudentProfile() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const statsGrid = mainContent.querySelector('.stats-grid');
    const noticeCard = mainContent.querySelector('.card');

    if (statsGrid) statsGrid.style.display = 'none';
    if (noticeCard) noticeCard.style.display = 'none';

    const oldSection = document.getElementById('studentProfileSection');
    if (oldSection) oldSection.remove();

    const name = localStorage.getItem('dc_student_name') || 'শিক্ষার্থী';
    const roll = localStorage.getItem('dc_student_roll') || '-';
    const cls = localStorage.getItem('dc_student_class') || '-';

    const section = document.createElement('div');
    section.id = 'studentProfileSection';
    section.className = 'card';
    section.style.marginTop = '20px';

    section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h2>আমার প্রোফাইল</h2>
            <button class="btn btn-outline" style="color: #64748b; border-color: #e2e8f0;" onclick="backToHome()">
                <i class="fas fa-arrow-left"></i> ফিরে যান
            </button>
        </div>
        <div style="text-align: center; padding: 20px;">
            <div class="founder-avatar" style="margin: 0 auto 20px;">
                <i class="fas fa-user-graduate"></i>
            </div>
            <h3 style="font-size: 1.5rem; margin-bottom: 20px;">${escapeHtml(name)}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
                    <i class="fas fa-id-card" style="font-size: 24px; color: #2563eb; margin-bottom: 8px; display: block;"></i>
                    <p style="color: #64748b; font-size: 14px;">রোল নম্বর</p>
                    <h4 style="font-size: 1.3rem;">${escapeHtml(roll)}</h4>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
                    <i class="fas fa-school" style="font-size: 24px; color: #2563eb; margin-bottom: 8px; display: block;"></i>
                    <p style="color: #64748b; font-size: 14px;">শ্রেণী</p>
                    <h4 style="font-size: 1.3rem;">শ্রেণী ${escapeHtml(cls)}</h4>
                </div>
            </div>
        </div>
    `;

    mainContent.appendChild(section);
}

// ===== হোমে ফিরে যাওয়া =====
function backToHome() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // সেকশনগুলো সরান
    const sections = ['studentClassesSection', 'studentExamsSection', 'studentProfileSection'];
    sections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.remove();
    });

    // আগের কার্ডগুলো আবার দেখান
    const statsGrid = mainContent.querySelector('.stats-grid');
    const noticeCard = mainContent.querySelector('.card');

    if (statsGrid) statsGrid.style.display = 'grid';
    if (noticeCard) noticeCard.style.display = 'block';

    // সাইডবারে হোম অ্যাক্টিভ
    const menuItems = document.querySelectorAll('.student-sidebar .sidebar-menu li');
    menuItems.forEach((m, i) => {
        m.classList.toggle('active', i === 0);
    });

    // নোটিশ রিফ্রেশ
    loadStudentNotices();
}

// ===== HTML Escape =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== পেজ লোড =====
document.addEventListener('DOMContentLoaded', function () {
    // কোন পেজে আছি সেটা চেক
    if (document.getElementById('studentLoginForm')) {
        // লগইন পেজ
        initStudentLogin();
    } else if (document.querySelector('.student-sidebar')) {
        // ড্যাশবোর্ড পেজ
        initStudentDashboard();
    }
});

console.log('%c Student Panel ', 'background: #10b981; color: white; font-size: 16px; padding: 5px 10px; border-radius: 5px;');
