<script>
import useToasterStore from "@/stores/useToasterStore";

export default {
  components: {  },
  setup() {
    const toastStore = useToasterStore();
    const toastClassMap = {
      warning: "warning",
      error: "error",
      success: "success",
    };
    return {
      toastStore,
      toastClassMap,
    };
  },
};
</script>

<template>
    <div class="toaster__wrapper">
      <TransitionGroup name="toast" tag="ul" class="toaster__list">
        <li
          v-for="toast in toastStore.toasts"
          :class="['toaster__inner', toastClassMap[toast.status]]"
          :key="toast.id"
        >
          <i v-if="toast.status == 'success'" class="bi bi-check-circle-fill"></i>
          <i v-if="toast.status == 'error' || toast.status == 'warning'" class="bi bi-exclamation-circle-fill"></i>
          <span class="toaster__inner-text">
            {{ toast.text }}
          </span>
        </li>
      </TransitionGroup>
    </div>
</template>



<style scoped lang="scss">
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
