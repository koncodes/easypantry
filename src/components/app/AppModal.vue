<script>
import { Modal } from 'bootstrap';
export default {
    name: "AppModal",
    data: function(){
        return {
            modal: null,
        }
    },
    props: {
        title: {
          type : String,
          required: true,
        },
        id: {
            type: String,
            default: 'app-offcanvas-' + Math.floor(Math.random() * 10e16), 
        }
    },

    mounted(){
        this.modal = new Modal(this.$refs.myModal);
    },

    methods: {
        close(){
            this.modal.hide();
        },

        open(){
            this.modal.show();
        },
    },
}
</script>

<template>
    <teleport to="body">
        <div ref="myModal" class="modal fade" :id="id" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
            <div class="modal-margin">
              
              <div class="modal-content">
                <div class="off-canvas-close">
                  <button type="button" class="btn-close text-reset" @click="close" aria-label="Close">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="modal-header">
                    <slot name="header">
                        <h5 class="modal-title" id="modalTitle">{{title}}</h5>
                    </slot>
                  </div>
                  <slot>Modal Body Goes Here</slot>
                  <div class="modal-footer">
                    <slot name="footer"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </teleport>
</template>

<style scoped>
    
</style>