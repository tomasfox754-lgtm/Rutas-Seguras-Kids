/**
 * SCRIPT UNIFICADO - RUTAS SEGURAS KIDS (Con CRUD de Estudiantes)
 * Consolida el Clima, el Web Component y el Control del DOM con soporte completo
 * para estudiantes con atributos de Nombre, Edad, Grado e ID auto-generado, y su edición.
 */

// ==========================================================================
// 1. SERVICIO DE CLIMA (Open-Meteo API sin Keys)
// ==========================================================================
const CITIES = {
    bogota: { name: "Bogotá", lat: 4.6097, lon: -74.0817 },
    medellin: { name: "Medellín", lat: 6.2442, lon: -75.5812 },
    cali: { name: "Cali", lat: 3.4372, lon: -76.5225 },
    barranquilla: { name: "Barranquilla", lat: 10.9685, lon: -74.7813 },
    bucaramanga: { name: "Bucaramanga", lat: 7.1254, lon: -73.1198 }
};

const getWeatherEmoji = (code) => {
    if (code === 0) return { text: "Cielo Despejado", emoji: "☀️" };
    if (code >= 1 && code <= 3) return { text: "Seminublado", emoji: "⛅" };
    if (code >= 51 && code <= 65) return { text: "Lluvia", emoji: "🌧️" };
    if (code >= 80 && code <= 82) return { text: "Chubascos", emoji: "🌦️" };
    if (code >= 95 && code <= 99) return { text: "Tormenta", emoji: "⛈️" };
    return { text: "Nublado", emoji: "☁️" };
};

