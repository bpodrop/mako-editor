## 1. Gestion du MIDI

### UC-M1 — Sélectionner / rafraîchir la sortie MIDI

**But** : choisir l’interface physique utilisée pour les envois CC/PC.
**Scénario** :
1. L’utilisateur ouvre le menu (bouton engrenage).
2. La liste des sorties disponibles est chargée via Web MIDI (`navigator.requestMIDIAccess`).
3. L’utilisateur choisit une sortie dans la liste.
4. Option « Rafraîchir » : relit les sorties disponibles et conserve la sélection si elle existe encore.

---

### UC-M2 — Affecter le canal MIDI à une pédale

**But** : envoyer CC/PC sur le bon canal pour chaque instance.
**Scénario** :
1. Lors de l’ajout ou l’édition d’une pédale, le dialogue propose les canaux 1–16.
2. Un canal libre est suggéré automatiquement (si disponible).
3. Le canal choisi est enregistré pour cette instance et utilisé sur tous les envois CC/PC de la carte.

---

## 2. Gestion des pédales (board)

### UC-P1 — Charger les modèles disponibles

**But** : baser la liste sur les JSON présents dans `src/config/`.
**Scénario** :
1. Au chargement, l’app lit tous les `*.json` via `import.meta.glob`.
2. Les modèles sont triés par nom et exposés dans les sélecteurs (fr/en).
3. Aujourd’hui : D1, M1, R1, ACS1.

---

### UC-P2 — Ajouter une pédale au board

**But** : instancier une pédale avec son modèle et son canal.
**Scénario** :
1. L’utilisateur clique sur « Ajouter une pédale » (+ dans le navigateur latéral).
2. Il choisit le modèle et le canal dans le dialogue.
3. L’app crée une instance (ID unique), applique le canal, et l’affiche comme carte active.
4. L’instance et ses valeurs commitées sont persistées dans `localStorage`.

---

### UC-P3 — Sélectionner la pédale active

**But** : afficher/contrôler une seule carte à la fois.
**Scénario** :
1. Le panneau latéral liste les instances (nom, canal, état dirty).
2. Un clic ou Enter/Espace sélectionne l’instance.
3. Seule la carte sélectionnée est visible dans la grille (vue compacte sur mobile).

---

### UC-P4 — Modifier modèle et canal d’une pédale

**But** : changer le périphérique ou son canal après coup.
**Scénario** :
1. Depuis la carte, clic sur « Éditer » ouvre le même dialogue que l’ajout.
2. L’utilisateur choisit un nouveau modèle et/ou canal.
3. La carte est mise à jour; les valeurs commitées restent associées à l’instance (si device identique), sinon les valeurs sont rechargées selon l’état stocké pour ce couple instance+pédale.

---

### UC-P5 — Supprimer une pédale

**But** : nettoyer le board et les valeurs associées.
**Scénario** :
1. Depuis la liste latérale, clic sur « Supprimer » puis confirmation.
2. L’instance est retirée du board.
3. Les valeurs persistées pour cette instance sont supprimées de `localStorage`.

---

### UC-P6 — Restaurer l’état du board

**But** : retrouver la configuration à chaque visite.
**Scénario** :
1. Au chargement, l’app lit le board depuis `localStorage` (`pedal-board:v2`).
2. Si trouvé, elle reconstruit les instances (modèle, canal, ordre, IDs).
3. Les valeurs commitées de chaque instance sont rechargées et servent de base pour les modes Live/Preset.

---

## 3. Modes d’interaction (Live vs Preset)

### UC-MODE1 — Basculer Live / Preset

**But** : choisir le mode d’édition.
**Scénario** :
1. Un switch global (ModeToggle) propose Live ou Preset.
2. Le choix est stocké dans `localStorage` (`midi-mode`) et restauré au rechargement.

---

### UC-MODE2 — Afficher le mode actif

**But** : clarifier le comportement des contrôles.
**Scénario** :
1. Le switch affiche l’option active.
2. En mode Preset, un badge « modifications en attente » apparaît sur la carte lorsqu’il y a des changements non appliqués.

---

## 4. Gestion des contrôles (Live / Preset)

### UC-C1 — Modifier un contrôle en mode Live

