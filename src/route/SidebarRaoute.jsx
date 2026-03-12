import { lazy } from "react";
import { FaUser, FaUsers } from "react-icons/fa";

// pages
const Lawyers = lazy(() => import("../pages/Lawyers"));
const Users = lazy(() => import("../pages/Users"));

const routes = [
  { path: "/lawyers", component: Lawyers, name: "Lawyers", icon: FaUser },
  { path: "/users", component: Users, name: "Users", icon: FaUsers },
];

export default routes;
