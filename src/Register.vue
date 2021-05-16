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

    <div id="register">

      <el-link v-on:click="home()">Home Page</el-link>

      <br>

      First Name: <el-input placeholder="Please input" v-model="inputFirst"></el-input>

      Last Name: <el-input placeholder="Please input" v-model="inputLast"></el-input>

      Email Address: <el-input placeholder="Please input" v-model="inputEmail"></el-input>

      Password: <el-input placeholder="Please input" v-model="inputPass" show-password></el-input>

      Upload Profile Picture (Optional): <input type="file" @change="getImage" name="img"
                                                accept="image/png, image/gif, image/jpeg">

      <br>

      <el-button v-on:click="registerUser()">Register</el-button>

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
    background-color: inherit!important;
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
import { VueCookieNext } from 'vue-cookie-next'

export default {
  name: 'Register',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const inputFirst = ref("")
    const inputLast = ref("")
    const inputEmail = ref("")
    const inputPass = ref("")
    const selectedImage = ref(null)
    const selectedImageType = ref(null)

    const getImage = (event) => {
      try {
        selectedImageType.value = event.target.files[0].type
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage.value = e.target.result
        }
        reader.readAsArrayBuffer(event.target.files[0])
      } catch (e) {
        console.log(e)
      }
    }

    const registerUser = () => {
      errorFlag.value = false;

      if (selectedImageType.value !== "image/png" &&
          selectedImageType.value !== "image/jpeg" &&
          selectedImageType.value !== "image/gif" &&
          selectedImageType.value != null) {
        error.value = "Profile picture must be an image (PNG, JPEG or GIF)"
        errorFlag.value = true;
      } else if (inputFirst.value.length < 1) {
        error.value = "First name must be provided"
        errorFlag.value = true;
      } else if (inputLast.value.length < 1) {
        error.value = "Last name must be provided"
        errorFlag.value = true;
      } else if (!inputEmail.value.includes('@')) {
        error.value = "Email address must be syntactically valid (contains '@' symbol)"
        errorFlag.value = true;
      } else if (inputPass.value.length < 8) {
        error.value = "Password must be at least 8 characters in length"
        errorFlag.value = true;
      } else {
        axios.post("http://localhost:4941/api/v1/users/register", {
          firstName: inputFirst.value,
          lastName: inputLast.value,
          email: inputEmail.value,
          password: inputPass.value,
        }).then((response) => {
          VueCookieNext.setCookie("userId", response.data.userId)
          loginUser()
        }, () => {
          error.value = "Invalid registration (Email address may already be in use)";
          errorFlag.value = true;
        })
      }
    }

    const loginUser = () => {
      axios.post("http://localhost:4941/api/v1/users/login", {
        email: inputEmail.value,
        password: inputPass.value,
      }).then((response) => {
        VueCookieNext.setCookie("userToken", response.data.token)

        if (selectedImage.value != null) {
            axios.put("http://localhost:4941/api/v1/users/" + VueCookieNext.getCookie("userId")
                + "/image", selectedImage.value,
                {
                  headers: {
                    "Content-Type": selectedImageType.value,
                    "X-Authorization": VueCookieNext.getCookie("userToken"),
                  }
                })
                .then(() => {
                  router.push("/events")
                })
        } else {
          router.push("/events")
        }
      })
    }

    const home = () => {
      router.push("/")
    }

    return {
      error,
      errorFlag,
      home,
      inputFirst,
      inputLast,
      inputEmail,
      inputPass,
      registerUser,
      getImage,
    }
  }
}

</script>
