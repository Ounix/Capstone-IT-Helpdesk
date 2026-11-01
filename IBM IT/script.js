/**
 * ================================================================
 * IT Helpdesk Assistant — script.js
 * Vanilla JavaScript (ES6+), no external dependencies.
 *
 * Sections:
 *  1. DATA        — Quick actions config & step-by-step troubleshoot flows
 *  2. STATE       — Active session tracker
 *  3. DOM         — Element references
 *  4. INIT        — Bootstrap on DOMContentLoaded
 *  5. FLOW ENGINE — Core interactive step logic
 *  6. RENDER      — DOM builder helpers
 *  7. LOGIC       — Form submit, keyword matching, textarea utils
 *  8. SIDEBAR     — Mobile toggle
 *  9. ESCALATE    — Escalation modal
 * 10. UTILITIES   — escapeHtml, formatTime, generateTicketNumber
 * ================================================================
 */

/* ================================================================
   1. DATA
   ================================================================ */

/**
 * Quick action definitions shown in the sidebar.
 */
const QUICK_ACTIONS = [
  {
    id: "reset-password",
    label: "Reset Password",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4
         a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>`,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "internet-connection",
    label: "Koneksi Internet",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905
         10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>`,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "printer-error",
    label: "Printer Error",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M17 17H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm0
         0v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2M7 9V7a2 2 0 012-2h6a2 2 0 012 2v2"/>`,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "slow-computer",
    label: "Komputer Lambat",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5
         a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "software-install",
    label: "Instalasi Software",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>`,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "vpn-issue",
    label: "Masalah VPN",
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6
         a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>`,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

/**
 * Troubleshooting flows.
 *
 * Each key maps to an object with:
 *   - title  : string   — shown as the flow header
 *   - steps  : Array<{ instruction: string, hint?: string }>
 *              Each step is shown one at a time.
 *              `instruction` is the main HTML body of the step.
 *              `hint` (optional) is displayed in the tip bar below the instruction.
 */
const TROUBLESHOOT_FLOWS = {
  "reset-password": {
    title: "Reset Password",
    steps: [
      {
        instruction: `Buka halaman login aplikasi atau portal kantor Anda, lalu klik tautan <strong>"Lupa Password?"</strong> yang biasanya ada di bawah kolom password.`,
        hint: "Pastikan Anda mengunjungi URL resmi perusahaan, bukan situs tiruan.",
      },
      {
        instruction: `Masukkan <strong>alamat email kantor</strong> Anda (contoh: nama@perusahaan.id), lalu klik tombol <strong>Kirim</strong> atau <strong>Send Reset Link</strong>.`,
      },
      {
        instruction: `Buka kotak masuk email Anda dan cari pesan dari IT Support. Cek juga folder <em>Spam / Junk</em> jika email tidak muncul dalam 5 menit.`,
        hint: "Email reset biasanya dikirim dari noreply@perusahaan.id.",
      },
      {
        instruction: `Klik tautan reset di dalam email tersebut. Tautan hanya berlaku selama <strong>15 menit</strong> — segera gunakan setelah menerimanya.`,
      },
      {
        instruction: `Buat password baru yang kuat: minimal <strong>8 karakter</strong>, kombinasi huruf besar, huruf kecil, angka, dan simbol (contoh: <code>Kantor@2024!</code>). Ketik ulang untuk konfirmasi, lalu klik <strong>Simpan</strong>.`,
        hint: "Jangan gunakan nama, tanggal lahir, atau kata umum sebagai password.",
      },
      {
        instruction: `Kembali ke halaman login, masukkan email dan password baru Anda. Jika berhasil masuk, <strong>password sudah berhasil diubah</strong>. ✅`,
      },
    ],
  },

  "internet-connection": {
    title: "Koneksi Internet",
    steps: [
      {
        instruction: `Periksa lampu indikator pada <strong>router / modem</strong> Anda. Lampu Internet atau WAN harus menyala <strong>hijau solid</strong> (bukan berkedip merah atau mati).`,
        hint: "Jika lampu merah / mati, masalah mungkin ada di sisi ISP, bukan perangkat Anda.",
      },
      {
        instruction: `<strong>Restart router</strong>: cabut kabel daya dari colokan listrik, tunggu <strong>30 detik</strong>, lalu colokkan kembali. Tunggu ±2 menit hingga router fully booted.`,
      },
      {
        instruction: `Di komputer, klik ikon WiFi di pojok kanan bawah taskbar. Pilih jaringan WiFi kantor, lalu klik <strong>Connect</strong>. Jika diminta password, hubungi admin untuk mendapatkannya.`,
        hint: "Jika menggunakan kabel LAN, pastikan kabel RJ-45 terpasang kencang di kedua ujung.",
      },
      {
        instruction: `Buka <strong>Command Prompt</strong> (tekan Win+R → ketik <code>cmd</code> → Enter). Ketik perintah berikut lalu tekan Enter:<br><code style="display:block;margin-top:6px;padding:6px 10px;background:#f1f5f9;border-radius:6px">ipconfig /flushdns</code>`,
      },
      {
        instruction: `Tutup semua tab browser, lalu buka ulang dan coba akses <strong>google.com</strong>. Jika halaman terbuka, koneksi sudah pulih. ✅`,
        hint: "Jika masih gagal, coba gunakan DNS publik: 8.8.8.8 (Google) atau 1.1.1.1 (Cloudflare).",
      },
    ],
  },

  "printer-error": {
    title: "Printer Error",
    steps: [
      {
        instruction: `Lihat layar / panel printer. <strong>Catat kode error</strong> yang tampil (contoh: E2, 0x00000709). Ini akan membantu diagnosis lebih lanjut jika masalah berlanjut.`,
      },
      {
        instruction: `<strong>Matikan printer</strong> menggunakan tombol daya, tunggu <strong>10 detik</strong>, lalu hidupkan kembali. Seringkali ini cukup untuk mereset error sementara.`,
        hint: "Pastikan printer terhubung ke sumber listrik yang stabil.",
      },
      {
        instruction: `Periksa kemungkinan <strong>kertas macet (paper jam)</strong>: buka semua penutup printer, keluarkan kertas yang tersangkut secara perlahan searah jalur kertas. Jangan tarik paksa.`,
        hint: "Cek semua area: input tray, output tray, dan jalur dupleks (jika ada).",
      },
      {
        instruction: `Di Windows, buka <em>Control Panel → Devices and Printers</em>. Klik kanan ikon printer Anda → pilih <strong>"See what's printing"</strong> → pilih semua dokumen di antrean → klik <strong>Cancel / Delete</strong>.`,
      },
      {
        instruction: `Restart layanan <strong>Print Spooler</strong>: tekan <kbd>Win+R</kbd>, ketik <code>services.msc</code> → Enter. Cari <em>"Print Spooler"</em>, klik kanan → <strong>Restart</strong>. Tunggu hingga statusnya kembali <em>Running</em>.`,
        hint: "Print Spooler yang macet adalah penyebab paling umum printer tidak merespons.",
      },
      {
        instruction: `Coba cetak <strong>Test Page</strong>: klik kanan printer di <em>Devices and Printers</em> → <em>Printer Properties</em> → klik tombol <strong>"Print Test Page"</strong>. Jika berhasil, printer Anda kembali normal. ✅`,
      },
    ],
  },

  "slow-computer": {
    title: "Komputer Lambat",
    steps: [
      {
        instruction: `Lakukan <strong>Restart</strong> penuh pada komputer Anda (bukan Hibernate atau Sleep). Ini membersihkan memori dan menutup proses yang menggantung.`,
        hint: "Pastikan tidak ada update Windows yang sedang berjalan di background — itu bisa memperlambat komputer.",
      },
      {
        instruction: `Tekan <kbd>Ctrl + Shift + Esc</kbd> untuk membuka <strong>Task Manager</strong>. Klik tab <em>"Processes"</em>, urutkan berdasarkan kolom <strong>CPU</strong> atau <strong>Memory</strong>. Klik kanan proses yang tidak dikenal dan memakan sumber daya tinggi → pilih <strong>End Task</strong>.`,
      },
      {
        instruction: `Periksa kapasitas penyimpanan: buka <em>File Explorer → This PC</em>. Jika disk hampir penuh (sisa &lt;10%), hapus file sementara: tekan <kbd>Win+R</kbd>, ketik <code>%temp%</code> → Enter → pilih semua → hapus.`,
        hint: "Anda juga bisa menjalankan Disk Cleanup: klik kanan drive C → Properties → Disk Cleanup.",
      },
      {
        instruction: `Jalankan pemindaian <strong>Windows Security (Defender)</strong>: buka menu Start → ketik "Windows Security" → <em>Virus &amp; threat protection</em> → klik <strong>Quick Scan</strong>.`,
        hint: "Malware sering menyebabkan komputer melambat karena berjalan diam-diam di background.",
      },
      {
        instruction: `Nonaktifkan program startup yang tidak perlu: di Task Manager, klik tab <strong>Startup</strong>. Klik kanan aplikasi yang tidak penting (seperti Spotify, Teams, Zoom) → pilih <strong>Disable</strong>.`,
      },
      {
        instruction: `Pastikan <strong>Windows Update</strong> sudah terpasang: buka Settings → <em>Windows Update</em> → klik <strong>Check for updates</strong>. Instal semua update yang tersedia lalu restart. ✅`,
        hint: "Jika komputer masih lambat setelah semua langkah, pertimbangkan upgrade RAM atau SSD.",
      },
    ],
  },

  "software-install": {
    title: "Instalasi Software",
    steps: [
      {
        instruction: `Pastikan akun Windows Anda memiliki <strong>hak Administrator</strong>. Klik kanan menu Start → <em>Computer Management → Local Users and Groups</em>. Jika tidak punya hak admin, hubungi IT Admin untuk dibantu.`,
        hint: "Sebagian besar software kantor memerlukan hak admin untuk instalasi.",
      },
      {
        instruction: `Download installer <strong>hanya dari sumber resmi</strong>: portal internal perusahaan, situs vendor resmi, atau tautan yang dikirim IT Admin. Hindari situs pihak ketiga yang tidak terpercaya.`,
      },
      {
        instruction: `Setelah file (.exe atau .msi) selesai diunduh, klik kanan file tersebut → pilih <strong>"Run as administrator"</strong>. Klik <em>Yes</em> pada dialog User Account Control (UAC) yang muncul.`,
        hint: "Jangan klik dua kali biasa — ini tidak akan memberikan hak admin yang dibutuhkan installer.",
      },
      {
        instruction: `Ikuti wizard instalasi. Pada layar <em>Installation Type</em>, pilih opsi <strong>Custom</strong> (bukan Express/Recommended) agar Anda bisa membatalkan centang software tambahan yang tidak diperlukan.`,
      },
      {
        instruction: `Setelah instalasi selesai, <strong>restart komputer</strong> jika wizard memintanya. Ini penting untuk menyelesaikan pendaftaran komponen sistem.`,
      },
      {
        instruction: `Buka aplikasi yang baru diinstal untuk memverifikasi. Jika diminta license key, gunakan kunci yang diberikan oleh IT Admin. Aplikasi berhasil terbuka berarti instalasi sukses. ✅`,
        hint: "Catat nomor lisensi di tempat yang aman — Anda mungkin memerlukannya saat reinstall.",
      },
    ],
  },

  "vpn-issue": {
    title: "Masalah VPN",
    steps: [
      {
        instruction: `Sebelum membuka VPN, pastikan koneksi internet Anda <strong>berjalan normal</strong>: coba buka google.com di browser. Jika internet bermasalah, selesaikan itu terlebih dahulu.`,
        hint: "VPN tidak dapat berfungsi tanpa koneksi internet yang aktif.",
      },
      {
        instruction: `Buka aplikasi VPN (GlobalProtect / FortiClient / Cisco AnyConnect, dll.). Klik <strong>Disconnect</strong>, tunggu 10 detik, lalu klik <strong>Connect</strong> kembali dan masukkan kredensial Anda.`,
      },
      {
        instruction: `Jika koneksi gagal, coba <strong>ganti server VPN</strong> ke lokasi lain yang tersedia di daftar server. Beberapa server mungkin sedang overload atau maintenance.`,
        hint: "Pilih server yang secara geografis paling dekat dengan lokasi Anda untuk performa terbaik.",
      },
      {
        instruction: `Pastikan <strong>tanggal dan waktu</strong> di komputer Anda akurat. Buka Settings → <em>Time &amp; Language</em> → aktifkan <strong>"Set time automatically"</strong>. VPN menggunakan sertifikat yang sensitif terhadap perbedaan waktu.`,
      },
      {
        instruction: `Nonaktifkan sementara <strong>firewall / antivirus pihak ketiga</strong> (seperti Norton, McAfee, Bitdefender) — bukan Windows Defender. Coba sambungkan VPN kembali. Jika berhasil, tambahkan VPN ke daftar pengecualian antivirus.`,
        hint: "Antivirus pihak ketiga sering memblokir protokol VPN secara keliru.",
      },
      {
        instruction: `Lakukan <strong>restart komputer</strong> dan coba sambungkan VPN kembali. Jika masih gagal setelah semua langkah, catat pesan error yang muncul untuk dilaporkan ke IT Support. ✅`,
      },
    ],
  },
};

/**
 * Keyword-to-flow mapping for free-text input.
 */
const KEYWORD_MAP = [
  { keywords: ["password", "login", "sandi", "masuk", "akun"], id: "reset-password" },
  { keywords: ["internet", "wifi", "wi-fi", "jaringan", "network", "koneksi", "online"], id: "internet-connection" },
  { keywords: ["printer", "cetak", "print", "paper jam", "kertas"], id: "printer-error" },
  { keywords: ["lambat", "lemot", "slow", "hang", "macet", "beku", "freeze"], id: "slow-computer" },
  { keywords: ["install", "software", "aplikasi", "program", "unduh", "download"], id: "software-install" },
  { keywords: ["vpn", "remote", "tunnel", "akses jarak"], id: "vpn-issue" },
];

/* ================================================================
   2. STATE
   ================================================================ */

/**
 * Tracks the currently active troubleshooting session.
 * - flowId    : key into TROUBLESHOOT_FLOWS (null = no active flow)
 * - stepIndex : 0-based index of the step currently being shown
 */
const session = {
  flowId: null,
  stepIndex: 0,
};

/* ================================================================
   3. DOM REFERENCES
   ================================================================ */

const chatMessages     = document.getElementById("chat-messages");
const chatForm         = document.getElementById("chat-form");
const userInput        = document.getElementById("user-input");
const typingIndicator  = document.getElementById("typing-indicator");
const quickActionsEl   = document.getElementById("quick-actions");
const btnEscalate      = document.getElementById("btn-escalate");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const sidebar          = document.getElementById("sidebar");
const sessionTimeEl    = document.getElementById("session-time");

/* ================================================================
   4. INIT
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  sessionTimeEl.textContent = formatTime(new Date());
  renderQuickActions();
  injectSidebarOverlay();

  // Welcome message
  setTimeout(() => {
    addAiMessage(`Halo! 👋 Saya <strong>IT Helpdesk Assistant</strong>, siap membantu Anda menyelesaikan masalah teknis.
      <br><br>Silakan pilih <strong>Quick Actions</strong> di samping untuk masalah umum, atau ketik masalah Anda secara langsung di kolom chat.`);
  }, 400);

  chatForm.addEventListener("submit", handleFormSubmit);
  btnEscalate.addEventListener("click", showEscalateModal);
  btnToggleSidebar.addEventListener("click", toggleSidebar);
  userInput.addEventListener("input", autoResizeTextarea);
  userInput.addEventListener("keydown", handleTextareaKeydown);
});

/* ================================================================
   5. FLOW ENGINE  — core interactive step logic
   ================================================================ */

/**
 * Start (or restart) a troubleshooting flow from step 0.
 * @param {string} flowId - Key in TROUBLESHOOT_FLOWS
 */
function startFlow(flowId) {
  const flow = TROUBLESHOOT_FLOWS[flowId];
  if (!flow) {
    // Unknown topic — show generic help message
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addAiMessage(`<strong>Saya siap membantu Anda!</strong>
        <p style="margin-top:6px">Mohon jelaskan masalah yang Anda alami secara lebih detail. Contohnya:</p>
        <ol>
          <li>Apa pesan error yang muncul?</li>
          <li>Kapan masalah ini mulai terjadi?</li>
          <li>Sudah langkah apa saja yang Anda coba?</li>
        </ol>
        <div class="tip">💡 Atau gunakan <strong>Quick Actions</strong> di panel kanan untuk masalah umum.</div>`);
    }, 700);
    return;
  }

  // Reset session state
  session.flowId    = flowId;
  session.stepIndex = 0;

  // Show the first step after a short simulated thinking delay
  setTyping(true);
  setTimeout(() => {
    setTyping(false);
    showStep(flowId, 0);
  }, 800);
}

