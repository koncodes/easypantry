<script>
import LoginComponent from "@/components/LoginComponent.vue";
import User from "@/models/User.js";

export default {
  name: "LoginView",
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
    <login-component :authUser="authUser" title="Login" button="Login"></login-component>
</template>


<style scoped lang="scss">
</style>
