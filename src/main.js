var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

function main(){

	// Get a reference to the canvas object
	var canvas = document.getElementById('myCanvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	// Create an empty project and a view for the canvas:
	paper.setup(canvas);

	var theBSplineCurve = new BSplineCurve();
	var canvasManager = new CanvasManager(canvas, theBSplineCurve);
	canvasManager.drawCoordinateSystem();	
}

window.onload = main;