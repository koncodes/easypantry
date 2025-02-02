<script>
  export default {
    name: 'AppSplash',
    data() {
      return {
        isVisible: true,
      };
    },
    methods: {
      skipIntro() {
        this.isVisible = false;
      }
    }
  };
</script>

<template>
    <div v-if="isVisible" class="intro-screen">
        <div class="content">
        <h1>Welcome to My App!</h1>
        <p>Your personal pantry assistant. Let's get started!</p>
        <button @click="skipIntro" class="btn skip-button">Skip Intro</button>
        </div>
    </div>
</template>
  
<style scoped>
    .intro-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-off-white);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        z-index: 1041;
    }

    .content {
        text-align: center;
    }
</style>
