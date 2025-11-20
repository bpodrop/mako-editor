## 1. Gestion du MIDI

### UC-M1 — Sélectionner la sortie MIDI Web

**But** : choisir l’interface MIDI physique à utiliser.
**Scénario** :

1. L’app interroge les sorties MIDI disponibles via Web MIDI.
2. L’utilisateur choisit une sortie dans une liste déroulante.
3. L’app mémorise cette sortie pour les messages suivants (CC/PC).

---

### UC-M2 — Sélectionner le canal MIDI pour la pédale

**But** : s’assurer que les messages sont envoyés sur le bon canal pour la pédale sélectionnée.
**Scénario** :

1. Après avoir choisi la pédale (cf. UC-P1/P2), l’app affiche un sélecteur de canal MIDI (1–16).
2. L’utilisateur choisit le canal correspondant à la configuration de sa pédale.
3. L’app enregistre ce canal comme **canal actif** pour cette pédale.
4. Tous les messages (CC/PC) sont ensuite envoyés sur ce canal.

---

### UC-M3 — Tester la connexion MIDI

**But** : vérifier rapidement que la pédale réagit.
**Scénario** :

1. L’utilisateur clique sur “Tester la connexion”.
2. L’app envoie un **PC#0** (ou un message de test équivalent) sur la sortie et le canal sélectionnés.
3. L’app affiche : “Message de test envoyé sur canal X – vérifiez la pédale”.

---

## 2. Gestion des pédales

### UC-P1 — Lister les pédales disponibles

**But** : baser la liste de pédales sur les configurations connues.
**Scénario** :

1. Au lancement, l’app lit la liste des fichiers de config connus (ex. `R1.json`, `M1.json`, `D1.json`, `ACS1.json`).
2. L’app génère automatiquement la liste des pédales disponibles à partir de ces configs.
3. L’utilisateur voit une liste (R1, M1, D1, ACS1) correspondant aux configs chargées.

---

### UC-P2 — Sélectionner une pédale et charger sa configuration

**But** : adapter toute l’UI au modèle choisi.
**Scénario** :

1. L’utilisateur sélectionne une pédale dans la liste.
2. L’app charge le JSON de configuration correspondant (CC, types de contrôles, regroupements…).
3. L’app reconstruit l’UI (groupes, sliders, switches…) en fonction de cette config.
4. L’app peut pré-remplir le canal MIDI avec la dernière valeur utilisée pour cette pédale (si mémorisée).

---

## 3. Gestion des modes d’interaction (Live vs Preset)

### UC-MODE1 — Choisir le mode Live ou Preset

**But** : laisser l’utilisateur décider du style d’interaction.
**Scénario** :

1. L’app propose un sélecteur global de mode : **Live** / **Preset**.
2. L’utilisateur choisit un mode.
3. L’UI indique clairement le mode actif (ex. badge ou switch visible en permanence).

---

### UC-MODE2 — Afficher le mode actif et le comportement associé

**But** : éviter toute ambiguïté sur le comportement des contrôles.
**Scénario** :

1. En mode **Live** : une note ou un tooltip indique “Les modifications sont envoyées immédiatement à la pédale (CC live)”.
2. En mode **Preset** : note “Les modifications ne sont envoyées qu’à la validation. Vous pouvez annuler pour revenir aux dernières valeurs appliquées”.

---

## 4. Gestion des contrôles (Live / Preset)

### UC-C1 — Modifier un contrôle en mode Live

**But** : interaction immédiate pour le réglage “à l’oreille”.
**Scénario** :

1. Le mode **Live** est actif.
2. L’utilisateur modifie un contrôle (slider, toggle, select…).
3. Dès l’événement de changement de valeur (ex. `input`/`change`), l’app envoie le **CC correspondant** sur le canal actif.
4. L’UI met à jour la valeur “committed” (dernière valeur envoyée) pour ce contrôle.

---

### UC-C2 — Modifier des contrôles en mode Preset (édition sans envoi)

**But** : préparer un ensemble de changements avant de les envoyer.
**Scénario** :

1. Le mode **Preset** est actif.
2. L’utilisateur modifie un ou plusieurs contrôles.
3. L’app met à jour les valeurs affichées, mais **n’envoie aucun CC**.
4. L’app marque en interne quels contrôles ont été modifiés (ex. flag “dirty”).
5. Option : l’UI peut signaler les contrôles modifiés (par une petite pastille, contour, etc.).

---

### UC-C3 — Valider les changements en mode Preset (envoi groupé)

**But** : envoyer les modifications en un bloc cohérent.
**Scénario** :

1. En mode **Preset**, l’utilisateur clique sur “Appliquer” / “Valider”.
2. L’app collecte tous les contrôles modifiés depuis la dernière validation.
3. L’app envoie les CC correspondants **en séquence** sur le canal actif.
4. Les valeurs ainsi envoyées deviennent la nouvelle **référence** (dernier état validé) pour la fonction Annuler.
5. Les flags “dirty” sont remis à zéro.

