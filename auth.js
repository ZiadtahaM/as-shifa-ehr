const users = [
  { username: "ahmed", password: "1234", role: "doctor", fullName: "Dr. Ahmed Alqarni", image: "assets/images/Ahmed-Doctor.png", mfaRequired: true, patientIds: [1, 2] },
  { username: "dana", password: "1234", role: "doctor", fullName: "Dr. Dana Alqattan", image: "assets/images/Dana-Doctor.png", mfaRequired: true, patientIds: [3] },
  { username: "maryam", password: "1234", role: "patient", fullName: "Maryam Alarfaj", image: "assets/images/Maryam-Pat.png", mfaRequired: false, patientIds: [1] },
  { username: "salem", password: "1234", role: "patient", fullName: "Salem Alharbi", image: "assets/images/Salem-Pat.png", mfaRequired: false, patientIds: [2] },
  { username: "lama", password: "1234", role: "patient", fullName: "Lama Ali", image: "assets/images/Lama-Pat.png", mfaRequired: false, patientIds: [3] },
  { username: "noura", password: "1234", role: "nurse", fullName: "Noura Alotaibi", image: "assets/images/Noura-Nurse.png", mfaRequired: true, patientIds: [1, 2, 3] },
  { username: "reem", password: "1234", role: "receptionist", fullName: "Reem Ahmed", image: "assets/images/Reem-Rec.png", mfaRequired: false, patientIds: [1, 2, 3] },
  { username: "admin", password: "admin", role: "admin", fullName: "Admin User", image: null, mfaRequired: true, patientIds: [1, 2, 3] }
];

const patients = [
  { id: 1, name: "Maryam Alarfaj", age: 24, gender: "Female", image: "assets/images/Maryam-Pat.png", diagnosis: "Hypertension, Diabetes Type 2", treatment: "Continue current medications and monitor blood pressure daily.", notes: "Patient should follow up after two weeks." },
  { id: 2, name: "Salem Alharbi", age: 41, gender: "Male", image: "assets/images/Salem-Pat.png", diagnosis: "Asthma", treatment: "Use inhaler as prescribed.", notes: "Avoid dust exposure and follow up if symptoms increase." },
  { id: 3, name: "Lama Ali", age: 29, gender: "Female", image: "assets/images/Lama-Pat.png", diagnosis: "Vitamin D Deficiency", treatment: "Vitamin D supplement weekly.", notes: "Follow up after six weeks." }
];

const appointments = [
  { patientId: 1, date: "12 June 2026", time: "10:00 AM", type: "Follow-up", status: "Confirmed" },
  { patientId: 2, date: "14 June 2026", time: "11:30 AM", type: "Consultation", status: "Confirmed" },
  { patientId: 3, date: "17 June 2026", time: "02:30 PM", type: "Follow-up", status: "Pending" }
];

const prescriptions = [
  { patientId: 1, medication: "Metformin 500mg", dosage: "Once daily", status: "Active" },
  { patientId: 1, medication: "Lisinopril 10mg", dosage: "Once daily", status: "Active" },
  { patientId: 2, medication: "Salbutamol Inhaler", dosage: "As needed", status: "Active" },
  { patientId: 3, medication: "Vitamin D", dosage: "Weekly", status: "Active" }
];

let currentUser = null;
let selectedPatientId = 1;
let countdownInterval = null;
let recordReturnPage = "viewRecords";
const correctOTP = "123456";

let recordVersions = [
  {
    version: 1,
    patientId: 1,
    diagnosis: "Hypertension",
    treatment: "Lifestyle changes and blood pressure monitoring.",
    notes: "Patient should follow up after two weeks.",
    updatedBy: "Dr. Ahmed Alqarni",
    timestamp: "March 15, 2024 at 10:15 AM"
  }
];

