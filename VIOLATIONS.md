# TP 3 : Diagnostic de ReportService (parcours Data)

## Tableau des violations

| # | Principe | Ligne(s) | Problème | Conséquence concrète |
|---|---|---|---|---|
| 1 | S | 20 à 73 | `generate()` fait cinq métiers : lecture (21-22), calcul (24-39), mise en forme (41-55), journalisation (57-60), envoi d'e-mail (62-71). | Changer la TVA, un format ou le serveur d'envoi oblige à rouvrir la même méthode, au risque de casser les autres parties. Le calcul ne se teste pas sans lire le fichier ni envoyer d'e-mail. |
| 2 | O | 43 à 55 | Une chaîne de `if / else if` sur le nom du format. | Ajouter un format PDF oblige à modifier `generate()`, donc à retester tout ce qui était déjà validé. |
| 3 | L | 77 à 83 | `FreeReportService` lève une exception pour ce que le parent accepte (autre format que csv, ligne 79 ; e-mail, ligne 80) et appelle `super.generate` sans le destinataire (ligne 81). | Un code écrit pour `ReportService` plante dès qu'on lui passe un `FreeReportService` : le sous-type n'est pas substituable à son parent. |
| 4 | D | 4, 9, 16 | Le fichier `orders.json` est lu en dur dans la classe (`new URL`, `fs.readFileSync`). | Impossible de tester ou de réutiliser le calcul sans ce fichier. Passer à une base de données oblige à modifier la classe. |
| 5 | D | 10, 11, 65 à 70 | La configuration SMTP et la boîte d'envoi sont créées dans le constructeur. | Impossible de remplacer l'envoi par un faux dans les tests. Changer de serveur oblige à modifier le code. |
| 6 | D | 58, 59 | `new Date()` et `console.log` sont utilisés directement dans la logique. | L'horodatage change à chaque exécution, le journal pollue la sortie des tests et on ne peut ni le rediriger ni le vérifier. |
| 7 | Autre (secret) | 10 | Le mot de passe SMTP est écrit en clair dans le code. | Toute personne ayant accès au dépôt Git le connaît. Le changer oblige à modifier et republier le code. |
| 8 | Autre (encapsulation) | 11, 12, 60 | `outbox` et `history` sont des champs publics modifiables, et `history` grossit à chaque rapport sans limite. | N'importe quel code extérieur peut les modifier ou les vider, et la mémoire augmente à chaque appel en production. |
| 9 | Autre (données) | 22 | Le mois est filtré par `startsWith(month)` sans contrôler son format. | Un mois saisi `2026-1` sélectionne aussi octobre, novembre et décembre : les chiffres sont faux et aucune erreur n'est levée. |

Remarque : le principe I n'est pas franchement violé ici, faute d'interfaces. Il devient pertinent dans la cible, où chaque dépendance technique (lecture, envoi, journal) a une interface étroite.

## Question de spécialité DATA

**Où est le calcul des indicateurs ?** Aux lignes 24 à 39 de `generate()` : chiffre d'affaires HT (33), ventilation par catégorie (34), TVA (37), TTC (38) et panier moyen (39).

**Peut-on le réutiliser pour un tableau de bord sans le fichier ni l'e-mail ?** Non. Le calcul est enfoui dans `generate()`, qui lit d'abord le fichier, puis met en forme, journalise et peut envoyer un e-mail. Il n'existe aucun moyen d'appeler le calcul seul. Une fois extrait en fonction pure `computeStats(orders, month)`, un tableau de bord pourrait l'appeler directement avec ses propres données.

**Quelles règles de qualité des données sont appliquées ?**
- Les commandes annulées sont exclues (ligne 29).
- Un mois sans commande donne un panier moyen de 0 au lieu d'une division par zéro (ligne 39).
- La TVA et le panier moyen sont arrondis à deux décimales (lignes 37 et 39), mais le HT et le TTC ne le sont pas (lignes 33 et 38), donc des écarts d'arrondi sont possibles sur d'autres données.
- Le mois est filtré par le début de la date (ligne 22).

**Laquelle manque ?** À mon avis, la validation des données reçues :
- aucune vérification des lignes : une quantité ou un prix négatif, absent ou non numérique (NaN) fausse tous les totaux sans erreur ;
- seul le statut `CANCELLED` est exclu : tout autre statut (par exemple un remboursement ou une faute de frappe comme `canceled`) est compté comme une vente ;
- le format du mois n'est pas contrôlé (voir violation 9).