/**
 * Render one step of the active flow, including the confirmation buttons.
 * @param {string} flowId
 * @param {number} index - 0-based step index
 */
function showStep(flowId, index) {
  const flow  = TROUBLESHOOT_FLOWS[flowId];
  const step  = flow.steps[index];
  const total = flow.steps.length;

  // Build step bubble HTML
  const tipHtml = step.hint
    ? `<div class="tip">💡 ${step.hint}</div>`
    : "";

  const bubbleHtml = `
    <div class="step-header">
      <span class="step-badge">Langkah ${index + 1} / ${total}</span>
      <span class="step-title">${flow.title}</span>
    </div>
    <p class="step-instruction">${step.instruction}</p>
    ${tipHtml}`;

  // Insert the AI bubble (without confirm buttons — append them separately)
  const bubbleRow = addAiMessage(bubbleHtml);

  // Append the confirmation button group below the bubble row
  const confirmBar = document.createElement("div");
  confirmBar.className = "confirm-bar";
  confirmBar.innerHTML = `
    <p class="confirm-question">Apakah masalah sudah teratasi?</p>
    <div class="confirm-buttons">
      <button class="btn-confirm btn-success" data-result="yes">
        ✅ Sudah berhasil
      </button>
      <button class="btn-confirm btn-fail" data-result="no">
        ❌ Belum berhasil
      </button>
    </div>`;

  // Attach handlers BEFORE appending to DOM to keep event delegation simple
  confirmBar.querySelectorAll(".btn-confirm").forEach((btn) => {
    btn.addEventListener("click", () => handleConfirmation(btn.dataset.result, confirmBar));
  });

  // The confirmBar is a sibling of the bubbleRow, both inside chatMessages
  chatMessages.appendChild(confirmBar);
  scrollToBottom();
}

