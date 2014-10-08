
/** 
*	2D Vector math, used for position, velocity and acceleration
*	Could get quite ugly..
*/
function Vector(x, y){
	this.x = x || 0;
	this.y = y || 0;
}

Vector.prototype = {

	add: function(vector) { 
		return new Vector(vector.x + this.x ,vector.y + this.y);
	},
	subtract: function(vector) { 
		return new Vector(this.x - vector.x ,this.y - vector.y);
	},
	multiply: function(scalar){
		return new Vector(this.x * scalar, this.y * scalar);
	},
	rotate: function(angle) {

		var R=[Math.cos(angle), -Math.sin(angle),
				Math.sin(angle), Math.cos(angle)];

		newPosX=this.x*R[0] + this.y*R[1];
		newPosY=this.x*R[2] + this.y*R[3];	
		this.x=newPosX;
		this.y=newPosY;
		//return new Vector(newPosX,newPosY)
	},
	normalize: function() {
		var magnitude = Math.sqrt(this.x*this.x + this.y*this.y);
		this.x = this.x / magnitude;
		this.y = this.y / magnitude;
	},
	distanceFrom: function(vector) { 
		
		return Math.sqrt((vector.x - this.x)*(vector.x - this.x) + (vector.y - this.y)*(vector.y - this.y));
	},
	reflect: function(vector) { 
		
		var incoming = this.invertDirection();
		var project = incoming.projectOn(vector);
		var reflection = project.subtract(incoming).multiply(2.0).add(incoming);
		return reflection;
	},
	invertDirection: function() { 
		
		return new Vector(-this.x,-this.y);
	},
	projectOn: function(vector) { 
		
		var p = (this.x*vector.x + this.y*vector.y) / (vector.x*vector.x + vector.y*vector.y);
		return new Vector(p*vector.x,p*vector.y);
	},
	getMagnitude: function(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},
	dot: function(vector){
		return this.x*vector.x + this.y*vector.y;
	},
	getShortestAngleFrom: function(vector){

		var rad = this.dot(vector)/(Math.sqrt(this.x*this.x + this.y*this.y)*Math.sqrt(vector.x*vector.x + vector.y*vector.y));

		//which way to rotate
		if((this.x*vector.y - this.y*vector.x)<0)
			return -Math.acos(rad); 
		
		return Math.acos(rad);
	},

	getAngleFrom: function(vector){
		var rad = this.dot(vector)/(Math.sqrt(this.x*this.x + this.y*this.y)*Math.sqrt(vector.x*vector.x + vector.y*vector.y));

		return Math.acos(rad);
	},

	equals: function(vector){
		if(this.x == vector.x && this.y==vector.y)
			return true;
		else
			return false;
	}
}