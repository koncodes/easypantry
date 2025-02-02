<script>
export default {
  name: "AppLoader",
  props: {
    shape: {
      type: String,
      default: "square", 
      validator: (value) => ["square", "circle", "line"].includes(value),
    },
    size: {
      type: String,
    },
    height: {
      type: String,
    },
    borderRadius: {
      type: String,
      default: "5px",
    },
  },
  computed: {
    skeletonStyles() {
      return {
        width: this.size,
        maxWidth: this.size,
        height: this.height || (this.shape === "line" ? "1em" : this.size),
        borderRadius: this.shape === "circle" ? "50%" : this.borderRadius,
      };
    },
  },
};
</script>

<template>
  <div 
    class="skeleton"
    :class="shape"
    :style="skeletonStyles"
    aria-hidden="true">
    <slot></slot>
  </div>
</template>
  
<style scoped>
.skeleton {
    display: flex;
    align-items: center;
    --q-skeleton-speed: 1500ms;
    flex: 0 0 auto; 
    max-width: 100%; 
    box-sizing: border-box; 
    position: relative;
    overflow: hidden;
}
.skeleton::before, .skeleton::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    background: #00000019;
}
.skeleton::before {
    background: linear-gradient(90deg, #0000, #3333331a, #0000);;
    animation: shimmer var(--q-skeleton-speed) linear .5s infinite;;

}

@keyframes shimmer {
    0% {
        transform: translate(-100%);
    }
    100% {
        transform: translate(100%);
    }
}

.skeleton.square {
    --radius: 5px;
}
.skeleton.circle {
    --radius: 50%;
}
.skeleton.line {
    flex: 1 1 auto;
    height: 1em;
}

.skeleton:has(> .skeleton) {
    padding: 0.25em; 
    gap: .1em;
    align-items: center;
}

.skeleton > .skeleton {
  display: inline-block;
}

.skeleton-light, .skeleton-gray {
    background-color: var(--color-off-white);
}
.skeleton-light::before, .skeleton-light::after {
    display: none
}
</style>
