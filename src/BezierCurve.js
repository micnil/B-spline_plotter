function BezierCurve(d, c, m){
	this.degree = d || 0;
	this.numOfCtrlPoints = c || 0;
	this.ctrlPoints = new Array();
	this.minDistance = m || 10.0;
	this.drawSamplingPoints = true;
}


BezierCurve.prototype = {

	renderBezier: function(){
		//casteljau algorithm

		var height = this.maxDistance();
		if (height < this.minDistance) {
			this.drawLine(this.ctrlPoints[0], this.ctrlPoints[this.numOfCtrlPoints-1]);
			if(this.drawSamplingPoints){
				this.drawPoints(this.ctrlPoints[0], this.ctrlPoints[this.numOfCtrlPoints-1]);
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
			leftBez.setMinDistance(this.minDistance);

			var rightBez = new BezierCurve();
			rightBez.setMinDistance(this.minDistance);

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
	
			leftBez.renderBezier();
			rightBez.renderBezier();
		}

	},

	getMidPoint: function(p1, p2){
		var midPoint;

		midPoint = (p2.subtract(p1)).divide(2);
		midPoint = p1.add(midPoint);
		return midPoint;

	},

	midSubdivide: function(){



	},

	drawLine: function(p1, p2){

		// Create a Paper.js Path to draw a line into it:
		var path = new paper.Path();
		// Give the stroke a color
		path.strokeColor = 'red';
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
			path.strokeColor = 'red';
			var start = this.ctrlPoints[i];
			// Move to start and draw a line from there
			path.moveTo(start);
			path.lineTo(this.ctrlPoints[i+1]);
		}
	},

	renderCtrlPoints: function(){

		for(var i = 0; i<this.numOfCtrlPoints; i++){
			var ctrlPoint = new paper.Path.Circle(this.ctrlPoints[i], 2);
			ctrlPoint.fillColor = 'purple';
		}
	},

	setMinDistance: function(minDistance){

		this.minDistance=minDistance;
	},

	drawPoints: function(p1, p2){
			var point = new paper.Path.Circle(p1, 1);
			point.fillColor = 'purple';

			var point = new paper.Path.Circle(p2, 1);
			point.fillColor = 'purple';

	},

}