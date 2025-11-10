<template>
  <div class="legal-page container">
    <header class="legal-header">
      <button class="link-btn back-link" type="button" @click="navigateHome">
        ← Retour à l'éditeur
      </button>
      <h1>Légal</h1>
      <p class="legal-note">
        Mentions légales, clause de non-responsabilité et information sur la propriété intellectuelle.
      </p>
    </header>

    <section class="card legal-section">
      <h2>Clause de non-responsabilité et respect de la propriété intellectuelle</h2>
      <p>
        Cette application est un projet <strong>indépendant</strong> développé sans aucun lien commercial, technique ou juridique avec
        <strong> Walrus Audio</strong>.
      </p>
      <p>
        Toutes les marques, noms, visuels et produits mentionnés (y compris les pédales de la série Walrus Audio MAKO)
        sont la <strong>propriété exclusive de Walrus Audio</strong>. Ils sont cités uniquement à des fins d’identification et d’interopérabilité.
      </p>
      <p>
        Le développeur de cette application <strong>ne revendique aucun droit</strong> sur ces éléments et <strong>ne représente pas</strong>
        Walrus Audio. Walrus Audio <strong>n’est pas responsable</strong> du contenu, du fonctionnement ou des conséquences de l’utilisation de cette application.
      </p>
    </section>

    <section class="card legal-section">
      <h2>Absence de garantie et limitation de responsabilité</h2>
      <p>
        L'application est fournie « telle quelle », sans garantie expresse ou implicite, y compris toute garantie de bon fonctionnement,
        d’exactitude, de disponibilité, d’absence de défauts ou d’adéquation à un usage particulier.
      </p>
      <p>
        Vous utilisez l’application à vos propres risques. En aucune circonstance le développeur ne pourra être tenu responsable de pertes
        ou dommages de quelque nature que ce soit, directs ou indirects, résultant de l’utilisation ou de l’impossibilité d’utiliser l’application.
        Aucun dommage, qu’il soit lié ou non à l’application, ne pourra lui être imputé.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
function navigateHome() {
  void router.push({ name: 'home' });
}
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding-top: 2rem;
}
.legal-header {
  margin-bottom: 1.5rem;
}
.legal-note {
  color: var(--muted);
  margin: 0.25rem 0 0;
}
.back-link {
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.legal-section + .legal-section {
  margin-top: 1rem;
}
.legal-section p {
  margin: 0 0 0.75rem;
}
.legal-section p:last-child {
  margin-bottom: 0;
}
</style>
