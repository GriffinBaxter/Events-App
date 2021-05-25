<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <div id="login">

      <br>
      <h1> Login </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>

      <br><br>

      <el-card class="box-card">
        <div class="card-body" style="padding-left:0px">
          <el-descriptions class="margin-top" :column=1 border>

            <el-descriptions-item>
              <template #label>
                Email Address
              </template>
              <el-input placeholder="Please input" v-on:keypress.enter="loginUser()"
                        v-model="inputEmail"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Password
              </template>
              <el-input placeholder="Please input" v-on:keypress.enter="loginUser()"
                        v-model="inputPass" show-password></el-input>
            </el-descriptions-item>

          </el-descriptions>
        </div>

        <div class="event-card-bottom">
          <el-button type="primary" v-on:click="loginUser()">Login</el-button>
        </div>
      </el-card>

    </div>
  </div>

</template>


<style>

#login {
  text-align: center;
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
        VueCookieNext.setCookie("userTokenEventsApp", response.data.token)
        VueCookieNext.setCookie("userIdEventsApp", response.data.userId)
        home();
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
