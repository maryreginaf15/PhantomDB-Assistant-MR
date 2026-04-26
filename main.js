import { studentsData, calculateStatus } from './data/students.js';

// --- State Management ---
let currentUser = null;
let currentAccentColor = '#00f3ff';
let chatHistory = [];
let queryLimit = 10;
let queriesPerformed = 0;

let appUsers = [
    { id: 1, name: "João Carlos", email: "joao@email.com", pass: "123456" },
    { id: 2, name: "Maria Souza", email: "maria@email.com", pass: "password" }
];

// --- DOM Elements ---
const landingSection = document.getElementById('landing-section');
const loginSection = document.getElementById('login-section');
const forgotPasswordSection = document.getElementById('forgot-password-section');
const appSection = document.getElementById('app-section');
const btnLoginTrigger = document.getElementById('btn-login-trigger');
const btnLogout = document.getElementById('btn-logout');

const views = {
    dashboard: document.getElementById('view-dashboard'),
    chat: document.getElementById('view-chat'),
    account: document.getElementById('view-account'),
    addDb: document.getElementById('view-add-db')
};

const sidebarBtns = {
    dashboard: document.getElementById('btn-show-dashboard'),
    chat: document.getElementById('btn-show-chat'),
    account: document.getElementById('btn-show-account'),
    addDb: document.getElementById('btn-show-add-db')
};

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

const profileDropdown = document.getElementById('profile-dropdown');
const profileTrigger = document.getElementById('profile-trigger');

const adminUserModal = document.getElementById('admin-user-modal');
const adminUserForm = document.getElementById('admin-user-form');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderStudentsTable();
    setupEventListeners();
});

// --- Navigation Logic ---
window.showSection = (sectionId) => {
    [landingSection, loginSection, forgotPasswordSection, appSection].forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    lucide.createIcons();
};

window.showView = (viewId) => {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewId].classList.remove('hidden');

    Object.values(sidebarBtns).forEach(b => b?.classList.remove('active'));
    sidebarBtns[viewId]?.classList.add('active');
    profileDropdown.classList.add('hidden'); // Close dropdown when navigating
    lucide.createIcons();
};

window.showLogin = () => window.showSection('login-section');
window.showForgotPassword = () => window.showSection('forgot-password-section');

window.logout = () => {
    currentUser = null;
    window.showSection('landing-section');
    btnLoginTrigger.classList.remove('hidden');
    btnLogout.classList.add('hidden');
    profileDropdown.classList.add('hidden');
};

// --- Event Listeners ---
function setupEventListeners() {
    // Profile Dropdown Toggle
    profileTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => profileDropdown.classList.add('hidden'));

    // Login Trigger (Navbar)
    btnLoginTrigger?.addEventListener('click', () => window.showLogin());

    // Login Form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        // Simulação de login
        if (email === 'admin@bdchat.com' && pass === '123456') {
            currentUser = { email, name: 'Administrador' };
            document.getElementById('header-user-name').textContent = "Admin";
            document.getElementById('dropdown-user-name').textContent = "Administrador";
            document.getElementById('dropdown-user-email').textContent = email;
            
            window.showSection('app-section');
            renderAdminUserList();
            btnLoginTrigger.classList.add('hidden');
            btnLogout.classList.remove('hidden');
            addChatMessage("bot", "Bem-vindo de volta! Como administrador de BD, você tem controle total sobre os dados e usuários.");
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Forgot Password Form
    document.getElementById('forgot-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('forgot-form').classList.add('hidden');
        document.getElementById('forgot-success-box').classList.remove('hidden');
    });

    // Sidebar Navigation
    sidebarBtns.dashboard.addEventListener('click', () => window.showView('dashboard'));
    sidebarBtns.chat.addEventListener('click', () => window.showView('chat'));
    sidebarBtns.account.addEventListener('click', () => {
        window.showView('account');
        renderAdminUserList();
    });
    sidebarBtns.addDb.addEventListener('click', () => window.showView('addDb'));

    // Chat
    document.getElementById('btn-send-chat').addEventListener('click', handleChatSubmit);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });

    // Edit Form (Handles Add & Edit)
    editForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-nome').value;
        const cpf = document.getElementById('edit-cpf').value;
        const ano = parseInt(document.getElementById('edit-ano').value);
        const faltas = parseInt(document.getElementById('edit-faltas').value);
        const dataInicio = document.getElementById('edit-data-inicio').value;
        const dataTermino = document.getElementById('edit-data-termino').value;

        const newStatus = (dataTermino && dataTermino !== "") ? "Inativo (Finalizado)" : 
                         (ano <= 2025) ? "Inativo (Formado)" : 
                         (faltas > 20 ? "Inativo (Faltas)" : "Ativo");

        if (id) {
            // Edit existing
            const student = studentsData.find(s => s.id === parseInt(id));
            if (student) {
                student.nome = name;
                student.cpf = cpf;
                student.ano_matricula = ano;
                student.frequencia_faltas = faltas;
                student.data_inicio = dataInicio;
                student.data_termino = dataTermino;
                student.status = newStatus;
            }
        } else {
            // Add new
            const newId = studentsData.length > 0 ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;
            const newStudent = {
                id: newId,
                nome: name,
                idade: 18,
                frequencia_faltas: faltas,
                onde_mora: "Não informado",
                cpf: cpf || "000.000.000-00",
                ano_nascimento: 2026 - 18,
                ano_matricula: ano,
                data_inicio: dataInicio,
                data_termino: dataTermino,
                status: newStatus
            };
            studentsData.push(newStudent);
        }

        renderStudentsTable();
        window.closeModal();
        alert(id ? 'Dados atualizados!' : 'Novo aluno adicionado!');
    });

    // File Reload Logic
    document.getElementById('reload-file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`Sincronizando com o arquivo: ${file.name}... Dados atualizados com sucesso!`);
            renderStudentsTable();
        }
    });

    // Admin User Form (Handles Add & Edit)
    adminUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-edit-id').value;
        const name = document.getElementById('admin-edit-name').value;
        const email = document.getElementById('admin-edit-email').value;
        const pass = document.getElementById('admin-edit-pass').value;

        if (id) {
            // Edit existing
            const user = appUsers.find(u => u.id === parseInt(id));
            if (user) {
                user.name = name;
                user.email = email;
                if (pass) user.pass = pass;
            }
        } else {
            // Add new
            const newId = appUsers.length > 0 ? Math.max(...appUsers.map(u => u.id)) + 1 : 1;
            const newUser = {
                id: newId,
                name: name,
                email: email,
                pass: pass || '123456' // Senha padrão se não informada
            };
            appUsers.push(newUser);
        }
        
        renderAdminUserList();
        window.closeAdminModal();
        alert(id ? 'Dados do usuário atualizados!' : 'Novo usuário cadastrado!');
    });
}

