function CanvasManager(canvas){

	this.curveCanvas = canvas;
	this.curveCanvas.setAttribute('tabindex','0');
	this.BSplineCurves = new Array();

	this.numOfSplines = 0;
	this.activeSplineIndex = 0;
	
	//this.loadBtn = document.getElementById('loadBtn');
	this.adaptiveSign = document.getElementById('adaptive');
	this.tesselationSign = document.getElementById('tesselation');
	this.showSamplesSign = document.getElementById('showSamples');
	this.showPolygonSign = document.getElementById('showPolygon');
	this.loadFile = document.getElementById('loadFile');
	this.clearBtn = document.getElementById('clearBtn');
	this.startBtn = document.getElementById('startBtn');
	this.endBtn = document.getElementById('endBtn');
	this.degreeField = document.getElementById('degreeField');
	this.inputTool = new paper.Tool();
		
	this.loadFile.addEventListener('change', this.loadFileAction.bind(this),false);
	this.clearBtn.addEventListener('click', this.clearSplines.bind(this), false);
	this.startBtn.addEventListener('click', this.createSpline.bind(this), false);
	this.endBtn.addEventListener('click', this.stopCreateSpline.bind(this), false);
	//this.degreeField.addEventListener('change', );
	

	//states
	this.showControlPolygon = true;
	this.showSamplingPoints = false;
	this.toggleRenderMode = 1;
	this.createMode = false;

	this.adaptiveSign.innerHTML = "(r) Render mode = Adaptive";
	this.tesselationSign.innerHTML = "(u/d) Tesselation = 10";  
	this.showSamplesSign.innerHTML = "(p) Show samples = False";
	this.showPolygonSign.innerHTML = "(c) Show control polygon = True ";
	//window.addEventListener( "keydown", this.keyManager.bind(this), false );
	//if paper script keeps bugging..
	//this.curveCanvas.addEventListener( "mousedown", this.onMouseDown.bind(this), false );
	this.inputTool.onMouseDown = this.onMouseDown.bind(this);
	this.inputTool.onKeyUp = this.keyManager.bind(this);

}
CanvasManager.prototype = {

	loadFileAction: function(e){
		this.clearCanvas();

		this.BSplineCurves.push(new BSplineCurve());
		this.numOfSplines++;
		var input = e.target;

		var reader = new FileReader();

		var _this = this;

		reader.onload = function(){
			var fileInput = reader.result;

			var lines = fileInput.match(/[^\r\n]+/g);

			_this.BSplineCurves[_this.numOfSplines-1].setDegree(parseFloat(lines[0]))
			_this.BSplineCurves[_this.numOfSplines-1].setNumOfCtrlPoints(parseFloat(lines[1]))

			var knots = lines[2].match(/\S+/g);
			for (var i = 0; i < knots.length; i++) {
				_this.BSplineCurves[_this.numOfSplines-1].addKnot(parseFloat(knots[i]));
			};

			for(var i = 3; i<lines.length; i++){
				var ctrlPoint = lines[i].match(/\S+/g);
				_this.BSplineCurves[_this.numOfSplines-1].addCtrlPointCoords(parseFloat(ctrlPoint[0]),parseFloat(ctrlPoint[1]))
			}
			_this.BSplineCurves[_this.numOfSplines-1].centerAllPoints();
			_this.renderBSplines();
		};

		reader.readAsText(input.files[0]);

	},

	renderBSplines: function(){

		//Draw controll polygon
		if(this.showControlPolygon){
			for(var i = 0; i < this.numOfSplines; i++)
			{
				this.BSplineCurves[i].drawControlPolygon();
				this.BSplineCurves[i].drawControlPoints();
			}
		}

		//draw all the splines
		for(var i = 0; i < this.numOfSplines; i++)
		{
			this.BSplineCurves[i].renderBSpline(this.showSamplingPoints, this.toggleRenderMode);
		}
		
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

	keyManager: function(event){
		console.log(event.key);
		if(event.key == "u" && this.BSplineCurves.length>0){ //73
			this.BSplineCurves[this.numOfSplines-1].tesselateUp();
			this.clearCanvas();
			this.renderBSplines();
			this.tesselationSign.innerHTML = "(u/d) Tesselation = " + this.BSplineCurves[this.numOfSplines-1].tesselate; 
		}
		if(event.key == "d" && this.BSplineCurves.length>0){ //68
			this.BSplineCurves[this.numOfSplines-1].tesselateDown();
			this.clearCanvas();
			this.renderBSplines();
			this.tesselationSign.innerHTML = "(u/d) Tesselation = " + this.BSplineCurves[this.numOfSplines-1].tesselate; 
		}
		if(event.key == "c"){ //67
			if(this.showControlPolygon){
				this.showControlPolygon = false;
				this.clearCanvas();
				this.renderBSplines();
				this.showPolygonSign.innerHTML = "(c) Show control polygon = False";
			}
			else{
				this.showControlPolygon = true;
				this.clearCanvas();
				this.renderBSplines();
				this.showPolygonSign.innerHTML = "(c) Show control polygon = True ";
			}
		}
		if(event.key == "p"){ //80
			if(this.showSamplingPoints){
				this.showSamplingPoints = false;
				this.clearCanvas();
				this.renderBSplines();
				this.showSamplesSign.innerHTML = "(p) Show samples = False";
			}
			else{
				this.showSamplingPoints = true;
				this.clearCanvas();
				this.renderBSplines();
				this.showSamplesSign.innerHTML = "(p) Show samples = True";
			}
		}
		if(event.key == "r"){ //65
			if(this.toggleRenderMode==3){
				this.toggleRenderMode = 1;
				this.clearCanvas();
				this.renderBSplines();
				this.adaptiveSign.innerHTML = "(r) Render mode: Adaptive";
			}
			else if(this.toggleRenderMode==1){
				this.toggleRenderMode = 2;
				this.clearCanvas();
				this.renderBSplines();
				this.adaptiveSign.innerHTML = "(r) Render mode: Uniform";
			}
			else if(this.toggleRenderMode==2){
				this.toggleRenderMode = 3;
				this.clearCanvas();
				this.renderBSplines();
				this.adaptiveSign.innerHTML = "(r) Render mode: De Boor";
			}
		}
	},

	clearSplines: function() 
	{
		this.BSplineCurves = new Array();
		this.numOfSplines = 0;
		this.clearCanvas();
		this.curveCanvas.focus();
	},

	createSpline: function()
	{
		this.endBtn.disabled=false;
		this.startBtn.disabled=true;
		this.createMode = true;
		this.BSplineCurves.push(new BSplineCurve());
		this.activeSplineIndex = this.numOfSplines;
		this.numOfSplines++;
		var theDegree = parseInt(this.degreeField.value);
		this.BSplineCurves[this.activeSplineIndex].setDegree(theDegree);

		for(var i = 0; i<this.BSplineCurves[this.activeSplineIndex].degree; i++)
			this.BSplineCurves[this.activeSplineIndex].addKnot(i);

		this.curveCanvas.focus();
	},

	stopCreateSpline: function()
	{
		this.endBtn.disabled=true;
		this.startBtn.disabled=false;
		this.createMode = false;
	},

	onMouseDown: function (event) {
		this.curveCanvas.focus();
		if(this.createMode)
		{
			this.BSplineCurves[this.activeSplineIndex].addCtrlPoint( event.point );//this.getMousePoint(event) 
			this.clearCanvas();
			this.renderBSplines();
		}
	},

	/*getMousePoint : function(event) {
  		//getting mouse position correctly 
  		var bRect = this.curveCanvas.getBoundingClientRect();
  		mouseX = (event.clientX - bRect.left)*(WIDTH/bRect.width);
  		mouseY = (event.clientY - bRect.top)*(HEIGHT/bRect.height);
  		var mouseCoords = new paper.Point(mouseX,mouseY);
  		return mouseCoords;
  	},*/
}