/**
 * Handle user pressing "Sudah berhasil" or "Belum berhasil".
 * @param {"yes"|"no"} result
 * @param {HTMLElement} confirmBar - The bar element to disable after click
 */
function handleConfirmation(result, confirmBar) {
  // 1. Disable all buttons in this bar immediately (prevent double-click)
  confirmBar.querySelectorAll(".btn-confirm").forEach((b) => {
    b.disabled = true;
    b.classList.add("btn-disabled");
  });
  // Mark bar as answered
  confirmBar.classList.add("answered");

  const flow = TROUBLESHOOT_FLOWS[session.flowId];

  if (result === "yes") {
    // ── SUCCESS PATH ──────────────────────────────────────────────
    addUserMessage("Sudah berhasil ✅");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addAiMessage(`
        <div class="success-banner">
          🎉 <strong>Masalah berhasil diselesaikan!</strong>
        </div>
        <p style="margin-top:8px">Senang bisa membantu Anda. Jika Anda mengalami masalah lain, saya siap membantu kapan saja.</p>
        <div class="tip">💡 Tandai solusi ini agar mudah ditemukan kembali, atau hubungi kami melalui <strong>Eskalasi ke IT Support</strong> untuk masalah yang lebih kompleks.</div>`);
      // Clear session
      session.flowId    = null;
      session.stepIndex = 0;
    }, 600);

  } else {
    // ── FAIL PATH ─────────────────────────────────────────────────
    addUserMessage("Belum berhasil ❌");
    const nextIndex = session.stepIndex + 1;

    if (nextIndex < flow.steps.length) {
      // There is a next step — advance
      session.stepIndex = nextIndex;
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addAiMessage(`Tidak apa-apa, kita coba langkah berikutnya. 💪`);
        // Small pause then show the next step
        setTimeout(() => showStep(session.flowId, nextIndex), 300);
      }, 700);
    } else {
      // All steps exhausted — suggest escalation
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addAiMessage(`
          <div class="warn-banner">
            ⚠️ <strong>Semua langkah mandiri telah dicoba.</strong>
          </div>
          <p style="margin-top:8px">Sepertinya masalah ini memerlukan penanganan lebih lanjut dari tim IT. Saya sarankan untuk melakukan <strong>eskalasi</strong> agar teknisi kami bisa membantu langsung.</p>
          <div class="tip">📞 Gunakan tombol <strong>"Eskalasi ke IT Support"</strong> di panel kanan, atau hubungi Ext. <strong>1234</strong>.</div>`);
        session.flowId    = null;
        session.stepIndex = 0;
      }, 700);
    }
  }
}

