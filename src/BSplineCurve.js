function BSplineCurve(d, c, s){
	this.degree = d || 0;
	this.numOfCtrlPoints = c || 0;
	this.knots = new Array();
	this.ctrlPoints = new Array();
	this.ctrlPointSize = s || 5;
}

BSplineCurve.prototype = {


	init: function(){

		this.setDegree(3);
		//this.setNumOfCtrlPoints(4);
		this.addKnot(0);
		this.addKnot(0.5);
		this.addKnot(1);
		this.addKnot(2);
		this.addKnot(3);
		this.addKnot(3.5);
		this.addKnot(4.5);
		this.addKnot(5);

		this.addCtrlPointCoords(0,0);
		this.addCtrlPointCoords(10,50);
		this.addCtrlPointCoords(30,10);
		this.addCtrlPointCoords(100,100);
	},

	setDegree: function(d){
		this.degree=d;
	},

	setNumOfCtrlPoints: function(num){
		this.numOfCtrlPoints = num;
	},

	addKnot: function(knot) {

		this.knots.push(knot)

	},

	addCtrlPointCoords: function(x, y) {
		this.ctrlPoints.push(new paper.Point(x,y));
		this.numOfCtrlPoints++;

	},

	addCtrlPoint: function(paperPoint) {

		this.ctrlPoints.push(paperPoint);
		this.numOfCtrlPoints++;

	},

	drawControlPoints: function(){


		for(var i = 0; i<this.numOfCtrlPoints; i++){
			var ctrlPoint = new paper.Path.Circle(this.ctrlPoints[i], this.ctrlPointSize);
			ctrlPoint.fillColor = 'blue';
		}

	},

	drawControlPolygon: function(){

		for(var i = 0; i<(this.numOfCtrlPoints-1); i++){

			// Create a Paper.js Path to draw a line into it:
			var path = new paper.Path();
			// Give the stroke a color
			path.strokeColor = 'black';
			var start = this.ctrlPoints[i];
			// Move to start and draw a line from there
			path.moveTo(start);
			// Note that the plus operator on Point objects does not work
			// in JavaScript. Instead, we need to call the add() function:
			path.lineTo(this.ctrlPoints[i+1]);
		}

	},

	centerAllPoints: function(){

		for(var i = 0; i<(this.numOfCtrlPoints); i++){

			this.ctrlPoints[i].x = this.ctrlPoints[i].x + WIDTH / 2;
			this.ctrlPoints[i].y = -this.ctrlPoints[i].y + HEIGHT / 2;
		}
	},

	adaptiveRender: function(){

	Point2d  bez[30];  // assume the degree is not greater than 29.
	var i;

	for (i=bcr.degree; i< bcr.cntNum; i++) {
		if (fabs(bcr.knots[i]-bcr.knots[i+1]) < 0.00001) continue;  // no segment, skip over
		extractBezier (bez, i);        // extract the i-th Bezier curve
		plotBezier(bez, bcr.degree);   // adaptively plot a Bezier curve 
	}


	},


	exctractBezier: function(ind){
		var i;
		var j;
		var bezierCurve = new BezierCurve();
		var knots = new Array()
		var k = this.degree;
		// copy one segment
		for (i=ind-k; i<=ind; i++) {
			bezierCurve.ctrlPoints.push(new paper.Point(this.ctrlPoints[i]));
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
				bezierCurve.ctrlPoints[i].x = ((knots[k+1+i]-knots[k])/(knots[k+i+1]-knots[i+1]))*cnt[i].x 
						  + ((knots[k]-knots[i+1])/(knots[k+i+1]-knots[i+1]))*cnt[i+1].x;
				bezierCurve.ctrlPoints[i].y = ((knots[k+1+i]-knots[k])/(knots[k+i+1]-knots[i+1]))*cnt[i].y 
						  + ((knots[k]-knots[i+1])/(knots[k+i+1]-knots[i+1]))*cnt[i+1].y;
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
				bezierCurve.ctrlPoints[i].x = ((knots[k+i]-knots[k+1])/(knots[k+i]-knots[i]))*cnt[i-1].x 
						  + ((knots[k+1]-knots[i])/(knots[k+i]-knots[i]))*cnt[i].x;
				bezierCurve.ctrlPoints[i].y = ((knots[k+i]-knots[k+1])/(knots[k+i]-knots[i]))*cnt[i-1].y 
						  + ((knots[k+1]-knots[i])/(knots[k+i]-knots[i]))*cnt[i].y;
			}
			// update knots
			for (i=k+k+1; i>j; i--)
				knots[i] = knots[i-1];
			knots[j] = knots[k+1];
		}


		return bezierCurve;

	},

}