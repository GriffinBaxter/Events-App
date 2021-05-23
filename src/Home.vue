<template>

  <div id="home">
    <br>
    <h1> Events App </h1>
    <br>
    <el-button v-on:click="events()">Events Page</el-button>
    <br><br>
    <el-button v-on:click="register()">Register</el-button>
    <br><br>
    <el-button v-if="VueCookieNext.isCookieAvailable('userTokenEventsApp')"
               v-on:click="profile()">View Profile</el-button>
    <div v-if="VueCookieNext.isCookieAvailable('userTokenEventsApp')"><br></div>
    <el-button v-if="VueCookieNext.isCookieAvailable('userTokenEventsApp')"
               v-on:click="logout()">Log Out</el-button>
    <el-button v-else v-on:click="login()">Log In</el-button>

  </div>

</template>


<style>

#home {
  text-align: center;
}

.el-button {
  width: 150px;
}

</style>


<script>

import {useRouter} from 'vue-router' //imports router function we need
import { VueCookieNext } from 'vue-cookie-next'

export default {
  name: 'Home',
  setup() {
    const router = useRouter() //initialises our router object

    const events = () => {
      router.push("/events");
    }

    const register = () => {
      router.push("/register");
    }

    const login = () => {
      router.push("/login");
    }

    const profile = () => {
      router.push("/profile")
    }

    const logout = () => {
      VueCookieNext.removeCookie("userTokenEventsApp")
      VueCookieNext.removeCookie("userIdEventsApp")
      router.go(0) // refresh page
    }

    return {
      events,
      register,
      login,
      VueCookieNext,
      logout,
      profile,
    }
  }
}

</script>
