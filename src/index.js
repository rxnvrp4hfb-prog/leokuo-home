import {websiteGate} from "./site-gate.js";
export default {async fetch(request,env){const paused=await websiteGate(request,"home");return paused||env.ASSETS.fetch(request);}};
