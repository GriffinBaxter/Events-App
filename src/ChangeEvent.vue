<template>

  <div>
    <div v-if="errorFlag">
      <el-alert
          title="Whoops! Something went wrong."
          type="error">
        <span>Error: {{ error }}</span>
      </el-alert>
    </div>

    <div id="createEvent">

      <br>
      <h1> Edit Event </h1>
      <br>

      <el-button v-on:click="home()">Home Page</el-button>
      <el-button v-on:click="events()">Events Page</el-button>
      <el-button v-on:click="myEvents()">My Events</el-button>

      <br><br>

      <el-card class="box-card">
        <div class="card-body" style="padding-left:0px">
          <el-descriptions class="margin-top" :column=1 border>

            <el-descriptions-item>
              <template #label>
                Title
              </template>
              <el-input placeholder="Please input" v-model="inputTitle"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Category
              </template>
              <el-button data-toggle="modal" data-target="#selectCategoriesModal">Categories</el-button>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Date
              </template>
              <el-date-picker
                  v-model="inputDate" type="datetime" placeholder="Pick a day"
                  :disabled-date="disabledDate"></el-date-picker>
              <br>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                New Image (Optional)
              </template>
              <input type="file" @change="getImage" name="img" accept="image/png, image/gif, image/jpeg">
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Description
              </template>
              <el-input placeholder="Please input" v-model="inputDescription" type="textarea"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Maximum Capacity
              </template>
              <el-checkbox v-model="checkedCapacity">Enabled</el-checkbox>
              <br>
              <el-input-number v-model="inputCapacity" :min="1" :disabled="!checkedCapacity"></el-input-number>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Online (otherwise, in-person)
              </template>
              <el-checkbox v-model="checkedOnline">Enabled</el-checkbox>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                URL
              </template>
              <el-input placeholder="Please input" v-model="inputUrl"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Venue
              </template>
              <el-input placeholder="Please input" v-model="inputVenue"></el-input>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Requires Attendance Control
              </template>
              <el-checkbox v-model="checkedAttendanceControl">Enabled</el-checkbox>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                Fee
              </template>
              <el-input-number v-model="inputFee" :min="0" :precision="2"></el-input-number>
            </el-descriptions-item>

          </el-descriptions>
        </div>

        <div class="event-card-bottom">
          <el-button type="primary" v-on:click="createEvent()">Edit Event</el-button>
        </div>
      </el-card>

      <br>

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
              <el-checkbox v-model="checked[catId]">{{ category }}</el-checkbox>
            </div>
          </div>
        </div>
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
import {useRouter} from 'vue-router' //imports router function we need
import axios from "axios";
import {VueCookieNext} from "vue-cookie-next";

const dateFormat = require('dateformat');