/* ================================================================
   6. RENDER HELPERS
   ================================================================ */

/**
 * Render all quick action buttons into the sidebar.
 */
function renderQuickActions() {
  QUICK_ACTIONS.forEach((action) => {
    const btn = document.createElement("button");
    btn.className = "qa-btn";
    btn.setAttribute("data-action-id", action.id);
    btn.innerHTML = `
      <span class="qa-icon ${action.iconBg} ${action.iconColor}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${action.iconSvg}
        </svg>
      </span>
      <span>${action.label}</span>`;
    btn.addEventListener("click", () => handleQuickAction(action));
    quickActionsEl.appendChild(btn);
  });
}

/**
 * Append a user bubble to the chat.
 * @param {string} text - Plain text (will be escaped)
 */
function addUserMessage(text) {
  const row = document.createElement("div");
  row.className = "msg-row flex justify-end items-end gap-2";
  row.innerHTML = `
    <div class="flex flex-col items-end">
      <div class="bubble-user">${escapeHtml(text)}</div>
      <span class="msg-time">${formatTime(new Date())}</span>
    </div>
    <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mb-4">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    </div>`;
  chatMessages.appendChild(row);
  scrollToBottom();
}

/**
 * Append an AI bubble to the chat.
 * @param {string} html - HTML string
 * @returns {HTMLElement} The row element (not used externally but useful for testing)
 */