function checkAccess(permission) {
  const permissions = {
    viewRecords: ["doctor", "nurse", "admin", "patient"],
    updateRecords: ["doctor", "admin"],
    viewPatients: ["doctor", "nurse", "admin"],
    manageAppointments: ["doctor", "receptionist", "admin", "patient"],
    viewPrescriptions: ["doctor", "nurse", "admin", "patient"]
  };

  return permissions[permission]?.includes(currentUser.role);
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function setActiveMenu(menuText) {
  document.querySelectorAll("nav button").forEach(button => {
    button.classList.remove("active");

    if (button.textContent.trim().includes(menuText)) {
      button.classList.add("active");
    }
  });
}

function quickLogin(username, password) {
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
  login();
}

function autoFillOTP() {
  const inputs = document.querySelectorAll(".otp-boxes input");
  const code = correctOTP || "123456";
  inputs.forEach((input, idx) => {
    input.value = code[idx] || "";
  });
  verifyMFA();
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    message.textContent = "Invalid username or password. Try demo accounts above.";
    return;
  }

  currentUser = user;
  selectedPatientId = currentUser.patientIds[0];
  message.textContent = "";

  if (user.mfaRequired) {
    clearOTP();
    showScreen("mfaScreen");
    startCountdown();
    const firstInput = document.querySelector(".otp-boxes input");
    if (firstInput) firstInput.focus();
  } else {
    showDashboard();
  }
}

function showDashboard() {
  showScreen("dashboardScreen");

  hideIfExists("staffDashboard");
  hideIfExists("patientDashboard");

  if (currentUser.role === "patient") {
    showIfExists("patientDashboard");
    setText("patientNameHeader", currentUser.fullName);
    setText("patientWelcome", "Welcome " + currentUser.fullName);
    setAvatar("patientAvatar", currentUser.image, currentUser.fullName);
  } else {
    showIfExists("staffDashboard");
    setText("staffNameHeader", currentUser.fullName);
    setText("staffRoleHeader", capitalizeRole(currentUser.role));
    setText("staffWelcome", "Welcome " + currentUser.fullName);
    setStaffAvatar(currentUser);
  }

  setActiveMenu("Dashboard");
  refreshIcons();
}

function setStaffAvatar(user) {
  const img = document.getElementById("staffAvatar");
  const icon = document.getElementById("staffIcon");

  if (!icon) return;

  if (img && user.image) {
    img.src = user.image;
    img.alt = user.fullName;
    img.classList.remove("hidden");
    icon.classList.add("hidden");
  } else {
    if (img) img.classList.add("hidden");
    icon.classList.remove("hidden");
    icon.textContent = getInitials(user.fullName);
  }
}

function setAvatar(imgId, imagePath, name) {
  const img = document.getElementById(imgId);
  if (!img) return;

  if (imagePath) {
    img.src = imagePath;
    img.alt = name;
    img.style.display = "inline-block";
  } else {
    img.style.display = "none";
  }
}