window.openAddUserModal = () => {
    document.getElementById('admin-edit-id').value = '';
    document.getElementById('admin-edit-name').value = '';
    document.getElementById('admin-edit-email').value = '';
    document.getElementById('admin-edit-pass').value = '';
    document.querySelector('#admin-user-modal h2').textContent = "Cadastrar Novo Usuário";
    adminUserModal.classList.remove('hidden');
};

window.triggerReload = () => {
    document.getElementById('reload-file-input').click();
};

// --- Admin User Management ---
function renderAdminUserList() {
    const list = document.getElementById('admin-user-list');
    if (!list) return;
    list.innerHTML = '';

    appUsers.forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <div class="user-info">
                <strong>${user.name}</strong>
                <span>${user.email}</span>
            </div>
            <div class="user-actions">
                <button class="btn-outline btn-sm" onclick="openAdminUserModal(${user.id})">Editar / Senha</button>
                <button class="btn-outline btn-sm" style="border-color: var(--error); color: var(--error);" onclick="deleteUser(${user.id})">Excluir</button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.openAdminUserModal = (id) => {
    const user = appUsers.find(u => u.id === id);
    if (user) {
        document.getElementById('admin-edit-id').value = user.id;
        document.getElementById('admin-edit-name').value = user.name;
        document.getElementById('admin-edit-email').value = user.email;
        document.getElementById('admin-edit-pass').value = ''; // Clear password field for security
        document.querySelector('#admin-user-modal h2').textContent = "Editar Usuário";
        adminUserModal.classList.remove('hidden');
    }
};

window.closeAdminModal = () => adminUserModal.classList.add('hidden');

window.deleteUser = (id) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        appUsers = appUsers.filter(u => u.id !== id);
        renderAdminUserList();
    }
};

window.updatePersonalProfile = () => {
    const name = document.getElementById('acc-name').value;
    const email = document.getElementById('acc-email').value;
    const pass = document.getElementById('acc-pass').value;
    
    // Simula atualização no estado local
    currentUser.name = name;
    currentUser.email = email;
    
    document.getElementById('header-user-name').textContent = name.split(' ')[0];
    document.getElementById('dropdown-user-name').textContent = name;
    document.getElementById('dropdown-user-email').textContent = email;
    
    alert('Seu perfil pessoal foi atualizado!');
};