function addAiMessage(html) {
  const row = document.createElement("div");
  row.className = "msg-row flex items-end gap-2";
  row.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mb-4">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5
             a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>
    <div class="flex flex-col">
      <div class="bubble-ai">${html}</div>
      <span class="msg-time">${formatTime(new Date())}</span>
    </div>`;
  chatMessages.appendChild(row);
  scrollToBottom();
  return row;
}

/**
 * Show / hide the typing indicator.
 * @param {boolean} visible
 */
function setTyping(visible) {
  typingIndicator.classList.toggle("hidden", !visible);
  if (visible) scrollToBottom();
}

/**
 * Inject the mobile sidebar overlay backdrop.
 */
function injectSidebarOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.addEventListener("click", closeSidebar);
  document.body.appendChild(overlay);
}

/* ================================================================
   7. LOGIC
   ================================================================ */

/**
 * Handle chat form submission.
 */
function handleFormSubmit(e) {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addUserMessage(text);
  userInput.value = "";
  autoResizeTextarea.call(userInput);

  // Find matching flow id via keyword matching
  const flowId = findFlowId(text);
  startFlow(flowId); // handles null (unknown) gracefully
}

/**
 * Handle quick action sidebar button click.
 * @param {{ id: string, label: string }} action
 */
function handleQuickAction(action) {
  addUserMessage(action.label);
  closeSidebar();
  startFlow(action.id);
}

/**
 * Return the flow id matching keywords in the input, or null if no match.
 * @param {string} text
 * @returns {string|null}
 */
function findFlowId(text) {
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.id;
    }
  }
  return null; // no match → startFlow(null) shows generic message
}

/**
 * Auto-resize textarea height to fit content.
 */
function autoResizeTextarea() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

/**
 * Enter = send, Shift+Enter = new line.
 */
function handleTextareaKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
}

/**
 * Scroll chat to the very bottom (deferred one frame for paint timing).
 */
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

/* ================================================================
   8. SIDEBAR (mobile toggle)
   ================================================================ */

function toggleSidebar() {
  sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
}
function openSidebar() {
  sidebar.classList.add("open");
  document.getElementById("sidebar-overlay").classList.add("visible");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) overlay.classList.remove("visible");
}

/* ================================================================
   9. ESCALATE MODAL
   ================================================================ */

function showEscalateModal() {
  if (!document.getElementById("escalate-modal")) {
    const modal = document.createElement("div");
    modal.id = "escalate-modal";
    modal.innerHTML = `
      <div class="modal-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257
                   1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1
                   1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-800">Eskalasi ke IT Support</h3>
            <p class="text-xs text-gray-500">Tim teknis siap membantu Anda</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-5">
          Anda akan dihubungkan ke tim <strong>IT Support</strong> kami. Seorang teknisi akan
          menghubungi Anda dalam waktu <strong>15–30 menit</strong>.
        </p>
        <div class="bg-gray-50 rounded-xl p-3 mb-5 text-sm space-y-1">
          <p class="font-medium text-gray-700">Kontak Langsung:</p>
          <p class="text-gray-600">📞 Ext. <strong>1234</strong> (Senin–Jumat, 08.00–17.00)</p>
          <p class="text-gray-600">✉️ <strong>itsupport@perusahaan.id</strong></p>
        </div>
        <div class="flex gap-3">
          <button id="btn-escalate-confirm"
            class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition active:scale-95">
            Konfirmasi Eskalasi
          </button>
          <button id="btn-escalate-cancel"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition active:scale-95">
            Batal
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById("btn-escalate-confirm").addEventListener("click", confirmEscalation);
    document.getElementById("btn-escalate-cancel").addEventListener("click", hideEscalateModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) hideEscalateModal(); });
  }
  document.getElementById("escalate-modal").classList.add("visible");
}

