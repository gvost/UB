  var NUM_SEGMENTS = 7;
  var BIG_BALL_SIZE = 5;
  var SMALL_BALL_SIZE = 2;

  var colors = [
    "#f5ea14",    // yellow
    "#29a9e1",    // blue
    "#f9f9f9",    // white
    "#111111",     // dark grey
    "#000000"     // black
  ];

  // detect canvas height and width
  var container = document.getElementById("canvas-background");
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  // create the canvas 
  var canvas = document.createElement('canvas');
  container.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');

  var requestAnimationFrame = 
    window.requestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame;


  function LineSegment(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  function SegmentPair(seg1, seg2, color) {
    this.seg1 = seg1;
    this.seg2 = seg2;
    this.color = color;
    this.intersecting;
  }

  function Circle(x, y, dx, dy, radius, color, speed) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
  }

  Circle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.fill();
    ctx.stroke();
  }

  Circle.prototype.update = function() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    if (this.x < 0 || this.x > width)
      this.dx *= -1;
    if (this.y < 0 || this.y > height)
      this.dy *= -1;
  }

    // initialize circles
  var circles = [];
  for (var i = 0; i < NUM_SEGMENTS; i++) {
    circles[i] = new Circle(
      randInt(width), 
      randInt(height), 
      (randFloat(2) - 1) / 4, 
      (randFloat(2) - 1) / 4, 
      BIG_BALL_SIZE, 
      "#4c4c4c", 
      3
    );
  };

  var segments = [], s;
  for (var i = 0; i < NUM_SEGMENTS; i++) {
    s = new LineSegment(circles[i], circles[(i + 1) % NUM_SEGMENTS]);
    segments.push(s);
  }

  var segment_pairs = [], sp;
  for (var i = 0; i < NUM_SEGMENTS - 1; i++) {
    for (var j = i + 1; j < NUM_SEGMENTS; j++) {
      sp = new SegmentPair(
        segments[i], 
        segments[j],
        colors[segment_pairs.length % 2] 
      );
      segment_pairs.push(sp);
    }
  }

  var back_circles = [];
  for (var i = 0; i < 20; i++) {
    back_circles[i] = new Circle(
      randInt(width),                   
      randInt(height), 
      (randFloat(2) - 1) / 4, 
      (randFloat(2) - 1) / 4, 
      SMALL_BALL_SIZE, 
      "rgba(249, 249, 249, 0.4)",
  /*    (function() {
        if (i <= 3)
          return "rgba(245, 234, 20, 0.6)";
        else if (i <= 7)
          return "rgba(41, 169, 225, 0.6)";
        else 
          return "rgba(249, 249, 249, 0.4)";
      })(),*/
      1
    );
  }  

  // start the animation
  requestAnimationFrame(loop);

  // other functions
  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "rgba(45, 45, 45, 0.5)";
    ctx.stroke();
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function randFloat(max) {
    return Math.random() * max;
  }

  var end, i;
  function loop() {

    ctx.clearRect(0, 0 , width, height); 

    end = circles.length;
    for (var i = 0; i < end; i++) {
      circles[i].update();
     // circles[i].draw();
    }

    end = segments.length;
    for (var i = 0; i < end; i++) {
      drawLine(segments[i].p1.x, segments[i].p1.y, segments[i].p2.x, segments[i].p2.y);
    }

    var isect;
    end = segment_pairs.length;
    for (var i = 0; i < end; i++) {
      isect = getIntersection(
          segment_pairs[i].seg1.p1.x, segment_pairs[i].seg1.p1.y,
          segment_pairs[i].seg1.p2.x, segment_pairs[i].seg1.p2.y,
          segment_pairs[i].seg2.p1.x, segment_pairs[i].seg2.p1.y,
          segment_pairs[i].seg2.p2.x, segment_pairs[i].seg2.p2.y
        );
        
      if (isect.onLine1 && isect.onLine2)
        drawCircle(isect.x, isect.y, BIG_BALL_SIZE, segment_pairs[i].color);
    }

    end = back_circles.length;
    for (i = 0; i < end; i++) {
      back_circles[i].update();
      back_circles[i].draw();
    }

    requestAnimationFrame(loop);
  }

  function getIntersection(line1StartX, line1StartY, line1EndX, line1EndY, 
                           line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection 
    // (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };

    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - 
                  ((line2EndX - line2StartX) * (line1EndY - line1StartY));

    if (denominator == 0) {
        return result;
    }

    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    // if line1 is a segment and line2 is infinite, they intersect if:
    result.onLine1 = (a > 0 && a < 1);

    // if line2 is a segment and line1 is infinite, they intersect if:
    result.onLine2 = (b > 0 && b < 1);

    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.fill();
  ctx.stroke();
}