// --- Dashboard Logic ---
function renderStudentsTable() {
    const tbody = document.getElementById('students-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    studentsData.forEach(student => {
        const row = document.createElement('tr');
        const isAtivo = student.status.toLowerCase().includes('ativo') && !student.status.toLowerCase().includes('inativo');
        const statusClass = isAtivo ? 'status-ativo' : 'status-inativo';
        
        const dataTerminoDisplay = student.data_termino ? student.data_termino : '<span style="color: var(--primary); font-style: italic;">Em andamento</span>';

        row.innerHTML = `
            <td>${student.nome}</td>
            <td><span class="status-badge ${statusClass}">${student.status}</span></td>
            <td>${student.data_inicio || '-'}</td>
            <td>${dataTerminoDisplay}</td>
            <td>${student.frequencia_faltas}</td>
            <td>${student.cpf}</td>
            <td>
                <button class="btn-primary btn-sm" onclick="openEditModal(${student.id})">Editar</button>
                <button class="btn-outline btn-sm" style="border-color: var(--error); color: var(--error); margin-left: 8px;" onclick="deleteStudent(${student.id})">Remover</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.openAddStudentModal = () => {
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-nome').value = '';
    document.getElementById('edit-cpf').value = '';
    document.getElementById('edit-ano').value = '2026';
    document.getElementById('edit-faltas').value = '0';
    document.getElementById('edit-data-inicio').value = new Date().toISOString().split('T')[0];
    document.getElementById('edit-data-termino').value = '';
    document.querySelector('#edit-modal h2').textContent = "Adicionar Novo Aluno";
    editModal.classList.remove('hidden');
};

window.openEditModal = (id) => {
    const student = studentsData.find(s => s.id === id);
    if (student) {
        document.getElementById('edit-id').value = student.id;
        document.getElementById('edit-nome').value = student.nome;
        document.getElementById('edit-cpf').value = student.cpf || '';
        document.getElementById('edit-ano').value = student.ano_matricula;
        document.getElementById('edit-faltas').value = student.frequencia_faltas;
        document.getElementById('edit-data-inicio').value = student.data_inicio || '';
        document.getElementById('edit-data-termino').value = student.data_termino || '';
        document.querySelector('#edit-modal h2').textContent = "Editar Aluno";
        editModal.classList.remove('hidden');
    }
};

window.deleteStudent = (id) => {
    if (confirm('Deseja realmente excluir este registro?')) {
        const index = studentsData.findIndex(s => s.id === id);
        if (index !== -1) {
            studentsData.splice(index, 1);
            renderStudentsTable();
        }
    }
};

window.closeModal = () => {
    editModal.classList.add('hidden');
};

// --- Chatbot Logic ---
function handleChatSubmit() {
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    if (!query) return;

    addChatMessage("user", query);
    input.value = '';

    if (queriesPerformed >= queryLimit) {
        addChatMessage("bot", "Limite de queries atingido para esta sessão.");
        return;
    }

    // Segurança: Bloquear comandos perigosos
    const forbidden = ["DROP", "DELETE", "UPDATE", "TRUNCATE", "ALTER"];
    if (forbidden.some(word => query.toUpperCase().includes(word))) {
        addChatMessage("bot", "⚠️ Ação bloqueada! Por motivos de segurança, apenas consultas (SELECT) são permitidas.");
        return;
    }

    showTyping(true);

    setTimeout(() => {
        processQuery(query);
        showTyping(false);
        queriesPerformed++;
    }, 1000);
}

function processQuery(query) {
    const q = query.toLowerCase();
    
    // Busca simples por nome
    const student = studentsData.find(s => q.includes(s.nome.toLowerCase()));

    if (student) {
        const response = `Encontrei informações sobre **${student.nome}**:<br>
            - Status: ${student.status}<br>
            - Idade: ${student.idade} anos<br>
            - Moradia: ${student.onde_mora}<br>
            - Ano de Matrícula: ${student.ano_matricula}<br>
            - Faltas: ${student.frequencia_faltas}`;
        addChatMessage("bot", response);
    } else if (q.includes("quantos") || q.includes("total")) {
        addChatMessage("bot", `Atualmente temos ${studentsData.length} alunos cadastrados no banco de dados.`);
    } else if (q.includes("ajuda") || q.includes("como funciona")) {
        addChatMessage("bot", "Você pode me perguntar sobre qualquer aluno pelo nome, pedir o total de alunos ou solicitar estatísticas de frequência.");
    } else {
        addChatMessage("bot", "Desculpe, não entendi sua pergunta. Tente perguntar pelo nome de um aluno (ex: 'Quem é Ana Silva?').");
    }
}

function addChatMessage(sender, text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = text;
    chatMessages.appendChild(msgDiv);
    
    // Auto-scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping(show) {
    const indicator = document.getElementById('typing-indicator');
    if (show) indicator.classList.remove('hidden');
    else indicator.classList.add('hidden');
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
