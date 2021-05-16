import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import App from './App.vue';
import Home from './Home.vue';
import Events from "./Events.vue";
import axios from 'axios';
import ElementPlus from 'element-plus'
import Register from "./Register";
import Login from "./Login";

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/events/:eventId",
        name: "event",
        component: Events
    },
    {
        path: "/events",
        name: "events",
        component: Events
    },
    {
        path: "/register",
        name: "register",
        component: Register
    },
    {
        path: "/login",
        name: "login",
        component: Login
    }
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

const app = createApp(App);
app.use(router);
app.config.globalProperties.axios = axios;
app.use(ElementPlus)

app.mount('#app');