**But** : envoyer immédiatement les CC.
**Scénario** :
1. Mode Live actif.
2. L’utilisateur ajuste un contrôle (range, enum, zoneEnum, toggle, momentary).
3. L’app envoie le CC avec la valeur et le canal de l’instance, puis enregistre la valeur comme commité.
4. Un message de statut mentionne l’envoi Live.

---

### UC-C2 — Modifier des contrôles en mode Preset (sans envoi)

**But** : préparer un lot de changements.
**Scénario** :
1. Mode Preset actif.
2. L’utilisateur change un ou plusieurs contrôles.
3. Aucun CC n’est envoyé; les valeurs restent en brouillon.
4. La carte indique le nombre de contrôles « dirty ».

---

### UC-C3 — Appliquer les changements en mode Preset

**But** : envoyer les valeurs modifiées en séquence.
**Scénario** :
1. Bouton « Appliquer » disponible si des contrôles sont dirty.
2. L’app envoie chaque CC dirty (courte pause entre chacun), avec le canal de l’instance.
3. Les brouillons deviennent les valeurs commitées; le compteur dirty retombe à zéro.

---

### UC-C4 — Annuler les changements en mode Preset

**But** : revenir aux valeurs commitées sans envoyer de CC.
**Scénario** :
1. Bouton « Annuler » disponible si des contrôles sont dirty.
2. L’app restaure les valeurs commitées dans l’UI.
3. Aucun message MIDI n’est envoyé.

---

## 5. Program Change et banques

### UC-PR1 — Envoyer un Program Change manuel

**But** : rappeler un preset interne de la pédale.
**Scénario** :
1. L’utilisateur saisit un numéro dans la plage configurée (`pc.range`).
2. Clic sur « Select » envoie un PC sur le canal de l’instance, quel que soit le mode.
3. L’UI affiche le preset actif (numéro/bank si disponible).

---

### UC-PR2 — Utiliser les banques / presets prédéfinis

**But** : fournir des boutons rapides lorsque `pc.banks` est présent.
**Scénario** :
1. L’utilisateur choisit une banque dans la liste (A/B/C…).
2. Les boutons de presets de la banque sont affichés.
3. Clic sur un preset envoie éventuellement le CC de banque (cf. UC-PR3) puis le PC associé.
4. Si un preset indique une plage `[min, max]`, la valeur min est préremplie dans le champ manuel.

---

### UC-PR3 — Aligner la banque via CC dédié

**But** : synchroniser la pédale avant d’envoyer le PC.
**Scénario** :
1. Si un contrôle `bankSwitch` existe dans la config, la sélection de banque calcule la valeur (enum ou centre de zone).
2. L’app envoie ce CC `bankSwitch` sur le canal de l’instance avant le PC.

---

## 6. Import / Export de presets (fichiers JSON)

### UC-IO1 — Exporter l’état d’une pédale

**But** : sauvegarder un snapshot portable.
**Scénario** :
1. Clic sur « Export » dans la carte.
2. L’app génère un JSON :
   - `$schema`: `mako-editor:preset`
   - `device`: modèle de la carte
   - `channel`: canal courant
   - `values`: valeurs commitées des contrôles
   - `exportedAt`: horodatage ISO
3. Le fichier est téléchargé (nom inclut le device et la date).

---

### UC-IO2 — Importer un preset depuis un fichier

**But** : restaurer un état sans envoyer de MIDI.
**Scénario** :
1. Clic sur « Import » ouvre un sélecteur de fichier JSON.
2. L’app lit/parse le fichier, vérifie `device` + `values`.
3. Si le device existe, la carte est mise à jour vers ce device; `channel` importé est appliqué le cas échéant.
4. Les valeurs importées sont normalisées sur les contrôles connus, appliquées dans l’UI et persistées.
5. Aucun CC/PC n’est envoyé lors de l’import; en mode Preset, l’utilisateur peut encore appliquer/annuler.

---

## 7. Persistance et autres éléments

* **Board & valeurs** : `localStorage` stocke le board (`pedal-board:v2`) et les valeurs commitées par instance.
* **Locale & mode** : la langue (en/fr) et le mode Live/Preset sont persistés et restaurés.
* **PWA** : l’app enregistre un service worker (vite-plugin-pwa) pour l’installation et un cache de base.
