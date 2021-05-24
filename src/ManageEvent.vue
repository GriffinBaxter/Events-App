<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <div id="manageEvent" v-if="event.isOrganizer">

      <br>
      <h1> Attendance Control - {{ event.title }} </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>
      <el-button v-on:click="events()">Events Page</el-button>
      <el-button v-on:click="myEvents()">My Events</el-button>

      <br><br>

      <el-card class="box-card">

        <div v-if="!canAccept" style="color: red">
          Cannot accept any more requests for this event due to its capacity.<br><br>
        </div>

        <div v-if="event.pendingAttendees === undefined || event.pendingAttendees.length === 0">
          (No attendance requests for this event)
        </div>

        <div v-else>
          <table class="table table-hover">
            <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Date of Interest</th>
              <th scope="col">Action</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="pendingAttendee in event.pendingAttendees" v-bind:key="pendingAttendee">

              <td>{{ pendingAttendee.firstName }} {{ pendingAttendee.lastName }}</td>
              <td>{{ pendingAttendee.dateTime }}</td>
              <td>
                <el-button
                    type="success" plain
                    v-if="canAccept"
                    v-on:click="acceptOrReject(pendingAttendee.attendeeId, 'accepted')"
                >Accept</el-button>
                <el-button
                    type="danger" plain
                    v-on:click="acceptOrReject(pendingAttendee.attendeeId, 'rejected')"
                >Reject</el-button>
              </td>

            </tr>
            </tbody>
          </table>
        </div>

        <div class="event-card-bottom">

        </div>
      </el-card>
    </div>

  </div>

</template>


<style>

#manageEvent {
  text-align: center;
}

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

// import axios from "axios";
import {onMounted, ref} from 'vue'
import axios from "axios";
import {VueCookieNext} from "vue-cookie-next";

const dateFormat = require('dateformat');
import {useRouter} from 'vue-router' //imports router function we need

export default {
  name: 'ManageEvent',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const event = ref({})
    const eventId = ref(0)
    const canAccept = ref(true)

    const getEventDetails = () => {

      let manageIndex = window.location.href.lastIndexOf("manage");
      let urlWithoutManage = window.location.href.slice(0, manageIndex - 1);
      let slashIndex = urlWithoutManage.lastIndexOf("/");
      eventId.value = urlWithoutManage.slice(slashIndex + 1)

      axios.get("http://localhost:4941/api/v1/events/" + eventId.value)
          .then((response) => {
            event.value = response.data;
            event.value.isOrganizer = VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                VueCookieNext.getCookie("userIdEventsApp") === event.value.organizerId.toString();

            // this API call uses attendeeCount (null at 0)
            if (event.value.attendeeCount == null) {
              event.value.attendeeCount = 0;
            }
            canAccept.value = event.value.attendeeCount < event.value.capacity;

            if (event.value.isOrganizer) {
              let config = {
                headers: {
                  "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
                }
              }
              axios.get("http://localhost:4941/api/v1/events/" + eventId.value + "/attendees", config)
                  .then((response) => {
                    event.value.attendees = response.data;
                    event.value.pendingAttendees = [];
                    for (let i = 0; i < event.value.attendees.length; i++) {
                      if (event.value.attendees[i].status === "pending") {

                        event.value.attendees[i].dateTime = dateFormat(
                            event.value.attendees[i].dateOfInterest, "d mmm yyyy, h:MMtt"
                        );

                        event.value.pendingAttendees.push(event.value.attendees[i]);
                      }
                    }
                  })
            }
          })
    }

    const acceptOrReject = (attendeeId, status) => {
      if (VueCookieNext.isCookieAvailable("userTokenEventsApp")) {
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
          }
        }
        let data = {
          status: status
        }
        axios.patch("http://localhost:4941/api/v1/events/" + eventId.value + "/attendees/" + attendeeId,
            data, config).then(() => {
              getEventDetails();
        })
      }
    }

    onMounted(getEventDetails);

    const home = () => {
      router.push("/")
    }

    const events = () => {
      router.push("/events");
    }

    const myEvents = () => {
      router.push("/events/my-events")
    }

    return {
      error,
      errorFlag,
      event,
      VueCookieNext,
      acceptOrReject,
      canAccept,
      home,
      events,
      myEvents,
    }
  }
}

</script>
