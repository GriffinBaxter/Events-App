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
      <h1> Edit Profile </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>
      <el-button v-on:click="profile()">View Profile</el-button>

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
                Change Password
              </template>
              <el-checkbox v-model="checkedChangePass">Change Password</el-checkbox>
            </el-descriptions-item>

            <div v-if="checkedChangePass">
              <el-descriptions-item>
                <template #label>
                  Current Password
                </template>
                <el-input placeholder="Please input" v-model="inputCurrentPass" show-password></el-input>
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  New Password
                </template>
                <el-input placeholder="Please input" v-model="inputNewPass" show-password></el-input>
              </el-descriptions-item>
            </div>

            <div v-if="imageExists">
              <el-descriptions-item>
                <template #label>
                  Delete Profile Picture
                </template>
                <el-checkbox v-model="checkedDeletePicture">Delete Profile Picture</el-checkbox>
              </el-descriptions-item>

              <div v-if="!checkedDeletePicture">
                <el-descriptions-item>
                  <template #label>
                    Change Profile Picture (Optional)
                  </template>
                  <input type="file" @change="getImage" name="img" accept="image/png, image/gif, image/jpeg">
                </el-descriptions-item>
              </div>
            </div>

            <div v-else>
              <el-descriptions-item>
                <template #label>
                  Upload Profile Picture (Optional)
                </template>
                <input type="file" @change="getImage" name="img" accept="image/png, image/gif, image/jpeg">
              </el-descriptions-item>
            </div>

          </el-descriptions>
        </div>

        <div class="event-card-bottom">
          <el-button type="primary" v-on:click="registerUser()">Edit User</el-button>
        </div>
      </el-card>

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
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router' //imports router function we need
import {VueCookieNext} from 'vue-cookie-next'

export default {
  name: 'ProfileEdit',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const inputFirst = ref("")
    const inputLast = ref("")
    const inputEmail = ref("")
    const inputCurrentPass = ref("")
    const inputNewPass = ref("")
    const selectedImage = ref(null)
    const selectedImageType = ref(null)
    const checkedChangePass = ref(false)
    const imageExists = ref(false)
    const checkedDeletePicture = ref(false)
    const userId = ref(0)

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
      } else if (checkedChangePass.value && inputNewPass.value.length < 8) {
        error.value = "New password must be at least 8 characters in length"
        errorFlag.value = true;
      } else {
        let data = {
          firstName: inputFirst.value,
          lastName: inputLast.value,
          email: inputEmail.value,
        }
        if (checkedChangePass.value) {
          data.password = inputNewPass.value;
          data.currentPassword = inputCurrentPass.value;
        }
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
          }
        }
        axios.patch("http://localhost:4941/api/v1/users/" + userId.value, data, config)
            .then(() => {
              if (checkedDeletePicture.value) {
                axios.delete("http://localhost:4941/api/v1/users/" + userId.value + "/image", config)
                    .then(() => {
                      router.push("/profile")
                    })
              } else if (selectedImageType.value != null) {
                config.headers["Content-Type"] = selectedImageType.value
                axios.put("http://localhost:4941/api/v1/users/" + userId.value + "/image",
                    selectedImage.value, config)
                    .then(() => {
                      router.push("/profile")
                    })
              } else {
                router.push("/profile")
              }
            }, () => {
              error.value = "Invalid user edit (Email address may already be in use or current password is incorrect)";
              errorFlag.value = true;
            })
      }
    }

    const populateValues = () => {
      if (VueCookieNext.isCookieAvailable("userIdEventsApp") &&
          VueCookieNext.isCookieAvailable("userIdEventsApp")) {
        userId.value = VueCookieNext.getCookie("userIdEventsApp");
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
          }
        }
        axios.get("http://localhost:4941/api/v1/users/" + userId.value, config)
            .then((response) => {
              inputFirst.value = response.data.firstName;
              inputLast.value = response.data.lastName;
              inputEmail.value = response.data.email;

              axios.get("http://localhost:4941/api/v1/users/" + userId.value + "/image")
                  .then((response) => {
                    imageExists.value = response.status === 200;
                  })
            })
      }
    }

    onMounted(populateValues)

    const home = () => {
      router.push("/")
    }

    const profile = () => {
      router.push("/profile")
    }

    return {
      error,
      errorFlag,
      home,
      inputFirst,
      inputLast,
      inputEmail,
      inputCurrentPass,
      inputNewPass,
      registerUser,
      getImage,
      checkedChangePass,
      imageExists,
      checkedDeletePicture,
      profile,
    }
  }
}

</script>
