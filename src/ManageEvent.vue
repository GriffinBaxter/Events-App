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

      <div id="manageEvent" v-if="event.isOrganizer">
        <el-card class="box-card">
          <template #header>
            <div class="event-card-header">
              <router-link :to="{ name: 'events' }">Back to Events</router-link>
            </div>
          </template>
          <div class="card-body" style="padding-left:0px">
            <el-descriptions class="margin-top" title="Attendance Requests" :column=1 border>
              <el-descriptions-item v-for="pendingAttendee in event.pendingAttendees" v-bind:key="pendingAttendee">
                <template #label>
                  {{ pendingAttendee.firstName }}
                </template>
                {{ pendingAttendee }}
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

// import axios from "axios";
import {onMounted, ref} from 'vue'
import axios from "axios";
import {VueCookieNext} from "vue-cookie-next";
// const dateFormat = require('dateformat');
// import {useRouter} from 'vue-router' //imports router function we need

export default {
  name: 'ManageEvent',
  setup() {
    // const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const event = ref({})

    const getEventDetails = () => {

      let manageIndex = window.location.href.lastIndexOf("manage");
      let urlWithoutManage = window.location.href.slice(0, manageIndex - 1);
      let slashIndex = urlWithoutManage.lastIndexOf("/");
      let eventId = urlWithoutManage.slice(slashIndex + 1)

      axios.get("http://localhost:4941/api/v1/events/" + eventId)
          .then((response) => {
            event.value = response.data;
            event.value.isOrganizer = VueCookieNext.isCookieAvailable("userId") &&
                VueCookieNext.getCookie("userId") === event.value.organizerId.toString();

            if (event.value.isOrganizer) {
              let config = {
                headers: {
                  "X-Authorization": VueCookieNext.getCookie("userToken"),
                }
              }
              axios.get("http://localhost:4941/api/v1/events/" + eventId + "/attendees", config)
                  .then((response) => {
                    event.value.attendees = response.data;
                    event.value.pendingAttendees = [];
                    for (let i = 0; i < event.value.attendees.length; i++) {
                      if (event.value.attendees[i].status === "pending") {
                        event.value.pendingAttendees.push(event.value.attendees[i]);
                      }
                    }
                  })
            }
          })
    }

    onMounted(getEventDetails);

    return {
      error,
      errorFlag,
      event,
      VueCookieNext,
    }
  }
}

</script>
