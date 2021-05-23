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

    <div id="profile">
      <el-card class="box-card">
        <template #header>
          <div class="event-card-header">
            <el-link v-on:click="home()">Home Page</el-link>

            <div v-if="canEdit">
              <el-link v-on:click="editUser(userId)">Edit Profile</el-link>
            </div>
          </div>
        </template>
        <div class="card-body" style="padding-left:0px">
          <el-descriptions class="margin-top" title="Profile" :column=1 border>

            <el-descriptions-item>
              <template #label>
                First name
              </template>
              {{ first }}
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Last name
              </template>
              {{ last }}
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Email
              </template>
              {{ email }}
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Profile picture
              </template>
              <el-image :src="imageUrl" alt="No Image" style="width:150px">
                <template #error>
                  <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
                </template>
              </el-image>
            </el-descriptions-item>

          </el-descriptions>
        </div>

        <div class="event-card-bottom">

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
// const dateFormat = require('dateformat');
import {useRouter} from 'vue-router' //imports router function we need
import {VueCookieNext} from 'vue-cookie-next'

export default {
  name: 'Events',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const first = ref("")
    const last = ref("")
    const email = ref("")
    const imageUrl = ref("")
    const canEdit = ref(false)
    const userId = ref(0)

    const getProfile = () => {
      if (VueCookieNext.isCookieAvailable("userIdEventsApp") &&
          VueCookieNext.isCookieAvailable("userTokenEventsApp")) {
        canEdit.value = true;
        userId.value = VueCookieNext.getCookie("userIdEventsApp");
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
          }
        }
        axios.get("http://localhost:4941/api/v1/users/" + userId.value, config)
            .then((response) => {
              first.value = response.data.firstName;
              last.value = response.data.lastName;
              email.value = response.data.email;
              imageUrl.value = "http://localhost:4941/api/v1/users/" + userId.value + "/image";
            })
      }
    }

    onMounted(getProfile)

    const home = () => {
      router.push("/")
    }

    const editUser = (userId) => {
      router.push("/profile/" + userId + "/edit")
    }

    return {
      error,
      errorFlag,
      home,
      first,
      last,
      email,
      imageUrl,
      canEdit,
      userId,
      editUser,
    }
  }
}

</script>
