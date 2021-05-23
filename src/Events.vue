<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <div id="events">

      <br>
      <h1> Events </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>
      <el-button v-if="isLoggedIn" v-on:click="myEvents()">My Events</el-button>
      <el-button v-if="isLoggedIn" v-on:click="createEvent()">Create Event</el-button>

      <br>

      <br>
      <div class="search-box">
        <el-input placeholder="Search Events" v-model="input_search" class="input-with-select"
                  v-on:keypress.enter="searchEvents()">

          <template #append>
            <el-button icon="el-icon-search" v-on:click="searchEvents()"></el-button>
          </template>

        </el-input>
      </div>

      <br>

      <div>
        <div style="display: inline-block; padding-right: 2%">
          <h5>Order By:</h5>
          <el-select v-model="valueSorting" placeholder="Select" v-on:change="searchEvents()" v>
            <el-option label="Attendees - Ascending" value="ATTENDEES_ASC"></el-option>
            <el-option label="Attendees - Descending" value="ATTENDEES_DESC"></el-option>
            <el-option label="Date - earliest to latest" value="DATE_ASC"></el-option>
            <el-option label="Date - latest to earliest" value="DATE_DESC"></el-option>
          </el-select>
        </div>
        <div style="display: inline-block; padding-left: 2%">
          <h5>Filter by Category:</h5>
          <el-button data-toggle="modal" data-target="#selectCategoriesModal">Categories</el-button>
        </div>
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

      <br>

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

</template>


<style>

.search-box {
  max-width: 500px;
  margin: 0 auto;
}

#events {
  text-align: center;
}

#selectCategoriesModal {
  text-align: left;
}

</style>


<script>

import axios from "axios";
import {onMounted, ref} from 'vue'

const dateFormat = require('dateformat');
import {useRouter} from 'vue-router' //imports router function we need
import {VueCookieNext} from 'vue-cookie-next'

export default {
  name: 'EventDetails',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const input_search = ref("")
    const events = ref([])
    const params = ref({})
    const allCategories = ref([])
    const checked = ref({})
    const valueSorting = ref("DATE_ASC")
    const numEvents = ref(0)
    const currentPage = ref(1)
    const isLoggedIn = ref(false)

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
      Object.keys(checked.value).forEach(function (key) {
        if (checked.value[key] === true) {
          params.value.categoryIds.push(key)
        }
      });

      getTotalNumEvents()

      params.value.count = 10;
      params.value.startIndex = 10 * (currentPage.value - 1)

      axios.get("http://localhost:4941/api/v1/events", {params: params.value})
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

    const getTotalNumEvents = () => {
      axios.get("http://localhost:4941/api/v1/events", {params: params.value})
          .then((response) => {
            numEvents.value = response.data.length;
          })
    }

    const home = () => {
      router.push("/")
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
      searchEvents,
      allCategories,
      checked,
      valueSorting,
      numEvents,
      currentPage,
      home,
      createEvent,
      myEvents,
      isLoggedIn,
    }
  }
}

</script>
