function CanvasManager(canvas, theBSplineCurve){

	this.curveCanvas = canvas;

	this.theBSplineCurve = theBSplineCurve;
	this.loadBtn = document.getElementById('loadBtn');
	this.adaptiveSign = document.getElementById('adaptive');
	this.tesselationSign = document.getElementById('tesselation');
	this.showSamplesSign = document.getElementById('showSamples');
	this.showPolygonSign = document.getElementById('showPolygon');
	this.loadBtn.addEventListener('click', this.loadBtnAction.bind(this),false);

	//states
	this.showControlPolygon = true;
	this.showSamplingPoints = false;
	this.toggleRenderMode = 1;

	this.adaptiveSign.innerHTML = "(a) Render mode = Adaptive";
	this.tesselationSign.innerHTML = "(+/-) Tesselation = " + this.theBSplineCurve.tesselate;  
	this.showSamplesSign.innerHTML = "(p) Show samples = False";
	this.showPolygonSign.innerHTML = "(c) Show control polygon = True ";
	window.addEventListener( "keydown", this.keyManager.bind(this), false );

}
CanvasManager.prototype = {

	loadBtnAction: function(){

		this.clearCanvas();

		this.theBSplineCurve = new BSplineCurve();
		var fileInput = document.getElementById('fileInput').value;

		var lines = fileInput.match(/[^\r\n]+/g);

		this.theBSplineCurve.setDegree(parseFloat(lines[0]))
		this.theBSplineCurve.setNumOfCtrlPoints(parseFloat(lines[1]))

		var knots = lines[2].match(/\S+/g);
		for (var i = 0; i < knots.length; i++) {
			this.theBSplineCurve.addKnot(parseFloat(knots[i]));
		};

		for(var i = 3; i<lines.length; i++){
			var ctrlPoint = lines[i].match(/\S+/g);
			this.theBSplineCurve.addCtrlPointCoords(parseFloat(ctrlPoint[0]),parseFloat(ctrlPoint[1]))
		}
		this.theBSplineCurve.centerAllPoints();
		this.renderBSpline();
	},

	renderBSpline: function(){

		if(this.showControlPolygon){
			this.theBSplineCurve.drawControlPolygon();
			this.theBSplineCurve.drawControlPoints();
		}
		this.theBSplineCurve.adaptiveRender(this.showSamplingPoints, this.toggleRenderMode);

		// Draw the view now:
		paper.view.draw();
	},

	drawCoordinateSystem: function(){

		// Create a Paper.js Path to draw a line into it:
		var verticalPath = new paper.Path();
		// Give the stroke a color
		verticalPath.strokeColor = 'black';
		verticalPath.dashArray=[5, 5];

		var verticalStart = new paper.Point(WIDTH/3,HEIGHT);
		var verticalEnd = new paper.Point(WIDTH/3, 0);
		// Move to start and draw a line from there
		verticalPath.moveTo(verticalStart);
		verticalPath.lineTo(verticalEnd);


		// Create a Paper.js Path to draw a line into it:
		var horizontalPath = new paper.Path();
		// Give the stroke a color
		horizontalPath.strokeColor = 'black';
		horizontalPath.dashArray=[5, 5];

		var horizontalStart = new paper.Point(0,2*HEIGHT/3);
		var horizontalEnd = new paper.Point(WIDTH, 2*HEIGHT/3);
		// Move to start and draw a line from there
		horizontalPath.moveTo(horizontalStart);
		horizontalPath.lineTo(horizontalEnd);
	},

	clearCanvas: function(){

		var l = paper.project.activeLayer.children.length;
		for(var i=0; i < l; i++){
		    paper.project.activeLayer.children[0].remove();
		}
		this.drawCoordinateSystem();
	},

	keyManager: function(e){
		if(e.keyCode == 171){
			this.theBSplineCurve.tesselateUp();
			this.clearCanvas();
			this.renderBSpline();
			this.tesselationSign.innerHTML = "(+/-) Tesselation = " + this.theBSplineCurve.tesselate; 
		}
		if(e.keyCode == 173){
			this.theBSplineCurve.tesselateDown();
			this.clearCanvas();
			this.renderBSpline();
			this.tesselationSign.innerHTML = "(+/-) Tesselation = " + this.theBSplineCurve.tesselate; 
		}
		if(e.keyCode == 67){
			if(this.showControlPolygon){
				this.showControlPolygon = false;
				this.clearCanvas();
				this.renderBSpline();
				this.showPolygonSign.innerHTML = "(c) Show control polygon = False";
			}
			else{
				this.showControlPolygon = true;
				this.clearCanvas();
				this.renderBSpline();
				this.showPolygonSign.innerHTML = "(c) Show control polygon = True ";
			}
		}
		if(e.keyCode == 80){
			if(this.showSamplingPoints){
				this.showSamplingPoints = false;
				this.clearCanvas();
				this.renderBSpline();
				this.showSamplesSign.innerHTML = "(p) Show samples = False";
			}
			else{
				this.showSamplingPoints = true;
				this.clearCanvas();
				this.renderBSpline();
				this.showSamplesSign.innerHTML = "(p) Show samples = True";
			}
		}
		if(e.keyCode == 65){
			if(this.toggleRenderMode==3){
				this.toggleRenderMode = 1;
				this.clearCanvas();
				this.renderBSpline();
				this.adaptiveSign.innerHTML = "(a) Render mode: Adaptive";
			}
			else if(this.toggleRenderMode==1){
				this.toggleRenderMode = 2;
				this.clearCanvas();
				this.renderBSpline();
				this.adaptiveSign.innerHTML = "(a) Render mode: Uniform";
			}
			else if(this.toggleRenderMode==2 && this.theBSplineCurve.degree == 3){
				this.toggleRenderMode = 3;
				this.clearCanvas();
				this.renderBSpline();
				this.adaptiveSign.innerHTML = "(a) Render mode: Brute force";
			}
			else{
				this.toggleRenderMode = 1;
				this.clearCanvas();
				this.renderBSpline();
				this.adaptiveSign.innerHTML = "(a) Render mode: Adaptive";
			}
		}
	}
}