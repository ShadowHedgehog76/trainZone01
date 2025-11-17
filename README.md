# ⚡ TrainZone - Professional Exercise Platform

> Une plateforme professionnelle et moderne présentant 792 exercices de programmation complets issus du repository 01-edu/public.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://shadowhedgehog76.github.io/trainZone01/)
[![Exercises](https://img.shields.io/badge/exercises-792-purple)](https://github.com/01-edu/public)
[![Languages](https://img.shields.io/badge/languages-9-blue)](#)

## 🌟 Aperçu

TrainZone est une interface web ultra-moderne et performante pour explorer et pratiquer les exercices de programmation de 01-edu. Avec un design inspiré des meilleures pratiques UX/UI, une interface fluide et des animations soignées, c'est l'outil idéal pour améliorer vos compétences en programmation.

## ✨ Fonctionnalités

### 🎯 Interface Moderne
- **Design Professionnel** : Interface inspirée des meilleures plateformes tech
- **Animations Fluides** : Transitions et micro-interactions soignées
- **Mode Sombre** : Éditeur de code avec thème dark optimisé
- **Responsive** : S'adapte parfaitement à tous les écrans

### 🔍 Recherche & Filtrage
- Recherche en temps réel par nom ou ID
- Filtres par langages (multi-sélection avec pastilles interactives)
- Sélection aléatoire d'exercices avec filtrage exact
- Compteur de résultats dynamique

### 💻 Éditeur de Code Intégré
- Interface type IDE professionnel
- Support de la coloration syntaxique
- Chargement de fichiers
- Zone de sortie style console
- Design inspiré de VS Code

### 📊 Statistiques
- 792 exercices complets
- 9 langages de programmation
- Métadonnées enrichies
- Contenu Markdown complet

## 🚀 Technologies

- **Frontend** : HTML5, CSS3 (CSS Variables, Flexbox, Grid)
- **JavaScript** : Vanilla JS (ES6+, Async/Await, Fetch API)
- **Design** : Gradient Design System, Inter & JetBrains Mono fonts
- **Architecture** : 100% statique, optimisé pour GitHub Pages
- **Performance** : Lazy loading, animations GPU-accelerated

## 🎨 Design System

### Couleurs Principales
- **Primary Purple** : `#7c3aed` - Accent principal
- **Gradient Hero** : `#1a1a2e → #16213e → #0f3460`
- **Success Green** : `#10b981`
- **Error Red** : `#ef4444`

### Typographie
- **Titres** : Inter (800-900 weight)
- **Corps** : Inter (400-600 weight)
- **Code** : JetBrains Mono

## 📋 Langages Supportés

| Langage | Nombre d'exercices |
|---------|-------------------|
| JavaScript | 245+ |
| Python | 70+ |
| Go | 70+ |
| Bash | Multiples |
| C | Multiples |
| Rust | Multiples |
| Java | Multiples |
| HTML/CSS | Multiples |
| SQL | Multiples |

## 🚀 Déploiement sur GitHub Pages

### Étape 1: Créer le repository

1. Créez un nouveau repository sur GitHub
2. Clonez le repository localement

### Étape 2: Ajouter les fichiers

Copiez ces fichiers dans votre repository :
- `index.html`
- `styles.css`
- `app.js`
- `exercise_database_complete.json`
- `README.md`

### Étape 3: Commit et push

```bash
git add .
git commit -m "Initial commit: Exercise Database"
git push origin main
```

### Étape 4: Activer GitHub Pages

1. Allez dans **Settings** > **Pages**
2. Sous **Source**, sélectionnez la branche `main`
3. Cliquez sur **Save**
4. Votre site sera disponible à : `https://VOTRE-USERNAME.github.io/VOTRE-REPO/`

## 💡 Utilisation locale

Pour tester localement, vous devez utiliser un serveur HTTP (à cause du chargement du JSON) :

### Option 1: Python
```bash
python -m http.server 8000
```
Puis ouvrez http://localhost:8000

### Option 2: Node.js
```bash
npx http-server
```

### Option 3: VS Code
Installez l'extension "Live Server" et cliquez sur "Go Live"

## 📦 Structure du projet

```
.
├── index.html                           # Page principale
├── styles.css                           # Styles CSS
├── app.js                              # Logique JavaScript
├── exercise_database_complete.json     # Base de données (792 exercices)
└── README.md                           # Documentation
```

## ⚠️ Limitations

L'exécution de code n'est **pas disponible** en mode statique pour des raisons de sécurité. L'éditeur de code est présent mais l'exécution nécessite un backend.

Pour activer l'exécution de code, utilisez la version Flask (`web_viewer.py`).

## 🔧 Version Backend (optionnelle)

Si vous souhaitez exécuter du code, utilisez la version Flask :

```bash
pip install flask markdown
python web_viewer.py
```

Puis ouvrez http://127.0.0.1:5000

## 📄 Licence

Les exercices proviennent du repository [01-edu/public](https://github.com/01-edu/public).

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Créé avec ❤️ pour la communauté 01-edu
