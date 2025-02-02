<script>
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,onAuthStateChanged, signInAnonymously} from "firebase/auth";
import UserCollection from "@/firebase/UserCollection.js";
import GoogleButton from "@/components/GoogleButton.vue";
import User from "@/models/User.js";
import router from "@/router";
import {auth, authProvider} from "@/firebase/index.js";


export default {
    name: "LoginComponent",
    components: {GoogleButton},
    inject: ["login", "logout"],
    props: {
      title: {
        type: String,
        default: "Login",
      },
      button: {
        type: String,
        default: "Login",
      }
    },
      data() {
          return {
              authUser: new User(false),
              email: "",
              password: "",
          };
    },
    methods: {
      async handleAuth(action, ...args) {
        try {
          const result = await action(auth, ...args);
          router.push('/');
          this.authUser = result.user;
          console.log(`${action.name} Successful`, result.user);
          
        } catch (error) {
          console.error(`${action.name} Failed`, error.message);
        }
      },
      async signupWithEmailPassword() {
        await this.handleAuth(createUserWithEmailAndPassword, this.email, this.password);
      },
      async loginWithEmailPassword() {
        await this.handleAuth(signInWithEmailAndPassword, this.email, this.password);
        console.log('email/password login')
      },
      async loginWithGoogle() {
        await this.handleAuth(signInWithPopup, authProvider);
      },
      async loginAsGuest() {
        await this.handleAuth(signInAnonymously);
      }
  },
  created() {
    onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        // logged in
        console.log('logged in' + firebaseUser);
        UserCollection.getUser(firebaseUser.uid)
            .then(dbUser => {
              if (dbUser && dbUser.exists()) {
                return dbUser;
              } else {
                const newUser = new User(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email, firebaseUser.photoURL, firebaseUser.isAnonymous);
                console.log('Creating new user.', newUser);
                return UserCollection.setUser(newUser);
              }
            })
            .then(() => {
              UserCollection.syncUser(firebaseUser.uid, this.authUser);
              console.log('user' + this.authUser);
            })
            .catch(error => console.error('Error with login.', {firebaseUser, error}));

      } else {
        // logged out
        console.log('logged out');
        this.authUser = new User();
      }
    });
  },
};
</script>

<template>
    <div class="login-con">
      <form class="login-form">
        <div class="input-con">
          <label>Email Address</label>
          <input v-model="email" type="email" placeholder="Enter email" class="form-control"/>
        </div>
        <div class="input-con">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" class="form-control"/>
        </div>
        <button v-if="title === 'Register'"  @click.prevent="signupWithEmailPassword" class="btn">Sign up with Email/Password</button>
        <button v-else @click.prevent="loginWithEmailPassword" class="btn">Login with Email and Password</button>
      </form>
      <div class="login-or">Or</div>
      <button @click.prevent="loginWithGoogle" class="btn btn-google">
        <google-button>{{ title }} with Google</google-button>
      </button>
      <button @click.prevent="loginAsGuest" class="btn">{{ title }} as Guest</button>
    </div>
</template>

<style scoped lang="scss">

$breakpoints: (
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

@mixin min-width($size) {
  @media screen and (min-width: map-get($breakpoints, $size)) {
    @content;
  }
}

.login-con {
    display: flex;
    flex-direction: column;
    gap: 15px;

    @include min-width(xl) {
      font-size: 1.1em
    }

    .login-form {
      display: flex; 
      flex-direction: column;
      gap: 5px;
      letter-spacing: .5px;
      font-size: .95em;

      .input-con {
        display: flex; 
        flex-direction: column;
        gap: 5px;
      }
      button {
        margin: 10px 0 0;
      }
    }
    
    button {
        border-radius: 10px;
        margin: 0;
        background: rgba(var(--color-off-black-rgba) / 10%);
        color: var(--color-off-black);

        &.btn-google {
          margin: 0 0 0px;

        }

        &:hover {
          background: var(--color-main);
          color: var(--color-off-white);
        }
    }

    .login-or {
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 1px;

      &::before, &::after {
        content: '';
         display: inline-block;
         width: 100%;
         height: 1px;
         background-color: #ccc;
         margin: 0 20px 0 0;
         flex: 1;
      }
      &::after {
        margin: 0 0 0 20px;
      }
    }
}

button {
    margin: 10px;
}
</style>
 