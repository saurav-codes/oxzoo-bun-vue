<script setup>
import { onMounted, ref } from "vue";

// Baked at build time by Vite (envPrefix: ["GREETING_", "VITE_"]). Assembled
// in one expression, not the template, so the value lands in one string in the bundle.
const frontendLine = "hello world oxzoo-bun-vue_" + import.meta.env.GREETING_TAG;

const status = ref("loading");
const backendLine = ref("");

onMounted(async () => {
  try {
    const res = await fetch("/api/greeting");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    backendLine.value = await res.text();
    status.value = "ok";
  } catch {
    status.value = "error";
  }
});
</script>

<template>
  <main>
    <h1>oxzoo-bun-vue</h1>
    <p>frontend: {{ frontendLine }}</p>
    <p v-if="status === 'loading'">backend: loading</p>
    <p v-else-if="status === 'error'">backend: error fetching /api/greeting</p>
    <p v-else>backend: {{ backendLine }}</p>
  </main>
</template>

<style>
body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
  color: #1f2430;
}
h1 {
  font-size: 1.5rem;
}
</style>
