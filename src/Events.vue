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

    <div v-if="$route.params.eventId">

      <div id="event">
        <el-card class="box-card">
          <template #header>
            <div class="event-card-header">
              {{ getSingleEvent($route.params.eventId) }}

              <router-link :to="{ name: 'events' }">Back to Events</router-link>

              <div v-if="singleEvent.isOrganizer">
                <el-link v-on:click="manageEvent($route.params.eventId)">Manage Event</el-link>
              </div>

              <div v-if="singleEvent.canDelete">
                <el-popconfirm
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
              </div>

              <div v-if="isLoggedIn && singleEvent.attendanceStatus === 'accepted'">
                Attendance Status: Accepted
              </div>
              <div v-else-if="isLoggedIn">
                Attendance Status: Not attending or pending/rejected
              </div>

              <div v-if="singleEvent.canAttend">
                <el-link v-on:click="attendEvent($route.params.eventId)">Attend Event</el-link>
              </div>
              <div v-else-if="!isLoggedIn">(Log in or register to attend events)</div>
              <div v-else-if="singleEvent.attendanceStatus === 'accepted' && new Date(singleEvent.date) > new Date()">
                <el-popconfirm
                    confirmButtonText='Yes'
                    confirm-button-type="danger"
                    cancelButtonText='No'
                    icon="el-icon-info"
                    iconColor="red"
                    title="Are you sure to cancel attendance for this event?"
                    @confirm="cancelAttendance($route.params.eventId)"
                >
                  <template #reference>
                    <el-button type="danger" plain>Cancel Attendance</el-button>
                  </template>
                </el-popconfirm>
              </div>
              <div v-else>(Cannot attend event)</div>

            </div>
          </template>
          <div class="card-body" style="padding-left:0px">
            <el-descriptions class="margin-top" :title="singleEvent.title" :column=1 border>

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
                <el-image :src="singleEvent.eventImage" alt="No Image" style="width:150px">
                  <template #error>
                    <div class="image-slot">(No Image)</div>
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
                <el-image :src="singleEvent.organizerImage" alt="No Image" style="width:150px">
                  <template #error>
                    <div class="image-slot">(No Image)</div>
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
                  <el-image :src="image" alt="No Image" style="width:150px">
                    <template #error>
                      <div class="image-slot">(No Image)</div>
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
                  {{ similar.title }}
                </div>
              </el-descriptions-item>

            </el-descriptions>
          </div>

          <div class="event-card-bottom">

          </div>
        </el-card>
      </div>

    </div>

    <div v-else>
    <div id="events">

      <div v-if="VueCookieNext.isCookieAvailable('userToken')">
        <el-link v-on:click="createEvent()">Create Event</el-link>
        <br>
        <el-link v-on:click="myEvents()">My Events</el-link>
      </div>

      <el-link v-on:click="home()">Home Page</el-link>

      <br>

    <el-select v-model="valueSorting" placeholder="Select" v-on:change="searchEvents()" v>
      <el-option label="Attendees - Ascending" value="ATTENDEES_ASC"></el-option>
      <el-option label="Attendees - Descending" value="ATTENDEES_DESC"></el-option>
      <el-option label="Date - earliest to latest" value="DATE_ASC"></el-option>
      <el-option label="Date - latest to earliest" value="DATE_DESC"></el-option>
    </el-select>

    <div class="search-box">
      <el-input placeholder="Search Events" v-model="input_search" class="input-with-select"
                v-on:keypress.enter="searchEvents()">

        <template #prepend>
          <el-button data-toggle="modal" data-target="#selectCategoriesModal">Categories</el-button>
        </template>

        <template #append>
          <el-button icon="el-icon-search" v-on:click="searchEvents()"></el-button>
        </template>

      </el-input>
    </div>

    <div class="modal fade" id="selectCategoriesModal" tabindex="-1" role="dialog"
         aria-labelledby="selectCategoriesLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="selectCategoriesLabel">Select Categories</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" v-for="[category, catId] in allCategories" v-bind:key="category">
            <el-checkbox v-model="checked[catId]" v-on:change="searchEvents()">{{ category }}</el-checkbox>
          </div>
        </div>
      </div>
    </div>

    <br>

    <el-pagination v-on:current-change="searchEvents()"
        background
        layout="prev, pager, next"
        :total="numEvents"
        v-model:current-page="currentPage">
    </el-pagination>

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
      <tr v-for="event in eventsToShow" v-bind:key="event">

        <td>
          <router-link :to="{name: 'event', params: {eventId: event.eventId}}">
            <div v-if="event.isOrganizer">View/Manage Event</div>
            <div v-else>View Event</div>
            <el-image :src="event.eventImage" alt="No Image" style="width:150px">
              <template #error>
                <div class="image-slot">(No Image)</div>
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
              <div class="image-slot">(No Image)</div>
            </template>
          </el-image>
        </td>

        <td>{{ event.numAcceptedAttendees }}</td>

      </tr>
      </tbody>
    </table>

    </div>
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
    const input_search = ref("")
    const events = ref([])
    const params = ref({})
    const categoryFilter = ref("")
    const allCategories = ref([])
    const checked = ref({})
    const valueSorting = ref("DATE_ASC")
    const numEvents = ref(0)
    const currentPage = ref(1)
    const singleEvent = ref({})
    const isLoggedIn = ref(false)
    const eventsToShow = ref([])

    const searchEvents = () => {

      isLoggedIn.value = VueCookieNext.isCookieAvailable("userId") &&
          VueCookieNext.isCookieAvailable("userToken");

      if (input_search.value !== "") {
        params.value.q = input_search.value;
      } else {
        params.value = {} // params empty
      }

      params.value.sortBy = valueSorting;

      params.value.categoryIds = [];
      Object.keys(checked.value).forEach(function(key) {
        if (checked.value[key] === true) {
          params.value.categoryIds.push(key)
        }
      });

      getTotalNumEvents()

      params.value.count = 10;
      params.value.startIndex = 10 * (currentPage.value - 1)

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
                    forEveryEvent(i, matches);
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

            events.value[i].isOrganizer = VueCookieNext.isCookieAvailable("userId") &&
                VueCookieNext.getCookie("userId") === events.value[i].organizerId.toString();

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

            if (i === events.value.length - 1) {
              eventsToShow.value = [];
              axios.get("http://localhost:4941/api/v1/events", {params: params.value})
                  .then((response) => {
                    let showEvents = response.data;
                    for (let j = 0; j < showEvents.length; j++) {
                      for (let k = 0; k < events.value.length; k++) {
                        if (showEvents[j].eventId === events.value[k].eventId) {
                          eventsToShow.value.push(events.value[k]);
                          break;
                        }
                      }
                    }
                  })
            }
          });
    }

    const attendEvent = (eventId) => {
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userToken"),
        }
      }
      axios.post("http://localhost:4941/api/v1/events/" + eventId + "/attendees", {}, config)
    }

    const cancelAttendance = (eventId) => {
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userToken"),
        }
      }
      axios.delete("http://localhost:4941/api/v1/events/" + eventId + "/attendees", config)
          .then(() => {
            searchEvents();
      })
    }

    const getEventAttendees = (i) => {
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

              if (VueCookieNext.isCookieAvailable("userId") &&
                  VueCookieNext.getCookie("userId") === attendees[j].attendeeId.toString()) {
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
                if (VueCookieNext.getCookie("userId") === events.value[i].attendees[j][0].toString()) {
                  events.value[i].canAttend = false;
                  break;
                }
              }
            } else {
              events.value[i].canAttend = false;
            }
          });
    }

    const getAllCategories = () => {
      axios.get("http://localhost:4941/api/v1/events/categories")
          .then((response) => {
            let eventCategories = response.data;
            for (let i = 0; i < eventCategories.length; i++) {
              allCategories.value.push([eventCategories[i].name, eventCategories[i].id])
            }
          })
    }

    const getSimilarEvents = (i) => {
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

    const getTotalNumEvents = () => {
      axios.get("http://localhost:4941/api/v1/events", {params: params.value})
          .then((response) => {
            numEvents.value = response.data.length;
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
      let config = {
        headers: {
          "X-Authorization": VueCookieNext.getCookie("userToken"),
        }
      }
      axios.delete("http://localhost:4941/api/v1/events/" + eventId, config)
          .then(() => {
            searchEvents();
            router.push("/events");
          })
    }

    const home = () => {
      router.push("/")
    }

    const manageEvent = (eventId) => {
      router.push("/events/" + eventId + "/manage")
    }

    const myEvents = () => {
      router.push("/events/my-events")
    }

    const createEvent = () => {
      router.push("/events/create")
    }

    onMounted(searchEvents);
    onMounted(getAllCategories);

    return {
      error,
      errorFlag,
      input_search,
      events,
      params,
      searchEvents,
      categoryFilter,
      allCategories,
      checked,
      valueSorting,
      numEvents,
      currentPage,
      getSingleEvent,
      singleEvent,
      home,
      createEvent,
      VueCookieNext,
      manageEvent,
      deleteEvent,
      myEvents,
      isLoggedIn,
      attendEvent,
      cancelAttendance,
      eventsToShow,
    }
  }
}

</script>
