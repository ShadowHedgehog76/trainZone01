// ===========================================
// TRAINZONE - PROFESSIONAL JAVASCRIPT
// ===========================================

// STATE MANAGEMENT
const state = {
    exercises: [],
    allLanguages: [],
    selectedLanguages: new Set(),
    searchTerm: '',
    currentView: 'grid',
    currentExercise: null
};

// DOM ELEMENTS
const elements = {
    loadingOverlay: null,
    searchInput: null,
    languageFilters: null,
    exerciseGrid: null,
    emptyState: null,
    resultsNumber: null,
    selectedCount: null,
    homePage: null,
    detailPage: null,
    exerciseDetail: null,
    codeEditor: null,
    languageSelector: null,
    outputContainer: null,
    toastContainer: null
};

// INITIALIZE APP
async function init() {
    cacheDOMElements();
    await loadExercises();
    setupEventListeners();
    hideLoading();
}

// CACHE DOM ELEMENTS
function cacheDOMElements() {
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.searchInput = document.getElementById('searchInput');
    elements.languageFilters = document.getElementById('languageFilters');
    elements.exerciseGrid = document.getElementById('exerciseGrid');
    elements.emptyState = document.getElementById('emptyState');
    elements.resultsNumber = document.getElementById('resultsNumber');
    elements.selectedCount = document.getElementById('selectedCount');
    elements.homePage = document.getElementById('homePage');
    elements.detailPage = document.getElementById('detailPage');
    elements.exerciseDetail = document.getElementById('exerciseDetail');
    elements.codeEditor = document.getElementById('codeEditor');
    elements.languageSelector = document.getElementById('languageSelector');
    elements.outputContainer = document.getElementById('outputContainer');
    elements.toastContainer = document.getElementById('toastContainer');
}

// LOAD EXERCISES
async function loadExercises() {
    try {
        const response = await fetch('exercise_database_complete.json');
        const data = await response.json();
        state.exercises = data.exercises || [];
        
        // Extract unique languages
        const languagesSet = new Set();
        state.exercises.forEach(ex => {
            if (ex.programming_languages) {
                ex.programming_languages.forEach(lang => languagesSet.add(lang));
            }
        });
        state.allLanguages = Array.from(languagesSet).sort();
        
        renderLanguageFilters();
        renderExercises();
    } catch (error) {
        console.error('Error loading exercises:', error);
        showToast('Erreur lors du chargement des exercices', 'error');
    }
}

// RENDER LANGUAGE FILTERS
function renderLanguageFilters() {
    if (!elements.languageFilters) return;
    
    elements.languageFilters.innerHTML = state.allLanguages.map(lang => `
        <div class="language-filter" data-language="${lang}">
            <div class="filter-checkbox">
                <svg viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="filter-name">${lang}</span>
        </div>
    `).join('');
    
    // Add click listeners
    elements.languageFilters.querySelectorAll('.language-filter').forEach(filter => {
        filter.addEventListener('click', () => toggleLanguage(filter.dataset.language));
    });
}

// TOGGLE LANGUAGE FILTER
function toggleLanguage(language) {
    const lowerLang = language.toLowerCase();
    
    if (state.selectedLanguages.has(lowerLang)) {
        state.selectedLanguages.delete(lowerLang);
    } else {
        state.selectedLanguages.add(lowerLang);
    }
    
    // Update UI
    updateFilterUI();
    renderExercises();
}

