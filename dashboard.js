import { auth, db } from "./firebase.js";

import {
collection,
onSnapshot,
addDoc,
doc,
updateDoc,
deleteDoc,
setDoc,
query,
orderBy,
where,
limit,
getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


let deviceContainer;
let deviceCount;
let commandLogs;

let devicesSection;
let logsSection;

let renameModal;
let renameInput;
let renameSave;
let renameCancel;

let deleteModal;
let deleteConfirm;
let deleteCancel;

let addDeviceBtn;
let linkCodeBox;
let linkCode;

let clearLogsBtn;

let logoutBtn;

let avatar;
let profileMenu;

let currentDeviceId=null;
let deleteDeviceId=null;

let currentFilter="all";

let deviceMap={};



document.addEventListener("DOMContentLoaded",()=>{

deviceContainer=document.getElementById("devices");
deviceCount=document.getElementById("deviceCount");
commandLogs=document.getElementById("commandLogs");

devicesSection=document.getElementById("devicesSection");
logsSection=document.getElementById("logsSection");

renameModal=document.getElementById("renameModal");
renameInput=document.getElementById("renameInput");
renameSave=document.getElementById("renameSave");
renameCancel=document.getElementById("renameCancel");

deleteModal=document.getElementById("deleteModal");
deleteConfirm=document.getElementById("deleteConfirm");
deleteCancel=document.getElementById("deleteCancel");

addDeviceBtn=document.getElementById("addDeviceBtn");
linkCodeBox=document.getElementById("linkCodeBox");
linkCode=document.getElementById("linkCode");

clearLogsBtn=document.getElementById("clearLogsBtn");

logoutBtn=document.getElementById("logoutBtn");

avatar=document.getElementById("userAvatar");
profileMenu=document.getElementById("profileMenu");

const filterButtons=document.querySelectorAll(".filter-btn");


/* AVATAR DROPDOWN */

if(avatar && profileMenu){

avatar.addEventListener("click",(e)=>{

e.stopPropagation();
profileMenu.classList.toggle("active");

});

document.addEventListener("click",(e)=>{

if(!avatar.contains(e.target) && !profileMenu.contains(e.target)){
profileMenu.classList.remove("active");
}

});

}


/* LOGOUT */

if(logoutBtn){

logoutBtn.addEventListener("click",async()=>{

await auth.signOut();
window.location="index.html";

});

}


/* FILTERS */

filterButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

filterButtons.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");

currentFilter=btn.dataset.filter;

if(currentFilter==="logs"){

devicesSection.style.display="none";
logsSection.style.display="block";

}else{

devicesSection.style.display="block";
logsSection.style.display="none";

if(auth.currentUser){
loadDevices(auth.currentUser.uid);
}

}

});

});


/* ADD DEVICE */

if(addDeviceBtn){

addDeviceBtn.addEventListener("click",async()=>{

const user=auth.currentUser;
if(!user) return;

const code=Math.floor(100000+Math.random()*900000).toString();

await setDoc(doc(db,"link_codes",code),{

user_id:user.uid,
created_at:Date.now(),
used:false

});

if(linkCode) linkCode.innerText=code;
if(linkCodeBox) linkCodeBox.style.display="flex";

});

}


/* CLEAR LOGS */

if(clearLogsBtn){

clearLogsBtn.addEventListener("click",async()=>{

const user=auth.currentUser;
if(!user) return;

const q=query(
collection(db,"commands"),
where("user_id","==",user.uid)
);

const snapshot=await getDocs(q);

snapshot.forEach(async (docSnap)=>{

await deleteDoc(doc(db,"commands",docSnap.id));

});

});

}


/* AUTH */

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location="index.html";
return;

}

const uidBox=document.getElementById("uid");
if(uidBox) uidBox.innerText=user.uid;


/* AVATAR */

if(avatar){

if(user.photoURL){
avatar.src=user.photoURL;
}else{
avatar.src="https://api.dicebear.com/7.x/identicon/svg?seed="+user.uid;
}

}

loadDevices(user.uid);
loadCommands(user.uid);

});


/* RENAME MODAL */

if(renameSave){

renameSave.addEventListener("click",()=>{

renameDevice(currentDeviceId,renameInput.value);

if(renameModal) renameModal.style.display="none";

});

}

if(renameCancel){

renameCancel.addEventListener("click",()=>{

if(renameModal) renameModal.style.display="none";

});

}


/* DELETE MODAL */

