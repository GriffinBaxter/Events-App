<template>

  <div>
    <h1> Home Page </h1>
    <el-link v-on:click="events()">Events Page</el-link>
  </div>

</template>


<script>

import {useRouter} from 'vue-router' //imports router function we need

export default {
  name: 'Events',
  setup() {
    const router = useRouter() //initialises our router object

    const events = () => {
      router.push("/events");
    }

    return {
      events,
    }
  }
}

</script>
