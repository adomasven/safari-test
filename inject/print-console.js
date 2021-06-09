var log = console.log;
console.log = function(message) {
	let p = document.createElement('p');
	p.innerHTML = message;
	document.querySelector('.output').appendChild(p);
	log.apply(console, arguments);
}
