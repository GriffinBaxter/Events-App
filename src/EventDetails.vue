<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

      <div id="event">

        <br>
        <h1> Event Details - {{ singleEvent.title }} </h1>
        <br>

        <el-button v-on:click="goToEventsPage()">Events Page</el-button>

        <el-button
            v-if="singleEvent.isOrganizer"
            style="width: 200px"
            v-on:click="manageEvent($route.params.eventId)">
          Attendance Control
        </el-button>

        <el-button v-if="singleEvent.canDelete" v-on:click="editEvent($route.params.eventId)">Edit Event</el-button>

        <el-popconfirm
            v-if="singleEvent.canDelete"
            confirmButtonText='Yes'
            confirm-button-type="danger"
            cancelButtonText='No'
            icon="el-icon-info"
            iconColor="red"
            title="Are you sure to delete this event?"
            @confirm="deleteEvent($route.params.eventId)"
        >
          <template #reference>
            <el-button type="danger" plain>Delete Event</el-button>
          </template>
        </el-popconfirm>

        <el-button
            v-if="singleEvent.canAttend"
            type="success" plain
            v-on:click="attendEvent($route.params.eventId)">
          Attend Event
        </el-button>
        <div v-else-if="!isLoggedIn" style="color: red"><br>Log in or register to attend events</div>
        <el-popconfirm
            v-else-if="singleEvent.attendanceStatus === 'accepted' && new Date(singleEvent.date) > new Date()"
            confirmButtonText='Yes'
            confirm-button-type="danger"
            cancelButtonText='No'
            icon="el-icon-info"
            iconColor="red"
            title="Are you sure to cancel attendance for this event?"
            @confirm="cancelAttendance($route.params.eventId)"
        >
          <template #reference>
            <el-button type="danger" plain style="width: 200px">Cancel Attendance</el-button>
          </template>
        </el-popconfirm>
        <div v-else style="color: red"><br>Cannot attend event</div>

        <br><br>

        <el-card class="box-card">
          <template #header>
            <div class="event-card-header" style="font-weight: bold">
              {{ getSingleEvent($route.params.eventId) }}

              <div v-if="isLoggedIn && singleEvent.attendanceStatus === 'accepted'">
                Attendance Status: Accepted
              </div>
              <div v-else-if="isLoggedIn">
                Attendance Status: Not attending or pending/rejected
              </div>
            </div>
          </template>
          <div class="card-body" style="padding-left:0px">
            <el-descriptions class="margin-top" :column=1 border>

              <el-descriptions-item>
                <template #label>
                  Date/Time
                </template>
                {{ singleEvent.dateTime }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Image
                </template>
                <el-image :src="singleEvent.eventImage" alt="No Image" style="width:200px">
                  <template #error>
                    <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
                  </template>
                </el-image>
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Title
                </template>
                {{ singleEvent.title }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Organizer
                </template>
                {{ singleEvent.organizerFirstName }} {{ singleEvent.organizerLastName }} <br>
                <el-image :src="singleEvent.organizerImage" alt="No Image" style="width:200px">
                  <template #error>
                    <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
                  </template>
                </el-image>
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Categories
                </template>
                {{ singleEvent.eventCategories }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Description
                </template>
                {{ singleEvent.description }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Capacity
                </template>
                {{ singleEvent.capacity }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Number of Attendees
                </template>
                {{ singleEvent.numAcceptedAttendees }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  List of Attendees
                </template>
                <div v-for="[attendeeId, firstName, lastName, image] in singleEvent.attendees"
                     v-bind:key="attendeeId">
                  <div v-if="attendeeId === singleEvent.organizerId">{{ firstName + " " + lastName }} (Organizer)</div>
                  <div v-else>{{ firstName + " " + lastName }} (Attendee)</div>
                  <el-image :src="image" alt="No Image" style="width:100px">
                    <template #error>
                      <div class="image-slot"><i style="font-size: 100px" class="el-icon-picture-outline"></i></div>
                    </template>
                  </el-image>
                  <br><br>
                </div>
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  URL
                </template>
                <div v-if="singleEvent.url === null">(No URL)</div>
                {{ singleEvent.url }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Venue
                </template>
                <div v-if="singleEvent.venue === null">(No Venue)</div>
                {{ singleEvent.venue }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Fee
                </template>
                <div v-if="singleEvent.fee === null || singleEvent.fee === '0.00'">Free (No Fee)</div>
                <div v-else>${{ singleEvent.fee }}</div>
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  Similar Events
                </template>
                <div v-for="similar in singleEvent.similarEvents" v-bind:key="similar">
                  <el-link v-on:click="goToEvent(similar.eventId)">
                    {{ similar.title }}
                  </el-link>
                </div>
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

  #event {
    text-align: center;
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
import {onMounted, ref} from 'vue'
const dateFormat = require('dateformat');
import {useRouter} from 'vue-router' //imports router function we need
import { VueCookieNext } from 'vue-cookie-next'

export default {
  name: 'Events',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const events = ref([])
    const singleEvent = ref({})
    const isLoggedIn = ref(false)
    const eventId = ref(0)

    const searchEvents = () => {
      errorFlag.value = false;

      let eventsIndex = window.location.href.lastIndexOf("events");
      let urlWithoutEvents = window.location.href.slice(eventsIndex + 7);
      while (isNaN(parseFloat(urlWithoutEvents)) || !isFinite(urlWithoutEvents)) {
        urlWithoutEvents = urlWithoutEvents.slice(0, -1);
        if (urlWithoutEvents === "") {
          break;
        }
      }
      eventId.value = parseInt(urlWithoutEvents);

      isLoggedIn.value = VueCookieNext.isCookieAvailable("userIdEventsApp") &&
          VueCookieNext.isCookieAvailable("userTokenEventsApp");

      axios.get("http://localhost:4941/api/v1/events")
          .then((response) => {
            events.value = response.data;

            axios.get("http://localhost:4941/api/v1/events/categories")
                .then((response) => {
                  let eventCategories = response.data;
                  let matches = {}
                  for (let i = 0; i < eventCategories.length; i++) {
                    matches[eventCategories[i].id] = eventCategories[i].name;
                  }

                  for (let i = 0; i < events.value.length; i++) {
                    if (events.value[i].eventId === eventId.value) {
                      forEveryEvent(i, matches);
                    }
                  }
                })
          })
    }

    const forEveryEvent = (i, matches) => {
      axios.get("http://localhost:4941/api/v1/events/" + events.value[i].eventId)
          .then((response) => {
            let eventDetails = response.data;
            events.value[i].date = eventDetails.date
            events.value[i].dateTime = dateFormat(eventDetails.date, "d mmm yyyy, h:MMtt");
            events.value[i].organizerId = eventDetails.organizerId;
            events.value[i].description = eventDetails.description;
            events.value[i].url = eventDetails.url;
            events.value[i].venue = eventDetails.venue;
            events.value[i].fee = eventDetails.fee;
            events.value[i].requiresAttendanceControl = eventDetails.requiresAttendanceControl;

            events.value[i].isOrganizer = VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                VueCookieNext.getCookie("userIdEventsApp") === events.value[i].organizerId.toString();

            events.value[i].canDelete = events.value[i].isOrganizer && new Date(events.value[i].date) > new Date()

            events.value[i].eventCategories = ""
            for (let j = 0; j < events.value[i].categories.length; j++) {
              let currentCategory = events.value[i].categories[j]
              if (j === 0) {
                events.value[i].eventCategories += matches[currentCategory]
              } else {
                events.value[i].eventCategories += ", " + matches[currentCategory]
              }
            }

            events.value[i].eventImage = "http://localhost:4941/api/v1/events/" + events.value[i].eventId
                + "/image"
            events.value[i].organizerImage = "http://localhost:4941/api/v1/users/" + events.value[i].organizerId
                + "/image"

            getEventAttendees(i);

            getSimilarEvents(i);
          });
    }

    const attendEvent = (eventId) => {
      errorFlag.value = false;
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
        }
      }
      axios.post("http://localhost:4941/api/v1/events/" + eventId + "/attendees", {}, config).then(() => {
        searchEvents();
      }).catch(err => {
        if (err.response.status === 403) {
          error.value = "Already requested attendance to this event, cannot register for an event more than once";
          errorFlag.value = true;
        }
      })
    }

    const cancelAttendance = (eventId) => {
      errorFlag.value = false;
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
        }
      }
      axios.delete("http://localhost:4941/api/v1/events/" + eventId + "/attendees", config)
          .then(() => {
            searchEvents();
      })
    }

    const getEventAttendees = (i) => {
      errorFlag.value = false;
      axios.get("http://localhost:4941/api/v1/events/" + events.value[i].eventId + "/attendees")
          .then((response) => {
            events.value[i].attendees = []
            let attendees = response.data
            for (let j = 0; j < attendees.length; j++) {
              events.value[i].attendees.push([
                attendees[j].attendeeId,
                attendees[j].firstName,
                attendees[j].lastName,
                "http://localhost:4941/api/v1/users/" + attendees[j].attendeeId + "/image"
              ])

              if (VueCookieNext.isCookieAvailable("userIdEventsApp") &&
                  VueCookieNext.getCookie("userIdEventsApp") === attendees[j].attendeeId.toString()) {
                events.value[i].attendanceStatus = attendees[j].status; // only retrieves if accepted to event
              }
            }

            if (
                ((events.value[i].capacity != null && events.value[i].numAcceptedAttendees < events.value[i].capacity)
                    || events.value[i].capacity == null) &&
                isLoggedIn.value &&
                new Date(events.value[i].date) > new Date()
            ) {
              events.value[i].canAttend = true;

              for (let j = 0; j < events.value[i].attendees.length; j++) {
                if (VueCookieNext.getCookie("userIdEventsApp") === events.value[i].attendees[j][0].toString()) {
                  events.value[i].canAttend = false;
                  break;
                }
              }
            } else {
              events.value[i].canAttend = false;
            }
          });
    }

    const getSimilarEvents = (i) => {
      errorFlag.value = false;
      axios.get("http://localhost:4941/api/v1/events")
          .then((response) => {
            let allEvents = response.data;

            events.value[i].similarEvents = []
            for (let j = 0; j < allEvents.length; j++) {
              if (allEvents[j].eventId !== events.value[i].eventId) {
                for (let k = 0; k < allEvents[j].categories.length; k++) {
                  if (events.value[i].categories.includes(allEvents[j].categories[k])) {
                    events.value[i].similarEvents.push(allEvents[j]);
                    break;
                  }
                }
              }
            }
          })
    }

    const getSingleEvent = (eventId) => {

      for (let i = 0; i < events.value.length; i++) {
        if (events.value[i].eventId.toString() === eventId) {
          singleEvent.value = events.value[i];
        }
      }
    }

    const deleteEvent = (eventId) => {
      errorFlag.value = false;
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
        }
      }
      axios.delete("http://localhost:4941/api/v1/events/" + eventId, config)
          .then(() => {
            searchEvents();
            router.push("/events");
          })
    }

    const manageEvent = (eventId) => {
      router.push("/events/" + eventId + "/manage")
    }

    const editEvent = (eventId) => {
      router.push("/events/" + eventId + "/edit")
    }

    const goToEvent = (eventId) => {
      router.push("/events/" + eventId)
    }

    const goToEventsPage = () => {
      router.push("/events");
    }

    onMounted(searchEvents);

    return {
      error,
      errorFlag,
      events,
      getSingleEvent,
      singleEvent,
      manageEvent,
      deleteEvent,
      isLoggedIn,
      attendEvent,
      cancelAttendance,
      editEvent,
      goToEvent,
      goToEventsPage,
    }
  }
}

</script>