---

### UC-C4 — Annuler les modifications en mode Preset (retour à la dernière valeur appliquée)

**But** : permettre de tester sans risque et revenir au dernier état validé.
**Scénario** :

1. En mode **Preset**, tant que des contrôles ont été modifiés sans validation, l’option “Annuler” est disponible.
2. L’utilisateur clique sur “Annuler”.
3. L’app restaure dans l’UI les **dernières valeurs validées** (celles associées au dernier envoi de CC, Live ou Preset).
4. Aucun CC n’est envoyé lors de l’annulation (on revient juste aux valeurs connues côté UI).

   * Variante si tu le souhaites : possibilité d’avoir une option pour “forcer la resynchronisation” avec la pédale, mais ce n’est pas obligatoire en V1.
5. Les flags “dirty” sont remis à zéro.

---

## 5. Gestion des presets (de la pédale elle-même)

### UC-PR1 — Rappeler un preset de la pédale (Program Change)

**But** : changer de preset interne de la pédale.
**Scénario** :

1. L’utilisateur choisit un numéro de preset (0–127).
2. L’app envoie un **PC** immédiatement, quel que soit le mode Live/Preset (PC = action “discrète”, pas une édition de paramètres).
3. L’UI met à jour l’indication de preset actif (numéro, bank, couleur si dispo).
4. Optionnel : l’app peut proposer d’aligner les valeurs UI sur un état de référence lié à ce preset (mais ce n’est pas obligatoire pour V1).

---

### UC-PR2 — Changer de bank A/B/C (R1, M1, D1)

**But** : aligner l’app sur la notion de bank interne de la pédale.
**Scénario** :

1. L’utilisateur choisit Bank A/B/C.
2. L’app envoie le CC de banque (si pédale concernée).
3. Les presets 0–2 / 3–5 / 6–8 sont affichés clairement pour la bank sélectionnée.

---

## 6. Catégories finales avec prise en compte des modes

* **Gestion du MIDI** : sélection sortie, canal, test.
* **Gestion des pédales** : liste dynamique à partir des configs, chargement d’une pédale.
* **Gestion des modes d’interaction** : Live vs Preset.
* **Gestion des contrôles** :

  * Live : envoi immédiat.
  * Preset : édition → validation groupée → annulation.
* **Gestion des presets de la pédale** : PC + banks.
* **État utilisateur** : ordre des pédales, valeurs, modes, canaux.

## 7. Gestion multi-pédales (board virtuel)

### UC-B1 — Initialiser le board avec une seule pédale

**But** : conserver la simplicité au premier lancement.
**Scénario** :

1. Au premier démarrage (aucun board enregistré en localStorage), l’app crée automatiquement un board contenant un seul “slot”.
2. Ce slot sélectionne par défaut le premier modèle disponible (UC-P1) et applique son canal MIDI suggéré (UC-M2).
3. L’utilisateur visualise immédiatement l’UI de cette pédale, comme aujourd’hui.

### UC-B2 — Ajouter des pédales supplémentaires

**But** : permettre de créer un board composé de plusieurs pédales.
**Scénario** :

1. L’utilisateur clique sur “Ajouter une pédale” depuis le board.
2. L’app ajoute un nouveau slot vierge avec un sélecteur de modèle et un champ de canal.
3. Une fois un modèle choisi, l’app charge la config (UC-P2) et synchronise son canal dédié.

### UC-B3 — Associer configuration et canal à chaque pédale

**But** : faire cohabiter plusieurs instances indépendantes.
**Scénario** :

1. Pour chaque slot, l’utilisateur choisit un modèle parmi la liste dynamique (UC-P1).
2. Le slot mémorise son canal MIDI (UC-M2) et ses valeurs de contrôles dans localStorage via une clé propre à l’instance.
3. Les actions MIDI (CC/PC) envoyées depuis ce slot utilisent le canal associé sans impacter les autres pédales du board.

### UC-B4 — Dupliquer un modèle sur plusieurs canaux

**But** : autoriser plusieurs exemplaires du même modèle avec des canaux distincts.
**Scénario** :

1. Depuis un slot existant, l’utilisateur choisit “Dupliquer”.
2. L’app crée un nouveau slot reprenant le même modèle, la même config et (optionnel) les valeurs UI courantes.
3. Le canal MIDI est incrémenté ou demandé explicitement pour éviter les collisions.
4. Les deux slots restent indépendants : modification de l’un n’alterne pas l’autre.

### UC-B5 — Réordonner ou supprimer une pédale du board

**But** : gérer l’organisation du board dans le temps.
**Scénario** :

1. Chaque slot propose une action “Supprimer”.
2. L’utilisateur peut également réordonner les slots (glisser-déposer ou boutons monter/descendre) afin de refléter son board physique.
3. L’état du board (ordre, modèles, canaux, valeurs) est persisté en localStorage.
