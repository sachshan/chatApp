const socket = io();

// Elements
const $form = document.querySelector("#cForm");
const $messageFormButton = $form.querySelector('button');
const $messageFormInput = $form.querySelector('input');
const $locationButton = document.querySelector('#send-location'); 
const $messages = document.querySelector('#messages');
const $lmessages = document.querySelector('#lmessages');


// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;

// Location Template
const lmessageTemplate = document.querySelector("#lmessage-template").innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.on('newClient', (message)=>{
    console.log(message.text);
    
})

$form.addEventListener('submit', (event)=>{

    event.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    socket.emit('newMessage', event.target.elements.message.value, (message)=>{
        console.log("The message was delivered.",message);
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();

    });
});

socket.on('sMessage', (message)=>{

    console.log(message.text);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('MMM DD YY h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);


})

socket.on('sLocation', (url)=>{

    console.log(url.url);
    
    const html = Mustache.render(lmessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt:  moment(url.createdAt).format('MMM DD YY h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

$locationButton.addEventListener('click', ()=>{

    $locationButton.setAttribute('disabled', 'disabled');

    if(!navigator.geolocation)
    {
        console.log("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition((position=>{
        socket.emit('clientPosition', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message)=>{
            console.log(message);
            $locationButton.removeAttribute('disabled');
        });
    }))

}); 

socket.emit('join', {username, room}, (error)=>{
    if(error)
    {
        alert(error);
        location.href = '/';
    }

});
