function BSplineCurve(d, c, s, t){
	this.degree = d || 0;
	this.numOfCtrlPoints = c || 0;
	this.knots = new Array();
	this.ctrlPoints = new Array();
	this.ctrlPointSize = s || 5;
	this.tesselate = t || 10;
}

BSplineCurve.prototype = {

	setDegree: function(d){
		this.degree=d;
	},

	setNumOfCtrlPoints: function(num){
		this.numOfCtrlPoints = num;
	},

	addKnot: function(knot) 
	{
		this.knots.push(knot);
		this.knots.sort(this.sortNumber);
	},
	sortNumber: function (a,b) {
    	return a - b;
	},

	addCtrlPointCoords: function(x, y) {

		this.ctrlPoints.push(new paper.Point(x,y));
	},

	addCtrlPoint: function(paperPoint) {

		this.ctrlPoints.push(paperPoint);
		this.numOfCtrlPoints++;

		//Fix knot vector
		if(this.numOfCtrlPoints)
		this.knots.splice(this.knots.length-this.degree,this.degree);
		for(var i = 0; i<this.degree; i++){
			this.knots.push(this.numOfCtrlPoints + i + 1);
		}
		
		this.addKnot(this.numOfCtrlPoints);
	},

	drawControlPoints: function(){

		for(var i = 0; i<this.numOfCtrlPoints; i++){
			var ctrlPoint = new paper.Path.Circle(this.ctrlPoints[i], this.ctrlPointSize);
			ctrlPoint.fillColor = '#268bd2';
		}

	},

	drawControlPolygon: function(){

		for(var i = 0; i<(this.numOfCtrlPoints-1); i++){

			// Create a Paper.js Path to draw a line into it:
			var path = new paper.Path();
			// Give the stroke a color
			path.strokeColor = '#657b83';
			var start = this.ctrlPoints[i];
			// Move to start and draw a line from there
			path.moveTo(start);
	
			path.lineTo(this.ctrlPoints[i+1]);
		}

	},

	centerAllPoints: function(){

		for(var i = 0; i<(this.numOfCtrlPoints); i++){

			this.ctrlPoints[i].x = this.ctrlPoints[i].x + WIDTH / 3;
			this.ctrlPoints[i].y = -this.ctrlPoints[i].y + 2*HEIGHT / 3;
		}
	},

	renderBSpline: function(showSamplingPoints, toggleRenderMode){
		var bezierCurve;
		var i;

		if(toggleRenderMode == 3)
		{
			this.renderDeBoor();
		}
		else
		{
			for (i=this.degree; i< this.numOfCtrlPoints; i++) 
			{
				if (Math.abs(this.knots[i]-this.knots[i+1]) < 0.0001) continue;  // no segment, skip over
					bezierCurve = this.extractBezier(i);        // extract the i-th Bezier curve

					switch(toggleRenderMode) {
						case 1:
							//here the tesselate value will be used as the approximation tolerance;
							bezierCurve.renderAdaptive(this.tesselate, showSamplingPoints);
							break;
						case 2:
							//here the tesselate value will be used as number of samplingpoints
							bezierCurve.renderUniform(this.tesselate, showSamplingPoints);
							break;
					} 
			}
		}
	},

	tesselateUp: function(){
		if(this.tesselate>=10){
			this.tesselate=this.tesselate+5;
		}
		else if(this.tesselate<10 && this.tesselate>0){
			this.tesselate = this.tesselate+1;
		}
		console.log(this.tesselate);
	},
	tesselateDown: function(){

		if(this.tesselate>10){
			this.tesselate=this.tesselate-5;
		}
		else if(this.tesselate<=10 && this.tesselate>1.5){
			this.tesselate = this.tesselate-1;
		}
		console.log(this.tesselate);
	},

	extractBezier: function(ind){
		var i;
		var j;
		var bezierCurve = new BezierCurve();
		var knots = new Array()
		var k = this.degree;
		// copy one segment
		for (i=ind-k; i<=ind; i++) {
			bezierCurve.addCtrlPoint(new paper.Point(this.ctrlPoints[i]));
		}

		for (i=ind-k; i<= ind+k+1; i++) {
			knots.push(this.knots[i]);
		}

		// insert knots to make the left end be Bezier end
		while(1) {
			for (i=k-1; i>0; i--) {
				if (knots[i] < knots[k]) {
					j = i;
					break;
				}
				j = 0;
			}

			if(j==0) break;

			// update control points
			for (i=0; i<j; i++) {
				bezierCurve.ctrlPoints[i].x = ((knots[k+1+i]-knots[k])/(knots[k+i+1]-knots[i+1]))*bezierCurve.ctrlPoints[i].x 
						  + ((knots[k]-knots[i+1])/(knots[k+i+1]-knots[i+1]))*bezierCurve.ctrlPoints[i+1].x;
				bezierCurve.ctrlPoints[i].y = ((knots[k+1+i]-knots[k])/(knots[k+i+1]-knots[i+1]))*bezierCurve.ctrlPoints[i].y 
						  + ((knots[k]-knots[i+1])/(knots[k+i+1]-knots[i+1]))*bezierCurve.ctrlPoints[i+1].y;
			}
			// update knots
			for (i=0; i<j; i++)
				knots[i] = knots[i+1];
			knots[j] = knots[k];
		}

		// insert knots to make the right end be Bezier end
		while(1) {
			for (i=k+2; i< k+k+1; i++) {
				if (knots[i] > knots[k+1]) {
					j = i;
					break;
				}
				j = 0;
			}

			if(j==0) break;

			// update control points
			for (i=k; i>=j-k; i--) {
				bezierCurve.ctrlPoints[i].x = ((knots[k+i]-knots[k+1])/(knots[k+i]-knots[i]))*bezierCurve.ctrlPoints[i-1].x 
						  + ((knots[k+1]-knots[i])/(knots[k+i]-knots[i]))*bezierCurve.ctrlPoints[i].x;
				bezierCurve.ctrlPoints[i].y = ((knots[k+i]-knots[k+1])/(knots[k+i]-knots[i]))*bezierCurve.ctrlPoints[i-1].y 
						  + ((knots[k+1]-knots[i])/(knots[k+i]-knots[i]))*bezierCurve.ctrlPoints[i].y;
			}
			// update knots
			for (i=k+k+1; i>j; i--)
				knots[i] = knots[i-1];
			knots[j] = knots[k+1];
		}

		bezierCurve.setMinDistance(this.tesselate);
		return bezierCurve;

	},

	renderDeBoor: function()
	{
		var begin = this.knots[this.degree];
		var end = this.knots[this.numOfCtrlPoints]-0.001;
		var samplingPoints = new Array();
		var samplingstep = (end-begin)/this.tesselate;

		// Get all samplingpoints 
		var i = 0;
		while(i<=this.tesselate)
		{
			u = begin + i*samplingstep;
			u = u>end ? end : u;
			var h = this.degree;
			for(var k = this.degree; k<(this.degree + this.numOfCtrlPoints); k++)
			{
				if(u>=this.knots[k] && u<this.knots[k+1])
					break;
			}

			samplingPoints.push(this.deBoor(h, k, u));
			i++;
		}
	
		//Draw curve
		for(var i = 0; i<samplingPoints.length-1;i++)
		{
			this.drawLine(samplingPoints[i],samplingPoints[i+1]);
		}
	},

	deBoor: function(h, i, u)
	{   

		if( h == 0)
		{
			return this.ctrlPoints[i];
		}
		else
		{   
			var alpha = (u-this.knots[i])/(this.knots[i+this.degree+1-h]-this.knots[i]);
			return ((this.deBoor(h-1, i-1, u).multiply(1-alpha )).add(this.deBoor(h-1, i, u).multiply(alpha)) );
		}
	},

	drawLine: function(p1, p2){

		// Create a Paper.js Path to draw a line into it:
		var path = new paper.Path();
		// Give the stroke a color
		path.strokeColor = '#dc322f';
		path.moveTo(p1);
		path.lineTo(p2);

	},
}