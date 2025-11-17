# Exercise Database - 01-edu

Site statique présentant 792 exercices de programmation complets issus du repository 01-edu/public.

## 🌐 Démo

[Voir le site en ligne](https://VOTRE-USERNAME.github.io/VOTRE-REPO/)

## ✨ Fonctionnalités

- 🔍 Recherche d'exercices par nom ou ID
- 🏷️ Filtrage par langages de programmation (multi-sélection)
- 🎲 Sélection aléatoire d'exercices
- 💻 Éditeur de code intégré (interface uniquement - exécution nécessite backend)
- 📱 Design responsive
- ⚡ Site 100% statique (GitHub Pages compatible)

## 📋 Langages supportés

- Bash
- C
- Go
- HTML/CSS
- Java
- JavaScript
- Python
- Rust
- SQL

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
