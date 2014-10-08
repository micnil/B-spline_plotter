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
	drawCoordinateSystem();
	theBSplineCurve.init();
	theBSplineCurve.centerAllPoints();
	theBSplineCurve.drawControlPolygon();
	theBSplineCurve.drawControlPoints();

	// Draw the view now:
	paper.view.draw();	
}

function drawCoordinateSystem(){

	// Create a Paper.js Path to draw a line into it:
	var verticalPath = new paper.Path();
	// Give the stroke a color
	verticalPath.strokeColor = 'black';
	verticalPath.dashArray=[5, 5];

	var verticalStart = new paper.Point(WIDTH/2,HEIGHT);
	var verticalEnd = new paper.Point(WIDTH/2, 0);
	// Move to start and draw a line from there
	verticalPath.moveTo(verticalStart);
	verticalPath.lineTo(verticalEnd);


	// Create a Paper.js Path to draw a line into it:
	var horizontalPath = new paper.Path();
	// Give the stroke a color
	horizontalPath.strokeColor = 'black';
	horizontalPath.dashArray=[5, 5];

	var horizontalStart = new paper.Point(0,HEIGHT/2);
	var horizontalEnd = new paper.Point(WIDTH, HEIGHT/2);
	// Move to start and draw a line from there
	horizontalPath.moveTo(horizontalStart);
	horizontalPath.lineTo(horizontalEnd);
}


window.onload = main;