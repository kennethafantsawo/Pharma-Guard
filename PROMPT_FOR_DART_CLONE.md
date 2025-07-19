# **PROMPT DE CLONAGE : Application Web Next.js vers Application Mobile Flutter**

## **Objectif Impératif : Réplication Stricte et Identique**

Votre mission est de cloner une application web existante, développée en Next.js, en une application mobile multiplateforme (iOS et Android) en utilisant Flutter et Dart.

**Directive Fondamentale :** Le résultat final doit être une réplique exacte de l'application web, à la manière de "deux gouttes d'eau". Aucune différence visuelle, fonctionnelle ou d'expérience utilisateur n'est tolérée. N'ajoutez, ne modifiez, ou ne supprimez AUCUN élément qui n'est pas explicitement décrit ci-dessous. Suivez ces consignes à la lettre.

---

## **1. Stack Technique Cible (Rappel)**

*   **Framework :** Flutter
*   **Langage :** Dart
*   **Gestion d'état :** Provider ou Riverpod.
*   **Base de données :** Connexion au **même** projet Supabase via le package `supabase_flutter`.
*   **Backend & IA :** Les fonctionnalités IA et Admin sont gérées par des Server Actions Next.js. L'application Flutter interagira avec ces fonctions via des appels réseau (HTTP POST).
*   **Styling :** Recréer fidèlement le style. La référence est l'implémentation de TailwindCSS et ShadCN UI.

---

## **2. Design Global et Thème**

### **Thème et Couleurs**

L'application doit supporter un thème clair et un thème sombre, basculables via une option dans l'en-tête. Les couleurs HSL sont des variables CSS dans l'application web ; elles doivent être traduites en `Color` dans Flutter.

*   **Thème Clair :**
    *   `background`: `hsl(210, 40%, 97%)`
    *   `foreground`: `hsl(215, 25%, 27%)`
    *   `card`: `hsl(0, 0%, 100%)`
    *   `primary`: `hsl(16, 96%, 54%)`
    *   `primary-foreground`: `hsl(0, 0%, 100%)`
    *   `secondary`: `hsl(210, 40%, 94%)`
    *   `muted`: `hsl(210, 40%, 96%)`
    *   `muted-foreground`: `hsl(215, 15%, 55%)`
    *   `accent`: `hsl(210, 90%, 55%)`
    *   `accent-foreground`: `hsl(0, 0%, 100%)`
    *   `border`: `hsl(210, 40%, 91%)`
*   **Thème Sombre :**
    *   `background`: `hsl(222, 47%, 12%)`
    *   `foreground`: `hsl(210, 40%, 98%)`
    *   `card`: `hsl(222, 47%, 14%)`
    *   `primary`: `hsl(16, 96%, 60%)`
    *   `accent`: `hsl(210, 90%, 65%)`
    *   `border`: `hsl(217, 33%, 20%)`

### **Typographie**

*   **Corps du texte :** Police "Inter".
*   **Titres (headline) :** Police "Sora".

---

## **3. Structure et Layout de l'Application**

L'application est composée d'un `Scaffold` de base qui affiche un `AppBar` personnalisé (le Header), le contenu de la page, et un `FloatingActionButton` pour le chatbot. Le pied de page (Footer) est visible en bas de la page.

### **3.1 Header (En-tête)**

*   **Apparence :** `AppBar` sticky (collant en haut) avec un fond semi-transparent et un effet de flou (`backdrop-blur`). Une fine bordure inférieure le sépare du contenu.
*   **Contenu Gauche :**
    *   Logo : `assets/logo.png` (taille 28x28).
    *   Titre : Texte "PharmaGuard" en police "Sora", `text-xl`, `font-bold`, couleur `accent`.
*   **Contenu Droit (sur grand écran) :**
    *   Une `Row` contenant les boutons de navigation, le sélecteur de thème, et un menu hamburger pour mobile.
