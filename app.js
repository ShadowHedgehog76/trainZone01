// Chargement des données
let exercises = [];
let selectedLanguages = new Set();
let allLanguages = [];

// Charger la base de données
async function loadDatabase() {
    try {
        const response = await fetch('exercise_database_complete.json');
        const data = await response.json();
        exercises = data.exercises;
        
        // Extraire tous les langages uniques
        const languagesSet = new Set();
        exercises.forEach(ex => {
            if (ex.programming_languages) {
                ex.programming_languages.forEach(lang => languagesSet.add(lang));
            }
        });
        allLanguages = Array.from(languagesSet).sort();
        
        initializeApp();
    } catch (error) {
        showNotification('Erreur lors du chargement de la base de données', 'error');
        console.error(error);
    }
}

// Initialiser l'application
function initializeApp() {
    renderLanguagePills();
    renderExercises();
    setupEventListeners();
}

// Afficher les pastilles de langages
function renderLanguagePills() {
    const container = document.getElementById('languagePills');
    container.innerHTML = '';
    
    allLanguages.forEach(lang => {
        const pill = document.createElement('div');
        pill.className = 'pill';
        pill.textContent = lang;
        pill.dataset.language = lang;
        pill.addEventListener('click', () => toggleLanguage(lang));
        container.appendChild(pill);
    });
}

// Toggle language selection
function toggleLanguage(lang) {
    const lowerLang = lang.toLowerCase();
    
    if (selectedLanguages.has(lowerLang)) {
        selectedLanguages.delete(lowerLang);
    } else {
        selectedLanguages.add(lowerLang);
    }
    
    // Update pill appearance
    document.querySelectorAll('.pill').forEach(pill => {
        const pillLang = pill.dataset.language.toLowerCase();
        if (selectedLanguages.has(pillLang)) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    renderExercises();
}

// Afficher les exercices
function renderExercises() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('exerciseGrid');
    grid.innerHTML = '';
    
    let filteredExercises = exercises.filter(ex => {
        // Filter by search
        const matchesSearch = !searchTerm || 
            ex.id.toLowerCase().includes(searchTerm) || 
            ex.name.toLowerCase().includes(searchTerm);
        
        // Filter by languages
        const matchesLanguages = selectedLanguages.size === 0 || 
            (ex.programming_languages && 
             ex.programming_languages.some(lang => selectedLanguages.has(lang.toLowerCase())));
        
        return matchesSearch && matchesLanguages;
    });
    
    // Update results count
    document.getElementById('resultsCount').textContent = 
        `${filteredExercises.length} exercice(s) trouvé(s)`;
    
    // Render cards
    filteredExercises.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.id = ex.id;
        
        const badges = ex.programming_languages ? 
            ex.programming_languages.slice(0, 6).map(lang => 
                `<span class="badge">${lang}</span>`
            ).join('') : '';
        
        card.innerHTML = `
            <div class="exercise-id">${ex.id}</div>
            <h3>${ex.name}</h3>
            <div class="language-badges">${badges}</div>
        `;
        
        card.addEventListener('click', () => showExercise(ex.id));
        grid.appendChild(card);
    });
}

// Afficher un exercice
function showExercise(id) {
    const exercise = exercises.find(ex => ex.id === id);
    if (!exercise) return;
    
    // Switch to detail page
    document.getElementById('listPage').style.display = 'none';
    document.getElementById('detailPage').style.display = 'block';
    
    // Render exercise content
    const detailDiv = document.getElementById('exerciseDetail');
    
    // Convert markdown to HTML (simple conversion)
    let content = exercise.full_content || '';
    content = convertMarkdownToHTML(content);
    
    const badges = exercise.programming_languages ? 
        exercise.programming_languages.map(lang => 
            `<span class="badge">${lang}</span>`
        ).join(' ') : '';
    
    detailDiv.innerHTML = `
        <div class="exercise-id">${exercise.id}</div>
        <h1>${exercise.name}</h1>
        <div class="language-badges" style="margin-bottom: 20px;">${badges}</div>
        <div class="markdown-content">${content}</div>
    `;
    
    // Setup IDE
    setupIDE(exercise);
}

// Convertir Markdown en HTML (basique)
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Setup IDE
function setupIDE(exercise) {
    const selector = document.getElementById('languageSelector');
    selector.innerHTML = '';
    
    if (exercise.programming_languages && exercise.programming_languages.length > 0) {
        exercise.programming_languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            selector.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = 'python';
        option.textContent = 'Python';
        selector.appendChild(option);
    }
    
    // Clear editor
    document.getElementById('codeEditor').value = '';
    document.getElementById('outputContainer').innerHTML = '<div class="output-line">Prêt à exécuter...</div>';
}

// Event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('keyup', renderExercises);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        selectedLanguages.clear();
        document.querySelectorAll('.pill').forEach(pill => pill.classList.remove('active'));
        document.getElementById('searchInput').value = '';
        renderExercises();
    });
    
    // Random button
    document.getElementById('randomBtn').addEventListener('click', getRandomExercise);
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        document.getElementById('detailPage').style.display = 'none';
        document.getElementById('listPage').style.display = 'block';
    });
    
    // IDE controls
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('codeEditor').value = '';
        document.getElementById('outputContainer').innerHTML = '<div class="output-line">Éditeur effacé.</div>';
    });
    
    document.getElementById('fileInput').addEventListener('change', loadFile);
}

// Random exercise
function getRandomExercise() {
    let filteredExercises = exercises;
    
    if (selectedLanguages.size > 0) {
        filteredExercises = exercises.filter(ex => {
            if (!ex.programming_languages) return false;
            
            const cardLanguages = ex.programming_languages.map(l => l.toLowerCase());
            
            // Exact match: same count and all selected languages present
            if (cardLanguages.length !== selectedLanguages.size) return false;
            
            return cardLanguages.every(lang => selectedLanguages.has(lang));
        });
        
        if (filteredExercises.length === 0) {
            showNotification("Aucun exercice n'existe avec EXACTEMENT les langages sélectionnés!", 'error');
            return;
        }
    }
    
    const randomEx = filteredExercises[Math.floor(Math.random() * filteredExercises.length)];
    showExercise(randomEx.id);
}

// Run code
async function runCode() {
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('languageSelector').value;
    const output = document.getElementById('outputContainer');
    
    if (!code.trim()) {
        output.innerHTML = '<div class="output-line output-error">❌ Aucun code à exécuter!</div>';
        return;
    }
    
    output.innerHTML = '<div class="output-line">⚠️ L\'exécution de code nécessite un serveur backend.</div>' +
                       '<div class="output-line">Cette fonctionnalité n\'est pas disponible en mode statique.</div>' +
                       '<div class="output-line">Utilisez la version Flask pour exécuter du code.</div>';
}

// Load file
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('codeEditor').value = e.target.result;
        showNotification('Fichier chargé avec succès!', 'success');
    };
    reader.readAsText(file);
}

// Show notification
function showNotification(message, type = 'error') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load database on page load
loadDatabase();
