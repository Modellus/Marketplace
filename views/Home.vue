<template>
  <section class="page">
    <h1 class="visually-hidden">Home</h1>

    <div class="section">
      <h2 class="section-title">Apps and Games We Love Right Now</h2>
      <DxGallery
        :items="galleryItems"
        :show-nav-buttons="true"
        :indicator-enabled="false"
        :height="280"
        :stretch-images="true"
      >
        <template #item="{ data }">
          <div class="gallery-slide" :style="{ backgroundImage: `url(${data.imageSrc})` }">
            <div class="gallery-caption">
              <small>Major Update</small>
              <div class="title">{{ data.title }}</div>
              <div class="subtitle">{{ data.subtitle }}</div>
            </div>
          </div>
        </template>
      </DxGallery>
    </div>

    <div class="section">
      <h2 class="section-title">Apps and Games We Love Right Now</h2>
      <DxCardView
        :data-source="apps"
        key-expr="id"
        cards-per-row="auto"
        :card-min-width="300"
        :card-max-width="360"
        :word-wrap-enabled="true"
        :hover-state-enabled="false"
      >
        <template #cardTemplate="{ data }">
          <div class="app-card">
            <img class="app-icon" :src="data.icon" alt="" />
            <div class="app-meta">
              <div class="app-name">{{ data.name }}</div>
              <div class="app-desc">{{ data.description }}</div>
            </div>
            <button class="btn get">{{ data.cta }}</button>
          </div>
        </template>
      </DxCardView>
    </div>
  </section>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import DxGallery from 'devextreme-vue/gallery';
import DxCardView from 'devextreme-vue/card-view';

const store = useAppStore();

const galleryItems = [
  { imageSrc: 'https://picsum.photos/seed/gal1/1200/600', title: 'Find the truth in Lies of P', subtitle: "You'll love this twisted take on Pinocchio." },
  { imageSrc: 'https://picsum.photos/seed/gal2/1200/600', title: 'Master Your Mac', subtitle: 'Snap screenshots like a pro.' },
  { imageSrc: 'https://picsum.photos/seed/gal3/1200/600', title: 'Deep Dive', subtitle: 'Drive like a daredevil!' },
];

const apps = [
  { id: 1, name: 'Harold Halibut', description: 'Handcrafted adventure undersea', cta: 'Buy', icon: 'https://picsum.photos/seed/app1/64' },
  { id: 2, name: 'Author', description: 'Minimalist, powerful writing', cta: 'Buy', icon: 'https://picsum.photos/seed/app2/64' },
  { id: 3, name: 'Tot', description: 'Your tiny text companion', cta: 'Get', icon: 'https://picsum.photos/seed/app3/64' },
  { id: 4, name: 'Portal – Escape Into Nature', description: 'Focus, Sleep, Relax, Sounds', cta: 'Get', icon: 'https://picsum.photos/seed/app4/64' },
  { id: 5, name: 'Video Effect Vfx Editor Riveo', description: 'AI masking, background removal', cta: 'Get', icon: 'https://picsum.photos/seed/app5/64' },
  { id: 6, name: 'Presentify', description: 'Screen Draw. Highlight.', cta: '9,99 €', icon: 'https://picsum.photos/seed/app6/64' },
];
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.section { background: rgba(255,255,255,0.02); border: 1px solid var(--c-border); border-radius: 12px; padding: 1rem; }
.section-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.75rem; }

/* Gallery */
.gallery-slide { height: 280px; background-size: cover; background-position: center; border-radius: 10px; position: relative; overflow: hidden; }
.gallery-caption { position: absolute; left: 1rem; bottom: 1rem; padding: 1rem; background: linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.55)); border-radius: 8px; }
.gallery-caption .title { font-size: 1.25rem; font-weight: 700; }
.gallery-caption small { color: #cbd5e1; text-transform: uppercase; letter-spacing: .04em; }

/* Cards */
.app-card { display: grid; grid-template-columns: 48px 1fr auto; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--c-border); border-radius: 12px; background: rgba(255,255,255,0.02); }
.app-icon { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }
.app-meta { overflow: hidden; }
.app-name { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-desc { color: var(--c-muted); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn.get { background: var(--c-link); color: #0b0c10; border: none; padding: 0.35rem 0.8rem; border-radius: 999px; cursor: pointer; font-weight: 600; }
.btn.get:hover { opacity: 0.9; }

.visually-hidden { position: absolute; left: -9999px; }
</style>
