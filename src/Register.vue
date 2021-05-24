<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <div id="register">

      <br>
      <h1> Register </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>

      <br><br>

      <el-card class="box-card">
        <div class="card-body" style="padding-left:0px">
          <el-descriptions class="margin-top" :column=1 border>

            <el-descriptions-item>
              <template #label>
                First Name
              </template>
              <el-input placeholder="Please input" v-model="inputFirst"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Last Name
              </template>
              <el-input placeholder="Please input" v-model="inputLast"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Email Address
              </template>
              <el-input placeholder="Please input" v-model="inputEmail"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Password
              </template>
              <el-input placeholder="Please input" v-model="inputPass" show-password></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Upload Profile Picture (Optional)
              </template>
              <input type="file" @change="getImage" name="img" accept="image/png, image/gif, image/jpeg">
            </el-descriptions-item>

          </el-descriptions>
        </div>

        <div class="event-card-bottom">
          <el-button type="primary" v-on:click="registerUser()">Register</el-button>
        </div>
      </el-card>

    </div>
  </div>

</template>


<style>

#register {
  text-align: center;
}

td, th {
  text-align: center;
}

.box-card {
  max-width: 1000px !important;
}

.card-body {
  max-width: 1000px;
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
          VueCookieNext.setCookie("userIdEventsApp", response.data.userId)
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
        VueCookieNext.setCookie("userTokenEventsApp", response.data.token)

        if (selectedImage.value != null) {
          axios.put("http://localhost:4941/api/v1/users/" + VueCookieNext.getCookie("userIdEventsApp")
              + "/image", selectedImage.value,
              {
                headers: {
                  "Content-Type": selectedImageType.value,
                  "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
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
