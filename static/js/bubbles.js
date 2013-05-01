
//load in data
d3.csv("../static/data/data.csv", function(dataRows) {

  //initialize lists to store user data
  var username = [],
      followers = [],
      retweets = [],
      mentions = [],
      user_num = -1;
  
  //fill the lists with data from csv
  dataRows.forEach(function(r) {
    //add the users
    username.push(r.username);

    //parse the values to integers
    var follow_count = parseInt(r.followers);
    var retweet_count = parseInt(r.retweets);
    var mention_count = parseInt(r.mentions);

    //add to the list
    followers.push(follow_count);
    retweets.push(retweet_count);
    mentions.push(mention_count);
  });

  //define table margins
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  //define node fields    
  var n = username.length - 1, //number of users
      m = 50, //still not sure what this does
      padding = 6,
      radius = d3.scale.sqrt().range([1, 2]),
      color = d3.scale.category10().domain(d3.range(m)),
      user = d3.scale.sqrt().range([0, 12]);


  var nodes = d3.range(n).map(function() {
    user_num++; //increment by one to access next user
    var i = Math.floor(Math.random() * m);
    return {
      radius: radius((followers[user_num])/1000),
      color: color(i),
      user: user
    };
  });


  //start the visualization
  var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .charge(5)
      .on("tick", tick)
      .start();

  //create the svg
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //create each circle
  var circle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.color; })
      .call(force.drag);

  //not sure what this does
  function tick(e) {
    circle
        .each(cluster(25 * e.alpha * e.alpha))
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }


  //move d to be adjacent to the cluster node.
  function cluster(alpha) {
    var max = {};

    //find the largest node for each cluster.
    nodes.forEach(function(d) {
      if (!(d.color in max) || (d.radius > max[d.color].radius)) {
        max[d.color] = d;
      }
    });

    return function(d) {
      var node = max[d.color],
          l,
          r,
          x,
          y,
          i = -1;

      if (node == d) return;

      x = d.x - node.x;
      y = d.y - node.y;
      l = Math.sqrt(x * x + y * y);
      r = d.radius + node.radius;
      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        node.x += x;
        node.y += y;
      }
    };
  }

  // Resolves collisions between d and all other circles.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + radius.domain()[1] + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
      });
    };
  }

});


