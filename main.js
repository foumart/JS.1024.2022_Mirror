// Declare variables, otherwise Terser does not mangle them, however the let statement should be removed before Regpack to squeeze some bytes
let maxHealth, health, clicked, over, shots, ships, frame, score, random,
	w, h, s, q;

w = a.width;
h = a.height;
s = h / 960;
t = 99;

// Resize the canvas in a mobile friendly ratio
//a.width = h * .6;

// center the resized canvas, removed to save bytes
//o = (w - a.width) / 2;
//a.style.left = o + 'px';
w = a.width;

if (M) {
	a.ontouchstart = interaction;
} else {
	a.onmousedown = interaction;
}

// drag the missile launch point - no space for this feature, on top of that the b prop needs to be recalculated to function correctly
/*a.onmousemove = e => {
	if (clicked) {
		shots[0].x = e.clientX - o;
		shots[0].y = e.clientY;
	}
}*/

a.onmouseup = a.ontouchend = e => {
	clicked = 0;
	//shots[0].y = h/2;
}

// on click/tap we add a new bullet and keep charging it while holding the mouse button, after which the bullet is released
function interaction(e) {
	clicked = 1;
	health -= .1;
	e = (M ? e.touches[0] : e);
	shots.unshift({
		x: e.clientX,// - o,
		y: e.clientY,//h/2,
		s: 5,
		b: h/2 - (e.clientY - h/2),
		l: 0
	});
	if (over) init();
}

init();

function init() {
	maxHealth = health = 9;
	clicked = over = frame = score = 0;
	shots = [];
	ships = [];
}

setInterval(count => {
	if (!over || over && over++ % 9 == 0) {
		// spawn new ships
		if (frame++ % t == 0 && ships.length < 3 + score/t/t) {
			random = Math.random();
			ships.unshift({
				x: w * random,
				y: -t,
				u: (1-random)/5 - .1,
				h: 5*(random = frame % 2 ? random : 1-random) + 1,
				r: 20 + 30 * random,
				v: random/3 + .1 + score/t/t
			});
		}

		// draw the sky
		fill('#8df', h);

		// draw the city
		for (q = 0; q < t; q++) {
			fill('#999', h/9, (h * (.5 + over/t/t - q/7%4/t) - q%9 / (q%2)), 9*(q%4)*s, (8+q%3)*q*s);
		}

		// used to count how many enemies are destroyed with one hit
		count = 0;
		// itterate ships
		ships.map((ship, i) => {

			// draw ship red border, or ship explosion
			drawCircle(ship, ship.r + (ship.h < 1 ? ship.r * (frame % 9) / 9 : 5), '#f00');

			// draw the ship body
			drawCircle(ship, ship.r, '#fd0');

			if (ship.h < 1) {
				// decrease ship size when it gets destroyed and remove it when done
				if (ship.r-- < 2) {
					ships.splice(i, 1);
				}
			} else {
				// move ship
				ship.x += ship.u;
				ship.y += ship.v;

				// draw ship health
				drawCircle(ship, ship.h * 5, '#ff0');
				
				// check if a ship reaches the ground
				if (ship.y > h/2) {
					ship.h = 0;
					if (health -- < 0) over ++;
				}
			}

			// itterate missiles
			shots.map(shot => {
				// check if a missile reaches the mirrored destination in y axis
				if (shot.s && shot.y < shot.b) {
					// use Math.pow shorthands to check missile and ship intersection
					q = (shot.x - ship.x) ** 2 + (shot.y - ship.y) ** 2;
					i = ((ship.r + shot.s * 2) * s) ** 2;
					if (q < i) {
						i = (i - q) / i * shot.s;
						//score += i; // add score bonus for precision
						ship.h -= i;
						if (ship.h < 1) {
							count ++;
							health += i / t; // increase health a bit for precise hits
							score += ship.r;
						}
					}
				}
			});
		});

		// draw ground
		fill('#296', h/2, h/2);

		// draw the player health bar
		fill('#6f6', h/t, h*.51, w / maxHealth * health);

		// add score bonus for multi-kills (1, 32, 243, 1024, 3125, 7776, 16807, 32768, 59049, 100000)
		score += count ** 5;

		fill('#fff');
		c.font = h/12 + 'px Arial';
		c.fillText(score | 0, 9, h*.6);

		// manipulate missiles
		shots.map((shot, j) => {
			// start missile explosion
			if (shot.s && shot.y < shot.b) {
				shot.l = shot.s * 2;
				shot.s = 0;
			}

			// charge
			if (clicked && !j) {
				if (shot.s < 30) shot.s ++;
			}
			// missile fly
			else if (shot.s) {
				shot.y -= (9 - shot.s/4);
			}
			// missile exploding
			else if (shot.l) {
				if (shot.l -- < 2) shots.splice(j, 1);
			}

			// draw missile
			drawCircle(shot, shot.s / 2 || shot.l);

			// draw missile trail
			/*for (j = shot.y; j < shot.y + h/2 - shot.b; j += 36 - shot.s) {
				if (shot.s) drawCircle(shot.x, j, shot.s / 20);
			}*/
		});
	}
}, 8);

function drawCircle(obj, radius, color) {
	fill(color);
	c.beginPath();
	c.arc(obj.x, obj.y, radius * s, 0, 7);
	c.fill();
}

function fill(_color, _h, _y = 0, _w = 0, _x = 0) {
	c.fillStyle = _color;
	c.fillRect(_x, _y, _w || w, _h);
}