function hideEscalateModal() {
  const modal = document.getElementById("escalate-modal");
  if (modal) modal.classList.remove("visible");
}

function confirmEscalation() {
  hideEscalateModal();
  // Clear any active flow
  session.flowId = null;
  session.stepIndex = 0;

  addUserMessage("Saya ingin eskalasi ke IT Support.");
  setTyping(true);
  setTimeout(() => {
    setTyping(false);
    addAiMessage(`
      <strong>Permintaan eskalasi telah dicatat ✅</strong>
      <p style="margin-top:6px">Tim IT Support kami akan segera menghubungi Anda. Nomor tiket Anda:
      <strong>#ITS-${generateTicketNumber()}</strong></p>
      <ol>
        <li>Seorang teknisi akan menghubungi Anda dalam <strong>15–30 menit</strong>.</li>
        <li>Siapkan <strong>nomor komputer/aset</strong> yang tertera di stiker bawah laptop Anda.</li>
        <li>Tetap di dekat perangkat Anda agar teknisi dapat membantu secara remote bila diperlukan.</li>
      </ol>
      <div class="tip">📞 Darurat: Hubungi langsung Ext. <strong>1234</strong> atau kirim email ke <strong>itsupport@perusahaan.id</strong></div>`);
  }, 800);
}

/* ================================================================
   10. UTILITIES
   ================================================================ */

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/** Format a Date as HH:MM in Indonesian locale. */
function formatTime(date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/** Generate a random 6-digit support ticket number. */
function generateTicketNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
