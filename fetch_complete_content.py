#!/usr/bin/env python3
"""
Script pour créer une base de données complète avec le CONTENU ENTIER de chaque exercice
Récupère directement depuis GitHub 01-edu/public avec threading et rich
Hiérarchie: 10 barres principales (1 par thread) -> 5 sous-barres par exercice
"""
import json
import requests
from datetime import datetime
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeRemainingColumn
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()
data_lock = Lock()

def parse_exercise_info(content):
    """Parse le contenu pour extraire les infos de l'exercice"""
    info = {
        "difficulty": None,
        "programming_languages": [],
        "concepts": [],
        "resources_and_hints": [],
        "examples": []
    }
    
    # Chercher la difficulté
    difficulty_match = re.search(r'\*\*Difficulty\*\*:\s*(\w+)', content, re.IGNORECASE)
    if difficulty_match:
        info["difficulty"] = difficulty_match.group(1).lower()
    
    # Chercher les langages
    langs_match = re.search(r'\*\*Language\*\*s?:\s*([^\n]+)', content, re.IGNORECASE)
    if langs_match:
        langs_text = langs_match.group(1)
        # Extraire les langages (Go, Rust, JavaScript, etc.)
        langs = re.findall(r'\b(Go|Rust|JavaScript|Python|C|HTML|CSS|Bash|SQL|TypeScript)\b', content)
        info["programming_languages"] = list(set(langs))  # Unique
    
    # Chercher les concepts
    concepts_match = re.search(r'\*\*Concept\*\*s?:\s*([^\n]+)', content, re.IGNORECASE)
    if concepts_match:
        concepts_text = concepts_match.group(1)
        concepts = [c.strip() for c in concepts_text.split(',')]
        info["concepts"] = concepts
    
    # Chercher les ressources/hints
    resources_section = re.search(r'###\s*Resources?.*?(?=###|\Z)', content, re.IGNORECASE | re.DOTALL)
    if resources_section:
        # Extraire les liens et textes de ressources
        resources_text = resources_section.group(0)
        resources = re.findall(r'\[([^\]]+)\]', resources_text)
        info["resources_and_hints"] = resources[:5]  # Limiter à 5
    
    # Chercher les exemples
    examples_section = re.search(r'###\s*Example.*?\n(.*?)(?=###|\Z)', content, re.IGNORECASE | re.DOTALL)
    if examples_section:
        example_text = examples_section.group(1)
        # Extraire les blocs de code
        code_blocks = re.findall(r'```[a-z]*\n(.*?)\n```', example_text, re.DOTALL)
        info["examples"] = code_blocks[:3]  # Limiter à 3 exemples
    
    return info

def get_exercise_list():
    """Récupère la liste de tous les exercices depuis GitHub"""
    try:
        url = "https://api.github.com/repos/01-edu/public/contents/subjects"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            items = response.json()
            exercises = [item['name'] for item in items if item['type'] == 'dir']
            return exercises
        return []
    except Exception as e:
        return []

def fetch_readme_content(exercise_id, progress, task_id):
    """Récupère le contenu complet du README d'un exercice avec barre de progression"""
    try:
        # Sous-étape 1.1: Construction de l'URL
        url = f"https://raw.githubusercontent.com/01-edu/public/master/subjects/{exercise_id}/README.md"
        progress.update(task_id, advance=0.2, description=f"[cyan]{exercise_id}[/cyan] - URL")
        
        # Sous-étape 1.2: Connexion à GitHub (avec timeout court)
        progress.update(task_id, advance=0.2, description=f"[cyan]{exercise_id}[/cyan] - Connexion")
        response = requests.get(url, timeout=3)  # Réduit à 3 secondes
        
        # Sous-étape 1.3: Vérification de la réponse
        progress.update(task_id, advance=0.2, description=f"[cyan]{exercise_id}[/cyan] - Vérif")
        if response.status_code != 200:
            progress.update(task_id, advance=0.4, description=f"[red]{exercise_id}[/red] - ✗")
            return None
        
        # Sous-étape 1.4: Décodage du contenu
        progress.update(task_id, advance=0.2, description=f"[cyan]{exercise_id}[/cyan] - Décodage")
        content = response.text
        
        # Sous-étape 1.5: Finalisation
        progress.update(task_id, advance=0.2, description=f"[green]{exercise_id}[/green] - ✓")
        
        return content
    except requests.exceptions.Timeout:
        progress.update(task_id, advance=1.0, description=f"[red]{exercise_id}[/red] - ⏱ Timeout")
        return None
    except requests.exceptions.ConnectionError:
        progress.update(task_id, advance=1.0, description=f"[red]{exercise_id}[/red] - 🔌 Erreur")
        return None
    except Exception as e:
        progress.update(task_id, advance=1.0, description=f"[red]{exercise_id}[/red] - ✗")
        return None

def process_exercise(exercise_id, progress, task_id):
    """Traite un exercice et retourne ses données"""
    try:
        full_content = fetch_readme_content(exercise_id, progress, task_id)
        
        if full_content:
            # Parser les infos
            info = parse_exercise_info(full_content)
            
            exercise = {
                "id": exercise_id,
                "name": exercise_id.replace('-', ' ').title(),
                "path": f"subjects/{exercise_id}",
                "description": full_content[:500] if len(full_content) > 500 else full_content,  # Premier 500 chars
                "full_content": full_content,
                "content_length": len(full_content),
                "difficulty": info["difficulty"],
                "programming_languages": info["programming_languages"],
                "concepts": info["concepts"],
                "resources_and_hints": info["resources_and_hints"],
                "examples": info["examples"]
            }
            return exercise, True
        else:
            return None, False
    except Exception as e:
        return None, False

