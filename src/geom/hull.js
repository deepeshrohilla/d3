/**
 * Computes the 2D convex hull of a set of points using Graham's scanning
 * algorithm. The algorithm has been implemented as described in Cormen,
 * Leiserson, and Rivest's Introduction to Algorithms. The running time of
 * this algorithm is O(n log n), where n is the number of input points.
 *
 * @param vertices [[x1, y1], [x2, y2], …]
 * @returns polygon [[x1, y1], [x2, y2], …],
 */
d3.geom.hull = function(vertices) {
  if (vertices.length < 3) return [];

  var len = vertices.length,
      plen = len - 1,
      points = [],
      stack = [],
      i, j, h = 0, x1, y1, x2, y2, u, v, a, sp;

  // find the starting ref point: leftmost point with the minimum y coord
  for (i=1; i<len; ++i) {
    if (vertices[i][1] < vertices[h][1]) {
      h = i;
    } else if (vertices[i][1] == vertices[h][1]) {
      h = (vertices[i][0] < vertices[h][0] ? i : h);
    }
  }

  // calculate polar angles from ref point and sort
  for (i=0; i<len; ++i) {
    if (i == h) continue;
    y1 = vertices[i][1] - vertices[h][1];
    x1 = vertices[i][0] - vertices[h][0];
    points.push({angle: Math.atan2(y1, x1), index: i});
  }
  points.sort(function(a, b) { return a.angle - b.angle; });

  // toss out duplicate angles
  a = points[0].angle;
  v = points[0].index;
  u = 0;
  for (i=1; i<plen; ++i) {
    j = points[i].index;
    if (a == points[i].angle) {
      // keep angle for point most distant from the reference
      x1 = vertices[v][0] - vertices[h][0];
      y1 = vertices[v][1] - vertices[h][1];
      x2 = vertices[j][0] - vertices[h][0];
      y2 = vertices[j][1] - vertices[h][1];
      if ((x1*x1 + y1*y1) >= (x2*x2 + y2*y2)) {
        points[i].index = -1;
      } else {
        points[u].index = -1;
        a = points[i].angle;
        u = i;
        v = j;
      }
    } else {
      a = points[i].angle;
      u = i;
      v = j;
    }
  }

  // initialize the stack
  stack.push(h);
  for (i=0, j=0; i<2; ++j) {
    if (points[j].index != -1) {
      stack.push(points[j].index);
      i++;
    }
  }
  sp = stack.length;

  // do graham's scan
  for (; j<plen; ++j) {
    if (points[j].index == -1) continue; // skip tossed out points
    while (d3_geom_hullIsNonLeft(h, stack[sp-2], stack[sp-1], points[j].index, vertices)) {
      --sp;
    }
    stack[sp++] = points[j].index;
  }

  // construct the hull
  var poly = [];
  for (i=0; i<sp; ++i) {
    poly.push(vertices[stack[i]]);
  }
  return poly;
}

// helper method to detect a non-left turn about 3 points
function d3_geom_hullIsNonLeft(i0, i1, i2, i3, v) {
  var x, y, l1, l2, l4, l5, l6, a1, a2;
  y = v[i2][1] - v[i1][1]; x = v[i2][0] - v[i1][0]; l1 = x * x + y * y;
  y = v[i3][1] - v[i2][1]; x = v[i3][0] - v[i2][0]; l2 = x * x + y * y;
  y = v[i3][1] - v[i0][1]; x = v[i3][0] - v[i0][0]; l4 = x * x + y * y;
  y = v[i1][1] - v[i0][1]; x = v[i1][0] - v[i0][0]; l5 = x * x + y * y;
  y = v[i2][1] - v[i0][1]; x = v[i2][0] - v[i0][0]; l6 = x * x + y * y;
  a1 = Math.acos((l2 + l6 - l4) / (2 * Math.sqrt(l2 * l6)));
  a2 = Math.acos((l6 + l1 - l5) / (2 * Math.sqrt(l6 * l1)));
  return (Math.PI - a1 - a2) < 0;
}