export default {
  name: 'ChangeEvent',
  setup() {
    const router = useRouter() //initialises our router object

    const error = ref("");
    const errorFlag = ref(false);
    const inputTitle = ref("")
    const inputDate = ref("")
    const inputDescription = ref("")
    const inputCapacity = ref(1)
    const checkedOnline = ref(false)
    const inputUrl = ref("")
    const inputVenue = ref("")
    const checkedAttendanceControl = ref(false)
    const inputFee = ref(0)
    const allCategories = ref([])
    const checked = ref({})
    const selectedImage = ref(null)
    const selectedImageType = ref(null)
    const checkedCapacity = ref(true)
    const categoryIds = ref([])
    const eventId = ref(0)

    const createEvent = () => {
      window.scrollTo(0,0);

      errorFlag.value = false;

      categoryIds.value = [];
      Object.keys(checked.value).forEach(function (key) {
        if (checked.value[key] === true) {
          categoryIds.value.push(parseInt(key))
        }
      });

      if (inputTitle.value.length < 1) {
        error.value = "Title must be provided"
        errorFlag.value = true;
      } else if (categoryIds.value.length < 1) {
        error.value = "At least one category must be provided"
        errorFlag.value = true;
      } else if (inputDate.value === "" || inputDate.value <= new Date()) {
        error.value = "Date and time must be provided and both must be in the future"
        errorFlag.value = true;
      } else if (selectedImageType.value !== "image/png" &&
          selectedImageType.value !== "image/jpeg" &&
          selectedImageType.value !== "image/gif" &&
          selectedImageType.value != null) {
        error.value = "New image must be an image file (PNG, JPEG or GIF)"
        errorFlag.value = true;
      } else if (inputDescription.value.length < 1) {
        error.value = "Description must be provided"
        errorFlag.value = true;
      } else if (checkedOnline.value && inputUrl.value.length < 1) {
        error.value = "URL must be provided for online events"
        errorFlag.value = true;
      } else if (!checkedOnline.value && inputVenue.value.length < 1) {
        error.value = "Venue must be provided for non-online (in-person) events"
        errorFlag.value = true;
      } else {
        inputDate.value = dateFormat(inputDate.value, "yyyy-mm-dd HH:MM:ss")

        let data = {
          title: inputTitle.value,
          description: inputDescription.value,
          categoryIds: categoryIds.value,
          date: inputDate.value,
          isOnline: checkedOnline.value,
          requiresAttendanceControl: checkedAttendanceControl.value,
          fee: inputFee.value,
        }
        if (checkedCapacity.value) {
          data.capacity = inputCapacity.value
        }
        if (checkedOnline.value) {
          data.url = inputUrl.value;
          if (inputVenue.value !== "") {
            data.venue = inputVenue.value;
          }
        } else {
          data.venue = inputVenue.value;
          if (inputUrl.value !== "") {
            data.url = inputUrl.value;
          }
        }
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userTokenEventsApp"),
          }
        }
        axios.patch("http://localhost:4941/api/v1/events/" + eventId.value, data, config)
            .then(() => {

              if (selectedImageType.value != null) {
                config.headers["Content-Type"] = selectedImageType.value
                axios.put("http://localhost:4941/api/v1/events/" + eventId.value + "/image",
                    selectedImage.value, config)
                    .then(() => {
                      router.push("/events/my-events")
                    })
              } else {
                router.push("/events/my-events")
              }
            })
      }
    }

    const populateValues = () => {
      let manageIndex = window.location.href.lastIndexOf("edit");
      let urlWithoutManage = window.location.href.slice(0, manageIndex - 1);
      let slashIndex = urlWithoutManage.lastIndexOf("/");
      eventId.value = urlWithoutManage.slice(slashIndex + 1)

      axios.get("http://localhost:4941/api/v1/events/" + eventId.value)
          .then((response) => {
            let eventDetails = response.data;

            inputTitle.value = eventDetails.title;
            inputDate.value = eventDetails.date;
            for (let i = 0; i < eventDetails.categories.length; i++) {
              checked.value[eventDetails.categories[i]] = true;
            }
            inputDescription.value = eventDetails.description;
            checkedCapacity.value = eventDetails.capacity != null;
            if (eventDetails.capacity != null) {
              inputCapacity.value = eventDetails.capacity;
            }
            checkedOnline.value = eventDetails.isOnline === 1;
            if (eventDetails.url != null) {
              inputUrl.value = eventDetails.url;
            }
            if (eventDetails.venue != null) {
              inputVenue.value = eventDetails.venue;
            }
            checkedAttendanceControl.value = eventDetails.requiresAttendanceControl === 1;
            inputFee.value = parseFloat(eventDetails.fee);
          })
    }

    const home = () => {
      router.push("/")
    }

    const events = () => {
      router.push("/events");
    }

    const myEvents = () => {
      router.push("/events/my-events")
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

    const disabledDate = (time) => {
      return time.getTime() < Date.now()
    }

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

    onMounted(getAllCategories);
    onMounted(populateValues);

    return {
      error,
      errorFlag,
      home,
      inputTitle,
      inputDate,
      inputDescription,
      inputCapacity,
      checkedOnline,
      inputUrl,
      inputVenue,
      checkedAttendanceControl,
      inputFee,
      getAllCategories,
      allCategories,
      checked,
      disabledDate,
      getImage,
      checkedCapacity,
      createEvent,
      VueCookieNext,
      events,
      myEvents,
    }
  }
}

</script>