// UPDATE FILTER UI
function updateFilterUI() {
    // Update selected count
    if (elements.selectedCount) {
        elements.selectedCount.textContent = state.selectedLanguages.size;
        elements.selectedCount.style.display = state.selectedLanguages.size > 0 ? 'block' : 'none';
    }
    
    // Update filter buttons
    elements.languageFilters.querySelectorAll('.language-filter').forEach(filter => {
        const lang = filter.dataset.language.toLowerCase();
        if (state.selectedLanguages.has(lang)) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
}

// FILTER EXERCISES
function filterExercises() {
    return state.exercises.filter(ex => {
        // Filter by search
        const matchesSearch = !state.searchTerm || 
            ex.id.toLowerCase().includes(state.searchTerm) || 
            ex.name.toLowerCase().includes(state.searchTerm);
        
        // Filter by languages
        const matchesLanguages = state.selectedLanguages.size === 0 || 
            (ex.programming_languages && 
             ex.programming_languages.some(lang => state.selectedLanguages.has(lang.toLowerCase())));
        
        return matchesSearch && matchesLanguages;
    });
}

// RENDER EXERCISES
function renderExercises() {
    const filtered = filterExercises();
    
    // Update results count
    if (elements.resultsNumber) {
        elements.resultsNumber.textContent = filtered.length;
    }
    
    // Show/hide empty state
    if (filtered.length === 0) {
        elements.exerciseGrid.style.display = 'none';
        elements.emptyState.style.display = 'block';
    } else {
        elements.exerciseGrid.style.display = 'grid';
        elements.emptyState.style.display = 'none';
    }
    
    // Render cards
    elements.exerciseGrid.innerHTML = filtered.map(ex => createExerciseCard(ex)).join('');
    
    // Add click listeners
    elements.exerciseGrid.querySelectorAll('.exercise-card').forEach(card => {
        card.addEventListener('click', () => showExercise(card.dataset.id));
    });
}

// CREATE EXERCISE CARD
function createExerciseCard(exercise) {
    const badges = exercise.programming_languages 
        ? exercise.programming_languages.slice(0, 5).map(lang => 
            `<span class="language-badge">${lang}</span>`
          ).join('')
        : '';
    
    return `
        <div class="exercise-card" data-id="${exercise.id}">
            <div class="exercise-id">${exercise.id}</div>
            <h3>${exercise.name}</h3>
            <div class="language-badges">${badges}</div>
        </div>
    `;
}

// SHOW EXERCISE DETAIL
function showExercise(id) {
    const exercise = state.exercises.find(ex => ex.id === id);
    if (!exercise) return;
    
    state.currentExercise = exercise;
    
    // Switch pages
    elements.homePage.classList.remove('active');
    elements.detailPage.classList.add('active');
    
    // Render exercise content
    const badges = exercise.programming_languages 
        ? exercise.programming_languages.map(lang => 
            `<span class="language-badge">${lang}</span>`
          ).join(' ')
        : '';
    
    const content = convertMarkdownToHTML(exercise.full_content || 'No content available.');
    
    elements.exerciseDetail.innerHTML = `
        <div class="exercise-id">${exercise.id}</div>
        <h1>${exercise.name}</h1>
        <div class="language-badges" style="margin-bottom: 2rem;">${badges}</div>
        <div class="markdown-content">${content}</div>
    `;
    
    // Setup IDE
    setupIDE(exercise);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// SETUP IDE
function setupIDE(exercise) {
    // Populate language selector
    elements.languageSelector.innerHTML = '';
    
    const languages = exercise.programming_languages && exercise.programming_languages.length > 0
        ? exercise.programming_languages
        : ['Python', 'JavaScript'];
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        elements.languageSelector.appendChild(option);
    });
    
    // Clear editor
    elements.codeEditor.value = '';
    elements.outputContainer.innerHTML = `
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>Waiting for execution...</span>
        </div>
    `;
}

// CONVERT MARKDOWN TO HTML
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    // Search
    elements.searchInput?.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        renderExercises();
    });
    
    // Reset button
    document.getElementById('resetBtn')?.addEventListener('click', resetFilters);
    
    // Random button
    document.getElementById('randomBtn')?.addEventListener('click', showRandomExercise);
    
    // Back button
    document.getElementById('backBtn')?.addEventListener('click', goBack);
    
    // View toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            elements.exerciseGrid.className = `exercise-grid ${view}-view`;
        });
    });
    
    // IDE Controls
    document.getElementById('runBtn')?.addEventListener('click', runCode);
    document.getElementById('clearBtn')?.addEventListener('click', clearEditor);
    document.getElementById('fileInput')?.addEventListener('change', loadFile);
}

// RESET FILTERS
function resetFilters() {
    state.selectedLanguages.clear();
    state.searchTerm = '';
    elements.searchInput.value = '';
    updateFilterUI();
    renderExercises();
    showToast('Filtres réinitialisés', 'success');
}

// SHOW RANDOM EXERCISE
function showRandomExercise() {
    let filtered = state.exercises;
    
    if (state.selectedLanguages.size > 0) {
        filtered = state.exercises.filter(ex => {
            if (!ex.programming_languages) return false;
            
            const cardLangs = ex.programming_languages.map(l => l.toLowerCase());
            
            // Exact match
            if (cardLangs.length !== state.selectedLanguages.size) return false;
            return cardLangs.every(lang => state.selectedLanguages.has(lang));
        });
        
        if (filtered.length === 0) {
            showToast("Aucun exercice avec exactement ces langages", 'error');
            return;
        }
    }
    
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    showExercise(random.id);
}

// GO BACK
function goBack() {
    elements.detailPage.classList.remove('active');
    elements.homePage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// SCROLL TO EXERCISES
function scrollToExercises() {
    document.getElementById('exercisesSection')?.scrollIntoView({ behavior: 'smooth' });
}

// RUN CODE
function runCode() {
    const code = elements.codeEditor.value;
    const language = elements.languageSelector.value;
    
    if (!code.trim()) {
        elements.outputContainer.innerHTML = `
            <div class="output-line error">
                <span class="output-prefix">✖</span>
                <span>No code to execute</span>
            </div>
        `;
        return;
    }
    
    elements.outputContainer.innerHTML = `
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>⚠️ Code execution requires a backend server</span>
        </div>
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>This feature is not available in static mode</span>
        </div>
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>Language: ${language}</span>
        </div>
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>Lines of code: ${code.split('\\n').length}</span>
        </div>
    `;
}

// CLEAR EDITOR
function clearEditor() {
    elements.codeEditor.value = '';
    elements.outputContainer.innerHTML = `
        <div class="output-line info">
            <span class="output-prefix">›</span>
            <span>Editor cleared</span>
        </div>
    `;
    showToast('Editor cleared', 'success');
}

// LOAD FILE
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.codeEditor.value = e.target.result;
        showToast('File loaded successfully', 'success');
    };
    reader.readAsText(file);
}

// SHOW TOAST
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HIDE LOADING
function hideLoading() {
    setTimeout(() => {
        elements.loadingOverlay?.classList.add('hidden');
    }, 500);
}

// INITIALIZE ON DOM LOADED
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// EXPORT FUNCTIONS FOR INLINE USAGE
window.scrollToExercises = scrollToExercises;
window.showRandomExercise = showRandomExercise;
window.resetFilters = resetFilters;
