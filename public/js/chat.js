const socket = io(); //con esto conectamos el hmtl co n lo otro

//ELEMENTS
const $messageForm = document.querySelector("#form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
//
const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
//options
//qs libreria ignoresqueryprefix ignora el?
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  //encontramos el mensaje
  const $newMessage = $messages.lastElementChild;
  //tamaño del mens
  const newMessageStyles = getComputedStyle($newMessage); //con esto podemos tomar el margin trae todos los stylos que tiene
  //sacamos el marginbot
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeigth = $newMessage.offsetHeight + newMessageMargin; //el heigth total del msn
  ///////
  //visible height
  const visibleHeight = $messages.offsetHeight;
  //height of message container tamaño total
  const containerHeight = $messages.scrollHeight;
  //donde estamos con el en el scroll
  const scrollOffset = $messages.scrollTop + visibleHeight;
  //con esto solo le vamos a hacer scroll si esta abajo
  if (containerHeight - newMessageHeigth <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//message
//con on lo recibimos
socket.on("message", message => {
  console.log(message);
  //mustache es la libreria que vamos a usar
  const html = Mustache.render(messageTemplate, {
    //aqui debemos seleccionar la variablwe que tenesmo enm  el html
    //lo cual es message y le pasamos el mesnaje por lo que queda asi
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
    username: message.username
  });
  //asi insertamos el mensaje
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

///location
const urlTemplate = document.querySelector("#url-template").innerHTML;
socket.on("locationMessage", data => {
  const html = Mustache.render(urlTemplate, {
    url: data.url,
    createdAt: moment(data.createdAt).format("h:mm a"),
    username: data.username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//roomdata
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  //con esto escribimos el template dentro de el sidebar
  document.querySelector("#sidebar").innerHTML = html;
});

//get form
$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  //desabilitamos el boton para que no se envie 2 veces
  $messageFormButton.setAttribute("disabled", "disabled");
  //capturamos el mensaje
  //con e entramos al form y podemos targetiar el elemento con el nombre message
  const message = e.target.elements.message.value;
  //lo enviamos si ponemos una funcion de callback en el lado que recibimos podemos mostrar desde aqui el mensaje con otra func call
  socket.emit("sendMessage", message, error => {
    //habilitamos el boton
    $messageFormButton.removeAttribute("disabled");
    //limpiamos el input
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

const $buttonLocation = document.querySelector("#send-location");

$buttonLocation.addEventListener("click", () => {
  $buttonLocation.setAttribute("disabled", "disabled");
  //algunos navegadores no tienen esto
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");
  //con esto podemos ver la posicion ocupa una funcion de callback
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      callback => {
        $buttonLocation.removeAttribute("disabled");
        console.log(callback);
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
