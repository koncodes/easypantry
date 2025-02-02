<script>
import LoginComponent from "@/components/LoginComponent.vue";
import User from "@/models/User.js";


export default {
  name: "RegisterView",
  components: {LoginComponent},
  props: {
    authUser: {
      type: User,
      required: true
    }
  }
};

</script>

<template>
    <login-component :authUser="authUser" title="Register" button="Register"></login-component>
</template>


<style scoped lang="scss">
</style>