if(deleteConfirm){

deleteConfirm.addEventListener("click",()=>{

removeDevice(deleteDeviceId);

if(deleteModal) deleteModal.style.display="none";

});

}

if(deleteCancel){

deleteCancel.addEventListener("click",()=>{

if(deleteModal) deleteModal.style.display="none";

});

}

});



/* LOAD DEVICES */

function loadDevices(uid){

const devicesRef=collection(db,"users",uid,"devices");

onSnapshot(devicesRef,(snapshot)=>{

deviceContainer.innerHTML="";
deviceCount.innerText=snapshot.size;

deviceMap={};

snapshot.forEach(docSnap=>{

const device=docSnap.data();
const deviceId=docSnap.id;

deviceMap[deviceId]=device.name;

if(currentFilter==="pc" || currentFilter==="android"){
if(device.client_type!==currentFilter) return;
}

const card=createDeviceCard(device,deviceId);
deviceContainer.appendChild(card);

});

});

}



/* CREATE DEVICE CARD */

function createDeviceCard(device,deviceId){

const card=document.createElement("div");
card.className="device-card";

let icon="💻";

if(device.client_type==="android"){
icon="📱";
}

const status=device.status==="online"?"🟢 Online":"🔴 Offline";

card.innerHTML=`

<h3 class="device-name">

<span>${icon} ${device.name}</span>

<div class="device-icons">

<i class="fa-solid fa-pen-to-square rename-icon"></i>
<i class="fa-solid fa-trash-can delete-icon"></i>

</div>

</h3>

<p>Status: ${status}</p>
<p>OS: ${device.os}</p>
<p>RAM: ${device.ram}</p>

<div class="custom-command">

<input class="command-input" placeholder="Type command...">

<button class="send-command">
<i class="fa-solid fa-paper-plane"></i>
</button>

</div>

<div class="device-actions">

<button class="shutdown" data-command="shutdown">Shutdown</button>
<button class="restart" data-command="restart">Restart</button>
<button class="lock" data-command="lock">Lock</button>

</div>

`;


/* RENAME */

const renameIcon=card.querySelector(".rename-icon");

if(renameIcon){

renameIcon.addEventListener("click",()=>{

currentDeviceId=deviceId;

renameInput.value=device.name;
renameModal.style.display="flex";

});

}


/* DELETE */

const deleteIcon=card.querySelector(".delete-icon");

if(deleteIcon){

deleteIcon.addEventListener("click",()=>{

deleteDeviceId=deviceId;
deleteModal.style.display="flex";

});

}


/* COMMAND BUTTONS */

const buttons=card.querySelectorAll(".device-actions button");

buttons.forEach(btn=>{

btn.addEventListener("click",()=>{
sendCommand(deviceId,btn.dataset.command);
});

});


/* CUSTOM COMMAND */

const input=card.querySelector(".command-input");
const sendBtn=card.querySelector(".send-command");

if(sendBtn){

sendBtn.addEventListener("click",()=>{

const cmd=input.value.trim();
if(!cmd)return;

sendCommand(deviceId,cmd);
input.value="";

});

}

return card;

}



/* RENAME DEVICE */

async function renameDevice(deviceId,newName){

const user=auth.currentUser;
if(!user) return;

await updateDoc(
doc(db,"users",user.uid,"devices",deviceId),
{name:newName}
);

}



/* REMOVE DEVICE */

async function removeDevice(deviceId){

const user=auth.currentUser;
if(!user) return;

await deleteDoc(
doc(db,"users",user.uid,"devices",deviceId)
);

}



/* SEND COMMAND */

async function sendCommand(deviceId,command){

const user=auth.currentUser;
if(!user) return;

await addDoc(collection(db,"commands"),{

user_id:user.uid,
device_id:deviceId,
command:command,
status:"pending",
timestamp:Date.now()

});

}



/* LOAD COMMAND LOGS */

function loadCommands(uid){

const commandsRef=query(
collection(db,"commands"),
where("user_id","==",uid),
orderBy("timestamp","desc"),
limit(10)
);

onSnapshot(commandsRef,(snapshot)=>{

commandLogs.innerHTML="";

if(snapshot.empty){

commandLogs.innerHTML="<p>No commands yet</p>";
return;

}

snapshot.forEach(docSnap=>{

const data=docSnap.data();

const log=document.createElement("div");
log.className="log-item";

const deviceName=deviceMap[data.device_id] || data.device_id;
const time=new Date(data.timestamp).toLocaleTimeString();

log.innerText=`${data.command} → ${deviceName}   ${time}`;

commandLogs.appendChild(log);

});

});

}