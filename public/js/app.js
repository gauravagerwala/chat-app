var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');

var socket = io();

jQuery('#room_name').text(room);
$('#input_room').val(room);
$('#input_name').val(name);

socket.on('connect', function(){
	console.log('Connected to socket.io server');

	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});

	var $messages = jQuery('.messages');

socket.on('message', function(message){
	var momentTimestamp = moment.utc(message.timestamp);
	var $message = jQuery('<li class="list-group-item"></li>');

	console.log('New Message : ' + message.text + 'at' + momentTimestamp);

	$message.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong></p>');
	$message.append('<p>' + message.text + '</p>');
	$messages.append($message);
});

socket.on('link' ,function(data){
  console.log(data);
	var momentTimestamp = moment.utc(data.timestamp);
	var $message = jQuery('<li class="list-group-item"></li>');
	$message.append('<p><strong>' + data.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong></p>');
	$message.append('<a target = "blank" href="'+ data.link + '" >'+data.fname+'</a>');
	$messages.append($message);
});

//Handles submitting new message
var $form = jQuery('#message-form');
var fileForm = $('#fileForm');
$form.on('submit', function(event){
	event.preventDefault();
	if($('#fileForm input[name=uploadFile]').val()!=='')
	{
   var formData = new FormData(fileForm[0]);
  	$.ajax({
        url: "/uploadFile",
        type: 'POST',
        data: formData,
        async: true,
        success: function (data) {
            alert(data)
        },
        cache: false,
        contentType: false,
        processData: false
     });
		 console.log('ajax called');
		 $('#fileForm input[name=uploadFile]').val('');
	}

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		name: name,
		text: $message.val()
	});

	$message.val("");
});
