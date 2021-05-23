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

    <div id="myEvents">

      <el-link v-on:click="home()">Home Page</el-link>

      <br>

      <h1>My Events</h1>

      <table class="table table-hover">
        <thead>
        <tr>
          <th scope="col">Event</th>
          <th scope="col">Date/Time</th>
          <th scope="col">Title</th>
          <th scope="col">Category</th>
          <th scope="col">Host</th>
          <th scope="col">Number of Attendees</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="event in events" v-bind:key="event">

          <td>
            <router-link :to="{name: 'eventDetails', params: {eventId: event.eventId}}">
              <div v-if="event.isOrganizer">View/Manage Event</div>
              <div v-else>View Event</div>
              <el-image :src="event.eventImage" alt="No Image" style="width:150px">
                <template #error>
                  <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
                </template>
              </el-image>
            </router-link>
          </td>

          <td>{{ event.dateTime }}</td>
          <td>{{ event.title }}</td>
          <td>{{ event.eventCategories }}</td>

          <td>
            {{ event.organizerFirstName }} {{ event.organizerLastName }} <br>
            <el-image :src="event.organizerImage" alt="No Image" style="width:150px">
              <template #error>
                <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
              </template>
            </el-image>
          </td>

          <td>{{ event.numAcceptedAttendees }}</td>

        </tr>
        </tbody>
      </table>

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

import {onMounted, ref} from 'vue'
import axios from "axios";

const dateFormat = require('dateformat');
import {useRouter} from 'vue-router' //imports router function we need
import {VueCookieNext} from 'vue-cookie-next'

export default {
  name: 'Events',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const events = ref([])

    const getMyEvents = () => {
      axios.get("http://localhost:4941/api/v1/events")
          .then((response) => {
            let allEvents = response.data;

            axios.get("http://localhost:4941/api/v1/events/categories")
                .then((response) => {
                  let eventCategories = response.data;
                  let matches = {}
                  for (let i = 0; i < eventCategories.length; i++) {
                    matches[eventCategories[i].id] = eventCategories[i].name;
                  }

                  for (let i = 0; i < allEvents.length; i++) {
                    forEveryEvent(i, matches, allEvents)
                  }
                })
          })
    }

    const forEveryEvent = (i, matches, allEvents) => {
      axios.get("http://localhost:4941/api/v1/events/" + allEvents[i].eventId)
          .then((response) => {
            let eventDetails = response.data

            allEvents[i].isOrganizer = VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                VueCookieNext.getCookie("userIdEventsApp") === eventDetails.organizerId.toString();

            allEvents[i].date = eventDetails.date
            allEvents[i].dateTime = dateFormat(eventDetails.date, "d mmm yyyy, h:MMtt");
            allEvents[i].organizerId = eventDetails.organizerId;

            allEvents[i].eventCategories = ""
            for (let j = 0; j < allEvents[i].categories.length; j++) {
              let currentCategory = allEvents[i].categories[j]
              if (j === 0) {
                allEvents[i].eventCategories += matches[currentCategory]
              } else {
                allEvents[i].eventCategories += ", " + matches[currentCategory]
              }
            }

            allEvents[i].eventImage = "http://localhost:4941/api/v1/events/" + allEvents[i].eventId
                + "/image"
            allEvents[i].organizerImage = "http://localhost:4941/api/v1/users/" + allEvents[i].organizerId
                + "/image"

            if (VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                eventDetails.organizerId.toString() === VueCookieNext.getCookie("userIdEventsApp")) {
              events.value.push(allEvents[i]);
            } else {
              axios.get("http://localhost:4941/api/v1/events/" + allEvents[i].eventId + "/attendees")
                  .then((response) => {
                    let allAttendees = response.data;
                    for (let j = 0; j < allAttendees.length; j++) {
                      if (VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                          allAttendees[j].attendeeId.toString() === VueCookieNext.getCookie("userIdEventsApp"))
                      {
                        events.value.push(allEvents[i]);
                        break;
                      }
                    }
                  })
            }
          })
    }

    const home = () => {
      router.push("/")
    }

    onMounted(getMyEvents)

    return {
      error,
      errorFlag,
      events,
      VueCookieNext,
      home,
    }
  }
}

</script>
