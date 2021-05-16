<template>

  <div>
    <h1> Home Page </h1>
    <el-link v-on:click="events()">Events Page</el-link>
    <br>
    <el-link v-on:click="register()">Register Page</el-link>
    <br>
    <div v-if="VueCookieNext.isCookieAvailable('userToken')">
      <el-link v-on:click="logout()">Log Out</el-link>
    </div>
    <div v-else>
      <el-link v-on:click="login()">Login Page</el-link>
    </div>

  </div>

</template>


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

    const logout = () => {
      VueCookieNext.removeCookie("userToken")
      VueCookieNext.removeCookie("userId")
    }

    return {
      events,
      register,
      login,
      VueCookieNext,
      logout,
    }
  }
}

</script>
