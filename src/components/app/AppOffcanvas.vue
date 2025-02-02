<script>
import { Offcanvas } from 'bootstrap';
export default {
    name: "AppOffcanvas",
    data: function(){
        return {
            offcanvas: null,
        }
    },
    props: {
        title: {
          type : String,
        },
        id: {
            type: String,
            default: 'app-offcanvas-' + Math.floor(Math.random() * 10e16), 
        },
        placement: {
          type: String, 
          default: 'end',
        },
    },

    mounted(){
        this.offcanvas = new Offcanvas(this.$refs.myOffcanvas);
    },

    methods: {
        close(){
            this.offcanvas.hide();
        },

        open(){
            this.offcanvas.show();
        },
    },
}
</script>

<template>
    <teleport to="body">
        <div ref="myOffcanvas" :class="'offcanvas offcanvas-' + placement" :id="id" tabindex="-1" :aria-labelledby="'offcanvas' + placement + 'Label'">
          <div :class="['offcanvas-body', (placement === 'top' || placement === 'bottom') ? 'small' : '']">
            <div class="off-canvas-close">
              <button type="button" class="btn-close text-reset" @click="close" aria-label="Close">
                <i class="bi bi-x"></i>
              </button>
            </div>
              <div v-if="title" class="offcanvas-header">
                <h5 class="offcanvas-title">{{ title }}</h5>
              </div>
              <slot></slot>
          </div>
        </div>
    </teleport>
</template>

<style scoped>
    
</style>