*   **Navigation (visible sur grand écran, dans un menu sur mobile) :**
    *   Utiliser une `BottomNavigationBar` pour la navigation principale sur mobile. Les onglets doivent correspondre exactement à ceux du header web.
    *   **Onglets :**
        1.  **Pharmacies** (`Icon(Icons.local_pharmacy)`) - Page d'accueil. Icône web : `Pill`.
        2.  **Infos Médicaments** (`Icon(Icons.medication)`) - Icône web : `FileText`.
        3.  **Fiches Santé** (`Icon(Icons.article)`) - Icône web : `BookOpen`.
        4.  **Avis** (`Icon(Icons.star)`) - Icône web : `Star`.
        5.  **Options** (`Icon(Icons.settings)`) - Icône web : `Settings`.
    *   Le bouton de l'onglet actif a la couleur `accent`. Les autres sont `foreground` avec une opacité de 70%.
*   **Sélecteur de Thème :** Un bouton icône qui ouvre un menu (`DropdownMenu`) avec les options "Clair", "Sombre", "Système".
*   **Menu Mobile :** Un bouton icône (`Menu`) qui ouvre un `Drawer` (ou `Sheet`) depuis la gauche, affichant les liens de navigation verticalement.

### **3.2 Footer (Pied de page)**

*   **Apparence :** Une `Container` avec une bordure supérieure.
*   **Contenu :**
    *   À gauche : Texte "Powered by Kenneth AFANTSAWO".
    *   À droite : Une `Row` avec 4 icônes cliquables : `Mail`, `WhatsApp`, `Instagram`, `Facebook`. Chaque icône redirige vers le lien correspondant. La couleur est `muted-foreground` et change en `accent` au survol/pression.

### **3.3 Chatbot (Accessible partout)**

*   **Déclencheur :** Un `FloatingActionButton` (FAB) personnalisé fixé en bas à droite de l'écran.
    *   **Icône :** Une icône "Sparkle" (étincelle) personnalisée (SVG à reproduire).
    *   **Style :** Taille 56x56, avec une bordure `accent`.
*   **Interface :** Au clic sur le FAB, un `Sheet` (ou `ModalBottomSheet`) s'ouvre.
    *   **Header :** Titre "Assistant Pharmacien" avec l'icône Sparkle.
    *   **Contenu :** Une liste de messages scrollable.
        *   Messages de l'IA : Fond `muted`, avatar de l'IA (icône Sparkle) à gauche.
        *   Messages de l'utilisateur : Fond `accent`, texte `accent-foreground`, avatar de l'utilisateur (`User` icon) à droite.
    *   **Input :** Un `TextField` et un bouton d'envoi (`Send` icon) en bas.

---

## **4. Description Détaillée des Pages (Réplication Stricte)**

### **Page 1 : Pharmacies (Accueil)**

*   **Structure :**
    1.  **Navigateur de Semaine :** Centré en haut.
        *   Boutons fléchés (`<`, `>`) pour changer de semaine.
        *   Au centre, le nom de la semaine actuelle (ex: "Du 20/05/24 au 26/05/24").
        *   Un `DropdownButton` pour sélectionner directement une semaine.
    2.  **Barre de Recherche :** Un `TextField` avec une icône `Search` à l'intérieur, à gauche.
    3.  **Liste des pharmacies :**
        *   Un `GridView` (2 colonnes sur grand écran, 1 sur petit) ou `ListView` affichant les `PharmacyCard`.
    4.  **Carte (Map) :** Sur grand écran, une carte OpenStreetMap est affichée à droite. Elle est statique et n'interagit pas avec la liste.
*   **Composant `PharmacyCard` :**
    *   **Style :** Une `Card` avec un effet d'ombre et une légère élévation au survol/pression.
    *   **Header :** Le nom de la pharmacie en police "Sora", couleur `accent`.
    *   **Contenu :**
        *   Une `Row` avec une icône `MapPin` (couleur `primary`) et le texte de la localisation. L'ensemble est un lien qui ouvre `https://www.openstreetmap.org/search?query=pharmacie {nom} Lomé`.
        *   Deux boutons : "Appeler" (icône `Phone`) et "WhatsApp" (icône WhatsApp personnalisée).

### **Page 2 : Infos Médicaments**

*   **Structure :**
    *   **Header de page :** Une icône `Pill` dans un cercle `accent/10`, un titre "Informations Médicaments" et une description.
    *   **Formulaire de recherche :** Un `TextField` avec une icône `Search` à l'intérieur, et un bouton "Rechercher".
