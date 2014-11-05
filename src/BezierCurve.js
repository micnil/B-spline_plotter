function BezierCurve(d, c, m){
	this.degree = d || 0;
	this.numOfCtrlPoints = c || 0;
	this.ctrlPoints = new Array();
}


BezierCurve.prototype = {

	renderAdaptive: function(tolerance, showSamplingPoints){

		var height = this.maxDistance();
		if (height < tolerance) {
			this.drawLine(this.ctrlPoints[0], this.ctrlPoints[this.numOfCtrlPoints-1]);
			if(showSamplingPoints){
				this.drawPoint(this.ctrlPoints[0]);
				this.drawPoint(this.ctrlPoints[this.numOfCtrlPoints-1]);
			}
		}
		else {

			var midPoints = new Array();
			for(var i = 0; i<this.numOfCtrlPoints; i++){
				midPoints[i] = this.ctrlPoints[i];
			}

			var j = 0;
			var lastIndex=0;
			for(var i = this.numOfCtrlPoints-1; i > 0; i--){
				while(j<lastIndex+i){

					midPoints.push(this.getMidPoint(midPoints[j], midPoints[j+1]));
					j++;
				}
				j++;
				lastIndex = j;
			}


			var leftBez = new BezierCurve();
			var rightBez = new BezierCurve();
			var n;

			n=this.numOfCtrlPoints+1;
			for(var i = 0; n > 1; i=i+n){
				leftBez.addCtrlPoint(midPoints[i]);
				n--;
			}

			n=this.numOfCtrlPoints;
			for(var i = this.numOfCtrlPoints-1; n > 0; i=i+n){
				rightBez.addCtrlPoint(midPoints[i]);
				n--;
			}	
	
			leftBez.renderAdaptive(tolerance, showSamplingPoints);
			rightBez.renderAdaptive(tolerance, showSamplingPoints);
		}

	},

	renderUniform: function(numOfSamplingPoints, showSamplingPoints){

		var samplingStep = 1/numOfSamplingPoints;

		var samplingPoints = new Array();
		var t=0;

		while(t<=1.0){

			var q = new Array();

			for(var i = 0; i<this.numOfCtrlPoints; i++){
				q.push(this.ctrlPoints[i]);
			}

			for(var k = 1; k<this.numOfCtrlPoints; k++){
				for(var i = 0; i < this.numOfCtrlPoints-k; i++){
					q[i].x = (1-t)*q[i].x + t*q[i+1].x;
					q[i].y = (1-t)*q[i].y + t*q[i+1].y;
				}
			}

			console.log(q[0]);
			//------------------------------------
			samplingPoints.push(new paper.Point(q[0].x,q[0].y));
			t=t+samplingStep;
		}

		for(var i = 0; i<samplingPoints.length-1; i++){
			this.drawLine(samplingPoints[i],samplingPoints[i+1])
		}
		if(showSamplingPoints){
			for(var i = 0; i<samplingPoints.length; i++){
				this.drawPoint(samplingPoints[i]);
			}
		}

	},

	getMidPoint: function(p1, p2){
		var midPoint = new paper.Point();

		//lerp t=0.5
		midPoint.x = p1.x*0.5 + p2.x * 0.5;
		midPoint.y = p1.y*0.5 + p2.y * 0.5;
		return midPoint;
	},

	drawLine: function(p1, p2){

		// Create a Paper.js Path to draw a line into it:
		var path = new paper.Path();
		// Give the stroke a color
		path.strokeColor = '#dc322f';
		path.moveTo(p1);
		path.lineTo(p2);

	},

	maxDistance: function(){

		var allDistances = new Array();
		var longestDistance=0.0;
		// First control point - last control point
		var baseLineVector = this.ctrlPoints[this.numOfCtrlPoints-1].subtract(this.ctrlPoints[0]);

		for(var i = 1; i<this.numOfCtrlPoints-1; i++){
			var vector = this.ctrlPoints[i].subtract(this.ctrlPoints[0]);

			var p = (vector.x*baseLineVector.x + vector.y*baseLineVector.y) / (baseLineVector.x*baseLineVector.x + baseLineVector.y*baseLineVector.y);
			var projection = new paper.Point(baseLineVector.x * p, baseLineVector.y * p);
			var orthogonalProjection = projection.subtract(vector);
			var distanceFromBaseLineVector = Math.sqrt(orthogonalProjection.x*orthogonalProjection.x + orthogonalProjection.y*orthogonalProjection.y);

			allDistances.push(distanceFromBaseLineVector);
		}

		for(var i = 0; i<allDistances.length; i++){
			if(longestDistance < allDistances[i]){
				longestDistance=distanceFromBaseLineVector
			}

		}
		return longestDistance;

	},

	addCtrlPoint: function(point){
		this.ctrlPoints.push(new paper.Point(point));
		this.numOfCtrlPoints++;
		this.degree = this.numOfCtrlPoints-1;
	},


	renderBezierPolygon: function(){

		for(var i = 0; i<(this.numOfCtrlPoints-1); i++){

			// Create a Paper.js Path to draw a line into it:
			var path = new paper.Path();
			// Give the stroke a color
			path.strokeColor = '#dc322f';
			var start = this.ctrlPoints[i];
			// Move to start and draw a line from there
			path.moveTo(start);
			path.lineTo(this.ctrlPoints[i+1]);
		}
	},

	renderCtrlPoints: function(){

		for(var i = 0; i<this.numOfCtrlPoints; i++){
			var ctrlPoint = new paper.Path.Circle(this.ctrlPoints[i], 2);
			ctrlPoint.fillColor = '#6c71c4';
		}
	},

	setMinDistance: function(minDistance){

		this.minDistance=minDistance;
	},

	drawPoint: function(p){
			var point = new paper.Path.Circle(p, 1.5);
			point.fillColor = '#6c71c4';
	},

}