def main():
    console.print("\n")
    console.print(Panel(
        "[bold cyan]🔍 Récupération de la liste des exercices depuis GitHub...[/bold cyan]",
        border_style="cyan"
    ))
    
    exercises = get_exercise_list()
    if not exercises:
        console.print("[bold red]❌ Impossible de récupérer la liste des exercices[/bold red]")
        return
    
    total = len(exercises)
    console.print(Panel(
        f"[bold green]✅ {total} exercices trouvés![/bold green]\n"
        f"[cyan]⚡ 10 THREADS PARALLÈLES MAXIMUM[/cyan]\n"
        f"[cyan]📊 10 barres actives simultanément pour MAX de vitesse[/cyan]\n"
        f"[cyan]🚀 Chaque barre = 1 exercice = 5 sous-étapes[/cyan]",
        border_style="green"
    ))
    
    data = {
        "metadata": {
            "title": "Comprehensive Exercise Database - 01-edu/public",
            "description": "Complete database with full content of all exercises",
            "source": "https://github.com/01-edu/public",
            "total_exercises": total,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        "statistics": {
            "by_language": {},
            "by_concept": {},
            "by_difficulty": {}
        },
        "exercises": []
    }
    
    fetched_count = [0]  # Utiliser une liste pour le thread-safety
    failed_count = [0]
    exercise_list = list(exercises)
    
    # Créer une Progress avec plusieurs niveaux de barres
    with Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=40),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console,
        transient=False
    ) as progress:
        # Barre de progression principale globale
        main_task = progress.add_task(
            "[bold cyan]📊 Récupération globale[/bold cyan]",
            total=total
        )
        
        # 10 barres pour les threads - TOUJOURS VISIBLES
        thread_tasks = []
        for i in range(10):
            task = progress.add_task(
                f"[bold magenta]Thread {i+1:2d}[/bold magenta] [dim]en attente...[/dim]",
                total=1,
                visible=True
            )
            thread_tasks.append(task)
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            # Créer les futures avec les indices des threads
            futures = {}
            for idx, exercise_id in enumerate(exercise_list):
                thread_idx = idx % 10
                task_id = thread_tasks[thread_idx]
                
                future = executor.submit(
                    process_exercise, 
                    exercise_id, 
                    progress, 
                    task_id
                )
                futures[future] = (exercise_id, thread_idx, task_id)
            
            # Traiter les résultats au fur et à mesure
            for future in as_completed(futures):
                exercise, success = future.result()
                exercise_id, thread_idx, task_id = futures[future]
                
                if success and exercise:
                    with data_lock:
                        data['exercises'].append(exercise)
                        fetched_count[0] += 1
                else:
                    failed_count[0] += 1
                
                # Mettre à jour les barres
                progress.update(main_task, advance=1)
                # Réinitialiser la barre du thread à 0 pour le prochain exercice
                progress.reset(
                    task_id,
                    total=1,
                    visible=True,
                    description=f"[bold magenta]Thread {thread_idx+1:2d}[/bold magenta] [dim]en attente...[/dim]"
                )
    
    # Résumé final
    console.print("\n")
    summary_table = Table(title="[bold cyan]RÉSUMÉ DE LA RÉCUPÉRATION[/bold cyan]", border_style="cyan")
    summary_table.add_column("Statut", style="cyan")
    summary_table.add_column("Nombre", style="magenta")
    summary_table.add_row("[green]✓ Récupérés[/green]", f"[bold green]{fetched_count[0]}[/bold green]")
    summary_table.add_row("[red]✗ Erreurs[/red]", f"[bold red]{failed_count[0]}[/bold red]")
    success_rate = int(fetched_count[0]/total*100) if total > 0 else 0
    summary_table.add_row("[yellow]⚠ Taux de succès[/yellow]", f"[bold yellow]{success_rate}%[/bold yellow]")
    
    console.print(summary_table)
    
    # Mettre à jour les statistiques
    data['metadata']['exercises_fetched'] = fetched_count[0]
    data['metadata']['exercises_failed'] = failed_count[0]
    
    # Sauvegarder la base de données complète
    output_file = 'exercise_database_complete.json'
    
    console.print(f"\n💾 [bold cyan]Sauvegarde du fichier en cours...[/bold cyan]")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    file_size = len(json.dumps(data))/1024/1024
    
    console.print("\n")
    console.print(Panel(
        f"[bold green]✨ Base de données COMPLÈTE créée avec succès![/bold green]\n\n"
        f"[cyan]📁 Fichier:[/cyan] [bold yellow]{output_file}[/bold yellow]\n"
        f"[cyan]📦 Taille:[/cyan] [bold yellow]{file_size:.1f} MB[/bold yellow]\n"
        f"[cyan]📊 Exercices:[/cyan] [bold yellow]{fetched_count[0]}/{total}[/bold yellow]\n"
        f"[cyan]⚡ Vitesse:[/cyan] [bold yellow]10 threads[/bold yellow]\n\n"
        f"[cyan]Chaque exercice contient:[/cyan]\n"
        f"  ✓ ID et nom\n"
        f"  ✓ Chemin dans le repo\n"
        f"  ✓ Description (premiers 500 chars)\n"
        f"  ✓ CONTENU COMPLET du README.md\n"
        f"  ✓ Longueur du contenu\n"
        f"  ✓ Difficulté\n"
        f"  ✓ Langages de programmation\n"
        f"  ✓ Concepts\n"
        f"  ✓ Ressources et hints\n"
        f"  ✓ Exemples",
        border_style="green"
    ))

if __name__ == '__main__':
    main()