async function fetchWeather(cityKey) {
    try {
        const c = CITIES[cityKey];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code`);
        const d = await res.json();
        const info = getWeatherEmoji(d.current.weather_code);
        return { temp: `${Math.round(d.current.temperature_2m)}°C`, text: info.text, emoji: info.emoji };
    } catch {
        return { temp: "--°C", text: "Clima no disponible", emoji: "⚠️" };
    }
}

// ==========================================================================
// 2. WEB COMPONENT: <route-card> (Shadow DOM & CRUD de Estudiantes)
// ==========================================================================
class RouteCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._students = [];
    }

    static get observedAttributes() { return ['route-id', 'name', 'driver', 'departure-time']; }
    attributeChangedCallback() { this.render(); }

    get students() { return this._students; }
    set students(val) {
        this._students = val || [];
        this.renderStudents();
    }

    connectedCallback() {
        this.routeId = this.getAttribute('route-id') || '';
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || 'Nueva Ruta';
        const driver = this.getAttribute('driver') || 'Sin asignar';
        const time = this.getAttribute('departure-time') || '00:00';

        this.shadowRoot.innerHTML = `
            <style>
                .card { background: white; border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: var(--transition); display: flex; flex-direction: column; gap: 12px; }
                .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: #cbd5e1; }
                .header { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
                h3 { margin: 0 0 4px 0; color: var(--primary-color); font-size: 1.15rem; font-weight: 700; }
                p { margin: 2px 0; font-size: 0.85rem; color: var(--text-muted); }
                .time { color: var(--accent-hover); font-weight: 500; }
                .actions { display: flex; gap: 5px; }
                button { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-family: inherit; }
                .btn-add { background: var(--primary-color); color: white; padding: 6px 12px; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.8rem; }
                .btn-add:hover { background: var(--primary-hover); }
                .btn-cancel { background: #cbd5e1; color: #334155; padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; display: none; }
                input { padding: 6px 10px; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.8rem; outline: none; }
                ul { list-style: none; padding: 0; margin: 0; max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
                li { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid transparent; }
                li:hover { border-color: #cbd5e1; }
                .stud-name { font-weight: 600; font-size: 0.9rem; display: block; }
                .stud-meta { font-size: 0.75rem; color: var(--text-muted); display: block; }
                .btn-remove { color: var(--text-muted); font-size: 0.85rem; }
                .btn-remove:hover { color: var(--danger); }
                .btn-edit-stud { color: var(--text-muted); font-size: 0.85rem; }
                .btn-edit-stud:hover { color: var(--accent-hover); }
                .empty { font-size: 0.8rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 10px 0; }
                form { display: flex; flex-direction: column; gap: 6px; }
                .row { display: flex; gap: 5px; }
            </style>
            <div class="card">
                <div class="header">
                    <div>
                        <h3>${name}</h3>
                        <p>👤 Conductor: <strong>${driver}</strong></p>
                        <p class="time">🕒 Salida: <strong>${time}</strong></p>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" title="Editar Ruta">✏️</button>
                        <button class="btn-delete" title="Eliminar Ruta">🗑️</button>
                    </div>
                </div>
                <div>
                    <p style="font-weight:600; text-transform:uppercase; font-size:0.75rem; margin-bottom:6px; color:var(--text-muted);">Estudiantes Asignados</p>
                    <ul id="list"></ul>
                    
                    <form id="form" style="margin-top:10px;">
                        <input type="hidden" id="student-id-input" value="">
                        <div class="row">
                            <input type="text" placeholder="Nombre..." id="input-name" required style="flex:2;">
                            <input type="number" placeholder="Edad..." id="input-age" required min="3" max="18" style="width:60px;">
                            <input type="text" placeholder="Grado..." id="input-grade" required style="flex:1;">
                        </div>
                        <div class="row" style="justify-content: flex-end; margin-top: 2px;">
                            <button type="button" class="btn-cancel" id="btn-cancel-student">Cancelar</button>
                            <button type="submit" class="btn-add" id="btn-submit-student">Asignar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.btn-delete').onclick = () => this.dispatch('delete-route', { routeId: this.routeId });
        this.shadowRoot.querySelector('.btn-edit').onclick = () => this.dispatch('edit-route', { routeId: this.routeId });
        
        const form = this.shadowRoot.querySelector('#form');
        const sIdInput = this.shadowRoot.querySelector('#student-id-input');
        const nameIn = this.shadowRoot.querySelector('#input-name');
        const ageIn = this.shadowRoot.querySelector('#input-age');
        const gradeIn = this.shadowRoot.querySelector('#input-grade');
        const cancelBtn = this.shadowRoot.querySelector('#btn-cancel-student');
        const submitBtn = this.shadowRoot.querySelector('#btn-submit-student');

        form.onsubmit = (e) => {
            e.preventDefault();
            const studentName = nameIn.value.trim();
            const studentAge = parseInt(ageIn.value, 10);
            const studentGrade = gradeIn.value.trim();
            const existingId = sIdInput.value;

            if (studentName && studentAge && studentGrade) {
                if (existingId) {
                    // Modo Edición Estudiante
                    this.dispatch('update-student', {
                        routeId: this.routeId,
                        studentId: existingId,
                        studentName,
                        studentAge,
                        studentGrade
                    });
                } else {
                    // Modo Asignación (Creación) Estudiante
                    this.dispatch('add-student', {
                        routeId: this.routeId,
                        studentName,
                        studentAge,
                        studentGrade
                    });
                }
                this.resetStudentForm();
            }
        };

        cancelBtn.onclick = () => this.resetStudentForm();

        this.renderStudents();
    }

    resetStudentForm() {
        const shadow = this.shadowRoot;
        shadow.querySelector('#student-id-input').value = '';
        shadow.querySelector('#input-name').value = '';
        shadow.querySelector('#input-age').value = '';
        shadow.querySelector('#input-grade').value = '';
        shadow.querySelector('#btn-cancel-student').style.display = 'none';
        shadow.querySelector('#btn-submit-student').innerHTML = 'Asignar';
    }

    dispatch(evtName, detail) {
        this.dispatchEvent(new CustomEvent(evtName, { detail, bubbles: true, composed: true }));
    }

    renderStudents() {
        const list = this.shadowRoot.getElementById('list');
        if (!list) return;
        list.innerHTML = this._students.length ? '' : '<li class="empty">Sin estudiantes asignados</li>';
        
        this._students.forEach((s) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="stud-name">👦👧 ${s.name}</span>
                    <span class="stud-meta">ID: <strong>${s.id}</strong> | Edad: ${s.age} años | Grado: ${s.grade}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit-stud" title="Editar datos del estudiante">✏️</button>
                    <button class="btn-remove" title="Eliminar de la ruta">✕</button>
                </div>
            `;
            
            // Eliminar Estudiante
            li.querySelector('.btn-remove').onclick = () => {
                this.dispatch('delete-student', { routeId: this.routeId, studentId: s.id });
            };

            // Cargar datos en el sub-formulario para Editar Estudiante
            li.querySelector('.btn-edit-stud').onclick = () => {
                const shadow = this.shadowRoot;
                shadow.querySelector('#student-id-input').value = s.id;
                shadow.querySelector('#input-name').value = s.name;
                shadow.querySelector('#input-age').value = s.age;
                shadow.querySelector('#input-grade').value = s.grade;
                shadow.querySelector('#btn-cancel-student').style.display = 'inline-block';
                shadow.querySelector('#btn-submit-student').innerHTML = 'Guardar';
                shadow.querySelector('#input-name').focus();
            };

            list.appendChild(li);
        });
    }
}
customElements.define('route-card', RouteCard);

// ==========================================================================
// 3. ORQUESTADOR DE APLICACIÓN Y CONTROL DE ESTADO
// ==========================================================================
let routes = JSON.parse(localStorage.getItem('rutas_seguras_data')) || [
    {
        id: 'r1',
        name: 'Ruta Norte Colina',
        driver: 'Don Carlos López',
        departureTime: '06:15',
        students: [
            { id: 'E-520', name: 'Samuel Torres', age: 10, grade: '5° A' },
            { id: 'E-841', name: 'Sofía Restrepo', age: 8, grade: '3° B' }
        ]
    },
    {
        id: 'r2',
        name: 'Ruta Express Chía',
        driver: 'Doña Stella Maris',
        departureTime: '06:45',
        students: [
            { id: 'E-312', name: 'Mariana Gómez', age: 11, grade: '6° C' }
        ]
    }
];
let editingId = null;

// Elementos del DOM
const form = document.getElementById('route-form');
const nameInput = document.getElementById('route-name');
const driverInput = document.getElementById('route-driver');
const timeInput = document.getElementById('route-time');
const btnSubmit = document.getElementById('btn-submit-route');
const btnCancel = document.getElementById('btn-cancel-edit');
const formTitle = document.getElementById('form-title');
const grid = document.getElementById('routes-grid-container');
const emptyState = document.getElementById('empty-state-view');

function render() {
    grid.innerHTML = '';
    if (routes.length === 0) {
        emptyState.style.display = 'block';
        grid.style.display = 'none';
        return;
    }
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    routes.forEach(r => {
        const card = document.createElement('route-card');
        card.setAttribute('route-id', r.id);
        card.setAttribute('name', r.name);
        card.setAttribute('driver', r.driver);
        card.setAttribute('departure-time', r.departureTime);
        card.students = r.students;
        grid.appendChild(card);
    });
}

function save() {
    localStorage.setItem('rutas_seguras_data', JSON.stringify(routes));
}

async function updateWeather(cityKey) {
    const infoBox = document.getElementById('weather-info-box');
    infoBox.innerHTML = '<span class="weather-loading">Cargando clima...</span>';
    const data = await fetchWeather(cityKey);
    infoBox.innerHTML = `
        <span style="font-size: 1.5rem;">${data.emoji}</span>
        <div>
            <div class="weather-temp">${data.temp}</div>
            <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.85);">${data.text} en ${CITIES[cityKey].name}</div>
        </div>
    `;
}


document.addEventListener('DOMContentLoaded', () => {
    updateWeather('bogota');
    render();
    
    document.getElementById('weather-city-select').onchange = (e) => updateWeather(e.target.value);
    
  
    form.onsubmit = (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const driver = driverInput.value.trim();
        const time = timeInput.value;
        
        if (!name || !driver || !time) return alert("Completa todos los campos");
        
        if (editingId) {
            routes = routes.map(r => r.id === editingId ? { ...r, name, driver, departureTime: time } : r);
            editingId = null;
            formTitle.innerHTML = "📝 Registrar Nueva Ruta";
            btnSubmit.innerHTML = "Crear Ruta Escolar";
            btnSubmit.classList.replace('btn-accent', 'btn-primary');
            btnCancel.style.display = 'none';
        } else {
            routes.push({ id: 'r-' + Date.now().toString(36), name, driver, departureTime: time, students: [] });
        }
        form.reset();
        save();
        render();
    };

    btnCancel.onclick = () => {
        editingId = null;
        form.reset();
        formTitle.innerHTML = "📝 Registrar Nueva Ruta";
        btnSubmit.innerHTML = "Crear Ruta Escolar";
        btnSubmit.classList.replace('btn-accent', 'btn-primary');
        btnCancel.style.display = 'none';
    };

    

    grid.addEventListener('delete-route', (e) => {
        if (confirm("¿Deseas eliminar esta ruta?")) {
            routes = routes.filter(r => r.id !== e.detail.routeId);
            if (editingId === e.detail.routeId) btnCancel.click();
            save();
            render();
        }
    });

    grid.addEventListener('edit-route', (e) => {
        const r = routes.find(x => x.id === e.detail.routeId);
        if (r) {
            editingId = r.id;
            nameInput.value = r.name;
            driverInput.value = r.driver;
            timeInput.value = r.departureTime;
            formTitle.innerHTML = "✏️ Editar Ruta Escolar";
            btnSubmit.innerHTML = "Guardar Cambios";
            btnSubmit.classList.replace('btn-primary', 'btn-accent');
            btnCancel.style.display = 'block';
            nameInput.focus();
        }
    });


    grid.addEventListener('add-student', (e) => {
        const { routeId, studentName, studentAge, studentGrade } = e.detail;
        
        routes = routes.map(r => {
            if (r.id === routeId) {

                const autoId = 'E-' + Math.floor(100 + Math.random() * 900);
                const newStudent = {
                    id: autoId,
                    name: studentName,
                    age: studentAge,
                    grade: studentGrade
                };
                return { ...r, students: [...r.students, newStudent] };
            }
            return r;
        });
        save();
        render();
    });

    grid.addEventListener('update-student', (e) => {
        const { routeId, studentId, studentName, studentAge, studentGrade } = e.detail;
        
        routes = routes.map(r => {
            if (r.id === routeId) {
                const updatedStudents = r.students.map(s => {
                    if (s.id === studentId) {
                        return { ...s, name: studentName, age: studentAge, grade: studentGrade };
                    }
                    return s;
                });
                return { ...r, students: updatedStudents };
            }
            return r;
        });
        save();
        render();
    });

    grid.addEventListener('delete-student', (e) => {
        const { routeId, studentId } = e.detail;
        routes = routes.map(r => {
            if (r.id === routeId) {
                return { ...r, students: r.students.filter(s => s.id !== studentId) };
            }
            return r;
        });
        save();
        render();
    });
});
