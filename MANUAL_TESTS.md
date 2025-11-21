# Tests manuels – Board multi-pédales

## Première visite sans pédale
1. Ouvrir l’éditeur dans un contexte sans stockage (onglet privé ou en supprimant `pedal-board:v2` du `localStorage`).
2. Vérifier que la page affiche un message indiquant qu’aucune pédale n’est présente et propose d’en ajouter une.
3. Cliquer sur « Ajouter une pédale » et confirmer que la fenêtre d’ajout s’ouvre pour créer la première pédale.

## Ajout d’une pédale
1. Lancer `npm run dev` et ouvrir l’éditeur dans le navigateur.
2. Cliquer sur « Ajouter une pédale ».
3. Vérifier qu’un nouveau bloc apparaît avec le premier modèle pré-sélectionné et un canal MIDI suggéré.
4. Changer le modèle et confirmer que les contrôles se mettent à jour.

## Suppression de toutes les pédales
1. Supprimer les pédales une par une.
2. Vérifier qu’aucune pédale n’est recréée automatiquement et que le message d’invitation à ajouter une pédale réapparaît.
3. Cliquer sur « Ajouter une pédale » pour confirmer que l’on peut repartir d’un board vide.

## Duplication d’une pédale existante
1. Dans un bloc existant, cliquer sur l’icône « Dupliquer ».
2. Vérifier qu’un nouveau bloc est ajouté avec le même modèle et les mêmes valeurs de contrôles.
3. Observer que le canal MIDI de la copie est incrémenté (ou attribué automatiquement si le canal suivant n’est pas disponible).
4. Modifier un contrôle dans la copie et confirmer que l’original ne change pas.

## Persistance après rechargement
1. Configurer plusieurs blocs (ajouts, duplications, modifications de canal/valeurs).
2. Recharger la page (⌘R/CTRL+R).
3. Vérifier que les blocs, leur ordre, les canaux et les valeurs de contrôles sont restaurés.
