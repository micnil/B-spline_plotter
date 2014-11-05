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

	addKnot: function(knot) {

		this.knots.push(knot)

	},

	addCtrlPointCoords: function(x, y) {
		this.ctrlPoints.push(new paper.Point(x,y));
		//this.numOfCtrlPoints++;
	},

	addCtrlPoint: function(paperPoint) {

		this.ctrlPoints.push(paperPoint);
		this.numOfCtrlPoints++;

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
			// Note that the plus operator on Point objects does not work
			// in JavaScript. Instead, we need to call the add() function:
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
	for (i=this.degree; i< this.numOfCtrlPoints; i++) {
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
		var end = this.knots[this.numOfCtrlPoints];
		var samplingPoints = new Array();
		var k = this.degree;
		var degree = this.degree;
		var u = 0;

		for(var i=0; i<this.tesselate; i++)
		{
			u = (begin + i*(end-begin)/tesselate);
			samplingPoints.push(deBoor(u));
		}
	},

	deBoor: function(u)
	{
		var knots = this.knots;
		var h = 0;
		var s = 0;
		var p = this.degree;
		var k;
		for(k = 0; k<(this.degree + this.numOfCtrlPoints + 1); k++)
		{
			if(u>=knots[k] && u<=knots[k+1])
			{
				if(u == knots[k])
				{
					//check multiplicity of knots[k]
					while(knots[k+s] == knots[k+s+1])
						s++;
					s++;

					h = (p-s)>0 ? p-s : 0;
				}
				else
				{
					h = p;
					s = 0;
				}
				break;
			}
		}
		//copy relevant control points
		var ctrlPoints = [new Array(), new array()];
		for (j=k-p+1; j<=k+1; j++)
			ctrlPoints.push(this.ctrlPoints[j][0]);
		


/*		If u lies in [uk,uk+1) and u != uk, let h = p (i.e., inserting u p times) and s = 0;
		If u = uk and uk is a knot of multiplicity s, let h = p - s (i.e., inserting u p - s times);
		Copy the affected control points Pk-s, Pk-s-1, Pk-s-2, ..., Pk-p+1 and Pk-p to a new array and rename them as Pk-s,0, Pk-s-1,0, Pk-s-2,0, ..., Pk-p+1,0;

		for r := 1 to h do

			for i := k-p+r to k-s do
				begin
					Let ai,r = (u - ui) / ( ui+p-r+1 - ui )
					Let Pi,r = (1 - ai,r) Pi-1,r-1 + ai,r Pi,r-1
				end

		Pk-s,p-s is the point C(u). */
	},

}