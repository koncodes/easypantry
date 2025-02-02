<script>
import User from "@/models/User.js";


export default {
  name: "AuthView",
  props: {
    authUser: {
      type: User,
      required: true
    }
  }
};

</script>

<template>
  <div class="container-body max-con auth-con">
    <div class="auth-content auth-left">
        <h1>search by what you have at home</h1>
      </div>
      <div class="auth-form">
        <div class="router-links">
          <router-link to="/login"
            :class="'router-link', { active: $route.path === '/login' }">
              Login
          </router-link>
          <router-link to="/login/register"
            :class="'router-link', { active: $route.path === '/login/register' }">
              Register
          </router-link>
        </div>
        <router-view :authUser="authUser"></router-view>
      </div>
      <div class="auth-content auth-right">
        <h1>join Easy Pantry</h1>
      </div>
  </div>
</template>


<style scoped lang="scss">

.auth-con {
  display: flex;
  gap: 20px;
  flex-direction: row;
}

.auth-content {
  width: 200px;
  flex: .4;
  min-width: 40px;
  max-width: 300px;
  margin-right: 80px;
  margin-left: -80px;
  padding: 20px 0;
  position: relative;
  transform: rotate(10deg); 
  pointer-events: none;

  h1 {
    color: var(--color-sixth);
    max-width: 200px;
    position: absolute;
    font-size: clamp(.9em, 14vw, 2.3em);
  }

  &.auth-left {
    margin-left: 20px;
    margin-right: -20px;
    transform: rotate(-20deg); 
    pointer-events: none;
    

    h1 {
      right: 0;
      bottom: 60px;
      text-align: right;
      min-width: 150px
    }
  }
  &.auth-right {
    h1 {
      left: 0;
    }
  }
}
.auth-form {
  border: 1px solid var(--color-gray-dark);
  padding: 30px 30px 32px;
  border-radius: 10px;
  flex: 1;
  min-width: 330px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
}

.router-links {
  display: flex;
  gap: 10px;
  overflow: hidden;
  position: relative;
}

.router-link {
  padding: 10px 20px;
  background: rgba(var(--color-off-black-rgba) / 10%);
  color: var(--color-sixth);
  position: relative;
  z-index: 1;
  text-decoration: none;
  transition: color 0.3s ease;
  border-radius: 10px;
  font-size: 1.2em;

  &:hover {
    color: var(--color-main);
  }

  &.router-link-exact-active {
    color: var(--color-second);
    background: var(--color-main);
  }
}




</style>