*   **Affichage des résultats :**
    *   Si une recherche est en cours, afficher un indicateur de chargement.
    *   Si des résultats sont présents, les afficher dans des `Card` séparées, chacune avec une icône et un titre :
        *   **Description** (Icône `Pill`)
        *   **Posologie** (Icône `HeartPulse`)
        *   **Effets secondaires** (Icône `AlertTriangle`)
        *   **Contre-indications** (Icône `ShieldAlert`)

### **Page 3 : Fiches Santé**

*   **Structure :**
    *   **Header de page :** Titre "Accueil Fiches Santé" et une description.
    *   **Liste de posts :** Un `ListView` affichant une série de `HealthPostCard`, séparées par une bordure.
*   **Composant `HealthPostCard` :**
    *   **Mise en page :** Style "tweet". Avatar à gauche, contenu à droite.
    *   **Avatar :** Un cercle `accent` avec une icône `BookOpen`.
    *   **Header de post :** Nom "PharmaGuard Santé" en gras, suivi de la date relative (ex: "il y a 2 jours").
    *   **Contenu :** Titre en gras, puis le contenu du post.
    *   **Image :** Si une URL d'image est présente, l'afficher. L'image est cliquable et s'ouvre en plein écran dans une modale.
    *   **Barre d'actions (icônes) :**
        *   **Commentaires** (`MessageCircle`) : Affiche le compteur de commentaires. Au clic, ouvre une section de commentaires sous le post.
        *   **Like** (`Heart`) : Affiche le compteur de "j'aime". L'icône se remplit (couleur `pink-500`) si l'utilisateur a liké.
        *   **Partager** (`Share2`) : Ouvre la boîte de dialogue de partage native.
*   **Section Commentaires :**
    *   Un `TextField` et un bouton `Send` pour ajouter un commentaire.
    *   Liste des commentaires existants, affichés avec le nom "Anonyme", le contenu, et la date relative.

### **Page 4 : Avis (Feedback)**

*   **Structure :** Une seule `Card` centrée.
    *   **Header :** Titre "Donnez votre avis" avec une icône `Star`.
    *   **Contenu :**
        *   Un `RadioGroup` stylisé pour choisir "Avis" (icône `Star`) ou "Suggestion" (icône `Lightbulb`).
        *   Un `TextField` multiligne pour le message.
        *   Un bouton "Envoyer mon message".

### **Page 5 : Options (Admin)**

*   **Logique :** La page affiche d'abord un formulaire de connexion. Une fois le mot de passe correct entré, le panneau d'administration s'affiche.
*   **Formulaire de Connexion :** Une `Card` avec un champ `TextField` pour le mot de passe et un bouton "Se Connecter".
*   **Panneau d'Administration :**
    *   Une grande `Card` avec un header affichant "Panneau d'Administration" et un bouton de déconnexion.
    *   Un système d'onglets (`TabBar`) avec "Pharmacies" et "Fiches Santé".
    *   **Onglet Pharmacies :**
        *   Une description et un sélecteur de fichier (`FileUploadButton`) pour charger un fichier JSON.
    *   **Onglet Fiches Santé :**
        *   **Colonne de gauche :** Formulaire de création (Titre, Contenu, Image, Date de publication optionnelle avec un `DatePicker`).
        *   **Colonne de droite :** Liste scrollable des fiches existantes. Chaque fiche montre son image, son titre, son statut (Publié/Programmé), et deux boutons icônes : "Modifier" (`Pencil`) et "Supprimer" (`Trash2`).
        *   La modification se fait dans une `Dialog` (modale).

---

## **5. Connexion au Backend (Rappel)**

*   **Supabase :** Initialiser le client avec les clés. Les requêtes directes sont pour les pharmacies et les fiches santé.
*   **API Service :** Créer une classe `ApiService` pour gérer les appels HTTP POST vers le backend Next.js pour :
    *   Toutes les fonctions IA (chatbot, infos médicaments).
    *   Toutes les actions de l'administrateur (mise à jour pharmacies, création/modification/suppression de fiches).
    *   La soumission du formulaire d'avis.

En suivant ce guide à la lettre, l'application Flutter sera le jumeau numérique de l'application web.