function getInitials(name) {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function capitalizeRole(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function verifyMFA() {
  const inputs = document.querySelectorAll(".otp-boxes input");
  let otp = "";
  inputs.forEach(input => otp += input.value);

  if (otp === correctOTP) {
    clearInterval(countdownInterval);
    hideMFAError();
    showDashboard();
  } else {
    showMFAError("Invalid code. Please try again.");
  }
}

function resendCode() {
  clearOTP();
  startCountdown();
  showMFAError("A new code has been sent. Use 123456 for demo.");
  document.querySelector(".otp-boxes input").focus();
}

function viewRecord() {
  if (!checkAccess("viewRecords")) {
    alert("Access denied: You are not allowed to view medical records.");
    return;
  }

  recordReturnPage = "viewRecords";

  if (currentUser.role === "patient") {
    openMedicalRecord(currentUser.patientIds[0], "viewRecords");
    return;
  }

  openRecordsList();
}

function openMedicalRecord(patientId = selectedPatientId, fromPage = recordReturnPage) {
  selectedPatientId = patientId;
  recordReturnPage = fromPage;

  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return;

  showScreen("recordScreen");
  setActiveMenu("View Records");

  setText("recordName", patient.name);
  setText("recordAge", patient.age);
  setText("recordGender", patient.gender);
  setText("recordPatientId", patient.id);
  setText("recordDiagnosis", patient.diagnosis);
  setText("recordTreatment", patient.treatment);
  setText("recordNotes", patient.notes);
  setText("recordUpdatedBy", currentUser.fullName);

  const recordInitials = document.getElementById("recordInitials");
  if (recordInitials) recordInitials.textContent = getInitials(patient.name);

  const updateBtn = document.getElementById("goUpdateBtn");
  const versionsBtn = document.getElementById("goVersionsBtn");

  if (updateBtn) {
    updateBtn.style.display = checkAccess("updateRecords") ? "inline-block" : "none";
  }

  if (versionsBtn) {
    versionsBtn.style.display =
      currentUser.role === "doctor" ||
      currentUser.role === "nurse" ||
      currentUser.role === "admin"
        ? "inline-block"
        : "none";
  }

  refreshIcons();
}

function goBackToPreviousPage() {
  if (recordReturnPage === "searchPatients") {
    openPatientsList();
  } else if (recordReturnPage === "viewRecords") {
    openRecordsList();
  } else {
    showDashboard();
  }
}

function openUpdateRecord() {
  if (!checkAccess("updateRecords")) {
    alert("Access denied: Only doctors and admins can update medical records.");
    return;
  }

  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return;

  showScreen("updateScreen");
  setActiveMenu("View Records");

  document.getElementById("editDiagnosis").value = patient.diagnosis;
  document.getElementById("editTreatment").value = patient.treatment;
  document.getElementById("editNotes").value = patient.notes;

  const msg = document.getElementById("updateMessage");
  if (msg) msg.classList.add("hidden");

  refreshIcons();
}

function saveRecordUpdate() {
  if (!checkAccess("updateRecords")) {
    alert("Access denied: Only doctors and admins can save updates.");
    return;
  }

  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return;

  patient.diagnosis = document.getElementById("editDiagnosis").value;
  patient.treatment = document.getElementById("editTreatment").value;
  patient.notes = document.getElementById("editNotes").value;

  const versionsForPatient = recordVersions.filter(v => v.patientId === selectedPatientId);

  recordVersions.push({
    version: versionsForPatient.length + 1,
    patientId: selectedPatientId,
    diagnosis: patient.diagnosis,
    treatment: patient.treatment,
    notes: patient.notes,
    updatedBy: currentUser.fullName,
    timestamp: new Date().toLocaleString()
  });

  const msg = document.getElementById("updateMessage");
  if (msg) {
    msg.textContent = "Medical record updated successfully. A new version has been saved.";
    msg.classList.remove("hidden");
  }
}

function openVersionHistory() {
  showScreen("versionScreen");
  setActiveMenu("View Records");

  const table = document.getElementById("versionTable");
  if (!table) return;

  table.innerHTML = "";

  recordVersions
    .filter(v => v.patientId === selectedPatientId)
    .forEach(v => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${v.version}</td>
        <td>${v.diagnosis}</td>
        <td>${v.updatedBy}</td>
        <td>${v.timestamp}</td>
        <td><button class="outline-small" onclick="openVersionDetail(${v.version})">View Version</button></td>
      `;
      table.appendChild(row);
    });

  refreshIcons();
}

function openVersionDetail(versionNumber) {
  const version = recordVersions.find(v => v.patientId === selectedPatientId && v.version === versionNumber);
  if (!version) return;

  showScreen("versionDetailScreen");
  setActiveMenu("View Records");

  setText("detailUpdatedBy", version.updatedBy);
  setText("detailTimestamp", version.timestamp);
  setText("detailVersionTitle", "Viewing saved record version " + version.version);
  setText("detailDiagnosis", version.diagnosis);
  setText("detailTreatment", version.treatment);
  setText("detailTag", "Saved version");

  refreshIcons();
}

function getVisiblePatients() {
  if (!currentUser) return [];
  return patients.filter(p => currentUser.patientIds.includes(p.id));
}

function openPatientsList() {
  if (!checkAccess("viewPatients")) {
    alert("Access denied: You are not allowed to search patients.");
    return;
  }

  recordReturnPage = "searchPatients";

  showScreen("patientsScreen");
  setActiveMenu("Search Patients");

  const title = document.querySelector("#patientsScreen .top-bar h2");
  if (title) title.textContent = "Search Patients";

  const searchInput = document.getElementById("patientSearchInput");
  if (searchInput) {
    searchInput.placeholder = "Search by patient name or diagnosis...";
    searchInput.value = "";
  }

  const downloadBtn = document.querySelector("#patientsScreen .actions button");
  if (downloadBtn) downloadBtn.style.display = "none";

  renderPatientsList();
}

function renderPatientsList() {
  const container = document.getElementById("patientsList");
  const note = document.getElementById("patientsAccessNote");
  const searchInput = document.getElementById("patientSearchInput");

  if (!container) return;

  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
  let visiblePatients = getVisiblePatients();

  if (keyword) {
    visiblePatients = visiblePatients.filter(patient =>
      patient.name.toLowerCase().includes(keyword) ||
      patient.diagnosis.toLowerCase().includes(keyword)
    );
  }

  if (note) {
    if (currentUser.role === "doctor") {
      note.textContent = "RBAC Applied: Doctors can only view their assigned patients.";
    } else if (currentUser.role === "nurse") {
      note.textContent = "RBAC Applied: Nurse can view patient records but cannot update them.";
    } else if (currentUser.role === "admin") {
      note.textContent = "Admin Access: Admin can view and manage all records.";
    } else if (currentUser.role === "patient") {
      note.textContent = "RBAC Applied: Patients can only view their own record.";
    }
  }

  container.innerHTML = "";

  if (visiblePatients.length === 0) {
    container.innerHTML = `<div class="patient-list-card"><p>No patients found.</p></div>`;
    return;
  }

  visiblePatients.forEach(patient => {
    const canUpdate = checkAccess("updateRecords");

    const card = document.createElement("div");
    card.className = "patient-list-card";

    card.innerHTML = `
      <div class="patient-list-left">
        <div class="admin-avatar">${getInitials(patient.name)}</div>

        <div class="patient-list-info">
          <h3>${patient.name}</h3>
          <p>${patient.gender} • Age ${patient.age}</p>
          <p><b>Diagnosis:</b> ${patient.diagnosis}</p>
        </div>
      </div>

      <div class="patient-list-actions">
        <button class="outline-small" onclick="openMedicalRecord(${patient.id}, 'searchPatients')">View Record</button>
        ${
          canUpdate
            ? `<button class="primary-small" onclick="openMedicalRecord(${patient.id}, 'searchPatients'); openUpdateRecord();">Update</button>`
            : `<button class="primary-small disabled-btn" disabled>Update</button>`
        }
      </div>
    `;

    container.appendChild(card);
  });

  refreshIcons();
}

function openRecordsList() {
  showScreen("patientsScreen");
  setActiveMenu("View Records");

  const title = document.querySelector("#patientsScreen .top-bar h2");
  const note = document.getElementById("patientsAccessNote");
  const searchInput = document.getElementById("patientSearchInput");
  const container = document.getElementById("patientsList");
  const downloadBtn = document.querySelector("#patientsScreen .actions button");

  if (title) title.textContent = "View Records";
  if (searchInput) {
    searchInput.placeholder = "Search by patient name or diagnosis...";
    searchInput.value = "";
  }
  if (note) note.textContent = "Select a patient to open their medical record.";
  if (downloadBtn) downloadBtn.style.display = "none";

  if (!container) return;

  const visiblePatients = getVisiblePatients();

  container.innerHTML = "";

  visiblePatients.forEach(patient => {
    const card = document.createElement("div");
    card.className = "record-select-card";
    card.onclick = () => openMedicalRecord(patient.id, "viewRecords");

    card.innerHTML = `
      <div class="admin-avatar">${getInitials(patient.name)}</div>
      <div>
        <h3>${patient.name}</h3>
        <p>${patient.gender} • Age ${patient.age}</p>
        <p><b>Diagnosis:</b> ${patient.diagnosis}</p>
      </div>
      <span class="record-arrow">Open →</span>
    `;

    container.appendChild(card);
  });

  refreshIcons();
}

function downloadPatients() {
  const data = getVisiblePatients()
    .map(patient => `${patient.name} | ${patient.gender} | Age ${patient.age} | ${patient.diagnosis}`)
    .join("\n");

  downloadFile("patients-list.txt", data);
}

function downloadRecord() {
  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return;

  const content =
`As-Shifa Medical Record

Patient Name: ${patient.name}
Patient ID: ${patient.id}
Gender: ${patient.gender}
Age: ${patient.age}

Diagnosis:
${patient.diagnosis}

Treatment:
${patient.treatment}

Notes:
${patient.notes}

Last Updated By: ${currentUser.fullName}
Record Status: Current Record`;

  downloadFile(`${patient.name.replaceAll(" ", "-")}-medical-record.txt`, content);
}

function openAppointments() {
  if (!checkAccess("manageAppointments")) {
    alert("Access denied: You are not allowed to manage appointments.");
    return;
  }

  showScreen("appointmentsScreen");
  setActiveMenu("Appointments");
  renderAppointments();
  refreshIcons();
}

function renderAppointments() {
  const table = document.getElementById("appointmentsTable");
  if (!table) return;

  table.innerHTML = "";

  appointments
    .filter(app => currentUser.patientIds.includes(app.patientId))
    .forEach(app => {
      const patient = patients.find(p => p.id === app.patientId);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${patient ? patient.name : "Unknown"}</td>
        <td>${app.date}</td>
        <td>${app.time}</td>
        <td>${app.type}</td>
        <td>${app.status}</td>
      `;

      table.appendChild(row);
    });
}

function downloadAppointments() {
  const data = appointments
    .filter(app => currentUser.patientIds.includes(app.patientId))
    .map(app => {
      const patient = patients.find(p => p.id === app.patientId);
      return `${patient ? patient.name : "Unknown"} | ${app.date} | ${app.time} | ${app.type} | ${app.status}`;
    })
    .join("\n");

  downloadFile("appointments.txt", data);
}

function openPrescriptions() {
  if (!checkAccess("viewPrescriptions")) {
    alert("Access denied: You are not allowed to view prescriptions.");
    return;
  }

  showScreen("prescriptionsScreen");
  setActiveMenu("Prescriptions");
  renderPrescriptions();
  refreshIcons();
}

function renderPrescriptions() {
  const table = document.getElementById("prescriptionsTable");
  if (!table) return;

  table.innerHTML = "";

  prescriptions
    .filter(rx => currentUser.patientIds.includes(rx.patientId))
    .forEach(rx => {
      const patient = patients.find(p => p.id === rx.patientId);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${patient ? patient.name : "Unknown"}</td>
        <td>${rx.medication}</td>
        <td>${rx.dosage}</td>
        <td>${rx.status}</td>
      `;

      table.appendChild(row);
    });
}

function downloadPrescriptions() {
  const data = prescriptions
    .filter(rx => currentUser.patientIds.includes(rx.patientId))
    .map(rx => {
      const patient = patients.find(p => p.id === rx.patientId);
      return `${patient ? patient.name : "Unknown"} | ${rx.medication} | ${rx.dosage} | ${rx.status}`;
    })
    .join("\n");

  downloadFile("prescriptions.txt", data);
}

function openProfile() {
  showScreen("profileScreen");

  setText("profileName", currentUser.fullName);
  setText("profileRole", capitalizeRole(currentUser.role));
  setText("profileUsername", currentUser.username);
  setText("profileRoleText", capitalizeRole(currentUser.role));
  setText("profileMfa", currentUser.mfaRequired ? "Enabled" : "Not Required");

  const profileAvatar = document.getElementById("profileAvatar");
  if (profileAvatar) profileAvatar.textContent = getInitials(currentUser.fullName);

  setActiveMenu("Profile");
  refreshIcons();
}

function logout() {
  document.getElementById("logoutModal").classList.remove("hidden");
}

function closeLogoutModal() {
  document.getElementById("logoutModal").classList.add("hidden");
}

function confirmLogout() {
  document.getElementById("logoutModal").classList.add("hidden");

  currentUser = null;
  clearInterval(countdownInterval);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginMessage").textContent = "";

  clearOTP();
  hideMFAError();
  showScreen("loginScreen");
}

function showScreen(screenId) {
  const screens = [
    "loginScreen",
    "mfaScreen",
    "dashboardScreen",
    "recordScreen",
    "updateScreen",
    "versionScreen",
    "versionDetailScreen",
    "patientsScreen",
    "appointmentsScreen",
    "prescriptionsScreen",
    "profileScreen"
  ];

  screens.forEach(screen => {
    const element = document.getElementById(screen);
    if (element) element.classList.add("hidden");
  });

  const selectedScreen = document.getElementById(screenId);
  if (selectedScreen) selectedScreen.classList.remove("hidden");

  refreshIcons();
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeButton = document.querySelector(".eye-btn");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeButton.innerHTML = `<i id="eyeIcon" data-lucide="eye"></i>`;
  } else {
    passwordInput.type = "password";
    eyeButton.innerHTML = `<i id="eyeIcon" data-lucide="eye-off"></i>`;
  }

  refreshIcons();
}

function clearOTP() {
  document.querySelectorAll(".otp-boxes input").forEach(input => input.value = "");
}

function setupOTPInputs() {
  const inputs = document.querySelectorAll(".otp-boxes input");

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

function startCountdown() {
  let timeLeft = 25;
  const countdown = document.getElementById("countdown");

  clearInterval(countdownInterval);
  countdown.textContent = "00:25";
  hideMFAError();

  countdownInterval = setInterval(() => {
    timeLeft--;
    countdown.textContent = `00:${String(timeLeft).padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdown.textContent = "Expired";
      showMFAError("Code expired. Please resend the code.");
    }
  }, 1000);
}

function showMFAError(text) {
  const message = document.getElementById("mfaMessage");
  if (!message) return;
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMFAError() {
  const message = document.getElementById("mfaMessage");
  if (!message) return;
  message.textContent = "";
  message.classList.add("hidden");
}

function toggleSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.classList.toggle("collapsed");
  refreshIcons();
}

function printPage() {
  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Medical Record - ${patient.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #13213c;
          }

          h1 {
            text-align: center;
            color: #102653;
            margin-bottom: 30px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 18px;
          }

          .label {
            font-weight: bold;
            color: #1d58b4;
          }

          p {
            font-size: 16px;
            line-height: 1.6;
          }
        </style>
      </head>

      <body>
        <h1>As-Shifa Medical Record</h1>

        <div class="box">
          <p><span class="label">Patient Name:</span> ${patient.name}</p>
          <p><span class="label">Patient ID:</span> ${patient.id}</p>
          <p><span class="label">Gender:</span> ${patient.gender}</p>
          <p><span class="label">Age:</span> ${patient.age}</p>
        </div>

        <div class="box">
          <p><span class="label">Diagnosis:</span> ${patient.diagnosis}</p>
          <p><span class="label">Treatment:</span> ${patient.treatment}</p>
          <p><span class="label">Notes:</span> ${patient.notes}</p>
        </div>

        <div class="box">
          <p><span class="label">Last Updated By:</span> ${currentUser.fullName}</p>
          <p><span class="label">Record Status:</span> Current Record</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function hideIfExists(id) {
  const element = document.getElementById(id);
  if (element) element.classList.add("hidden");
}

function showIfExists(id) {
  const element = document.getElementById(id);
  if (element) element.classList.remove("hidden");
}

setupOTPInputs();
refreshIcons();