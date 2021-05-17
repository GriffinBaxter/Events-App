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

    <div id="createEvent">

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

      <el-link v-on:click="home()">Home Page</el-link>

      <br>

      Title: <el-input placeholder="Please input" v-model="inputTitle"></el-input>

      Category: <el-button data-toggle="modal" data-target="#selectCategoriesModal">Categories</el-button>
      <br>

      Date: <el-date-picker
        v-model="inputDate" type="datetime" placeholder="Pick a day" :disabled-date="disabledDate"></el-date-picker>
      <br>

      Image: <input type="file" @change="getImage" name="img" accept="image/png, image/gif, image/jpeg">
      <br>

      Description: <el-input placeholder="Please input" v-model="inputDescription" type="textarea"></el-input>

      Maximum Capacity: <el-checkbox v-model="checkedCapacity">Enabled</el-checkbox>
      <br>
      <el-input-number v-model="inputCapacity" :min="1"></el-input-number>
      <br>

      Online: <el-checkbox v-model="checkedOnline">Enabled</el-checkbox>
      <br>

      URL: <el-input placeholder="Please input" v-model="inputUrl"></el-input>

      Venue: <el-input placeholder="Please input" v-model="inputVenue"></el-input>

      Requires Attendance Control: <el-checkbox v-model="checkedAttendanceControl">Enabled</el-checkbox>
      <br>

      Fee: <el-input-number v-model="inputFee" :min="0" :precision="2"></el-input-number>
      <br>

      <el-button v-on:click="createEvent()">Create Event</el-button>

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
import {useRouter} from 'vue-router' //imports router function we need
import axios from "axios";
import {VueCookieNext} from "vue-cookie-next";
const dateFormat = require('dateformat');

export default {
  name: 'CreateEvent',
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

    const createEvent = () => {
      errorFlag.value = false;

      categoryIds.value = [];
      Object.keys(checked.value).forEach(function(key) {
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
          selectedImageType.value !== "image/gif") {
        error.value = "Image must be entered and be an image file (PNG, JPEG or GIF)"
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
          url: inputUrl.value,
          requiresAttendanceControl: checkedAttendanceControl.value,
          fee: inputFee.value,
        }
        if (checkedCapacity.value) {
          data.capacity = inputCapacity.value
        }
        let config = {
          headers: {
            "X-Authorization": VueCookieNext.getCookie("userToken"),
          }
        }
        axios.post("http://localhost:4941/api/v1/events", data, config)
            .then((response) => {
              let eventId = response.data.eventId;
              config.headers["Content-Type"] = selectedImageType.value
              axios.put("http://localhost:4941/api/v1/events/" + eventId + "/image", selectedImage.value, config)
                  .then(() => {
                    router.push("/events/my-events")
                  })
        })
      }
    }

    const home = () => {
      router.push("/")
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
    }
  }
}

</script>
