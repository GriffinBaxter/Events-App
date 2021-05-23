<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <br>

    <div id="login">

      <el-link v-on:click="home()">Home Page</el-link>

      <br>

      Email Address:
      <el-input placeholder="Please input" v-model="inputEmail"></el-input>

      Password:
      <el-input placeholder="Please input" v-model="inputPass" show-password></el-input>

      <el-button v-on:click="loginUser()">Login</el-button>

    </div>
  </div>

</template>


<style>

.search-box {
  max-width: 500px;
  margin: 0 auto;
}

td, th {
  text-align: center;
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: inherit !important;
}

.event-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  max-width: 1200px;
  margin: auto;
}

</style>


<script>

import axios from "axios";
import {ref} from 'vue'
import {useRouter} from 'vue-router' //imports router function we need
import {VueCookieNext} from 'vue-cookie-next'

export default {
  name: 'Register',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const inputEmail = ref("")
    const inputPass = ref("")

    const loginUser = () => {
      axios.post("http://localhost:4941/api/v1/users/login", {
        email: inputEmail.value,
        password: inputPass.value,
      }).then((response) => {
        VueCookieNext.setCookie("userToken", response.data.token)
        VueCookieNext.setCookie("userId", response.data.userId)
        router.push("/events")
      }, () => {
        error.value = "Invalid login credentials";
        errorFlag.value = true;
      })
    }

    const home = () => {
      router.push("/")
    }

    return {
      error,
      errorFlag,
      home,
      inputEmail,
      inputPass,
      loginUser,
    }
  }
}

</script>
