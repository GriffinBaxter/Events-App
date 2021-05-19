import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import App from './App.vue';
import Home from './Home.vue';
import Events from "./Events.vue";
import axios from 'axios';
import ElementPlus from 'element-plus'
import Register from "./Register";
import Login from "./Login";
import CreateEvent from "./CreateEvent";
import ManageEvent from "./ManageEvent";
import MyEvents from "./MyEvents";
import ChangeEvent from "./ChangeEvent";
import Profile from "./Profile";
import ProfileEdit from "./ProfileEdit";
import EventDetails from "./EventDetails";

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/events/create",
        name: "createEvent",
        component: CreateEvent
    },
    {
        path: "/events/my-events",
        name: "myEvents",
        component: MyEvents
    },
    {
        path: "/events/:eventId/manage",
        name: "manageEvent",
        component: ManageEvent
    },
    {
        path: "/events/:eventId/edit",
        name: "changeEvent",
        component: ChangeEvent
    },
    {
        path: "/events/:eventId",
        name: "eventDetails",
        component: EventDetails
    },
    {
        path: "/events",
        name: "events",
        component: Events
    },
    {
        path: "/profile/:userId/edit",
        name: "profileEdit",
        component: ProfileEdit
    },
    {
        path: "/profile",
        name: "profile",
        component: Profile
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
