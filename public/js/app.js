var socket = io(); 

socket.on('connect', function(){
	console.log('Connected to socket.io server');
});

socket.on('message', function(message){
	var momentTimestamp = moment.utc(message.timestamp);

	console.log('New Message : ' + message.text 'at' + message.momentTimestamp);

	jQuery('.messages').append('<p><strong>' + momentTimestamp.local().format('h:mm a') + ' </strong>' + message.text + '</p>');
});

//Handles submitting new message
var $form = jQuery('#message-form');

$form.on('submit', function(event){
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		text: $message.val(),
		timestamp: moment().valueOf()
	});

	$message.val("");
});