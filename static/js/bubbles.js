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
    var follow_count = parseInt(r.followers),
        retweet_count = parseInt(r.retweets),
        mention_count = parseInt(r.mentions);

    //add to the list
    followers.push(follow_count);
    retweets.push(retweet_count);
    mentions.push(mention_count);
  });

  //define table margins
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  //create the svg
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var user_num = -1;

  //define node fields    
  var n = username.length - 1, //number of users
      m = 50, 
      padding = 6,
      radius = d3.scale.sqrt().range([1, 2]),
      color = d3.scale.category10().domain(d3.range(m)),
      gravity = .01,
      friction = .5,
      charge = -1;

  //load dynamic node data    
  var nodes = d3.range(n).map(function() {
    user_num++; //increment by one to access next user
    var i = Math.floor(Math.random() * m);
    return {
      radius: radius((followers[user_num])/2500),
      color: color(i)
    };
  });

  $(function(){
    showGraph();
  })

  function showGraph() {

    //start the visualization
    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .linkDistance(400)
        .charge(charge)
        .friction(friction)
        .on("tick", tick)
        .start();

    //create each circle
    var circle = svg.selectAll("circle")
        .data(nodes)
      .enter().append("circle")
        .attr("r", function(d) { return d.radius; })
        .style("fill", function(d) { return d.color; })
        .call(force.drag)
        //.on("mouseover", function(d, i) { force.resume(); highlight( d, i, this ); });

    //calls cluster
    function tick(e) {
      circle
          .each(collide(.075))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    //resolves collisions between d and all other circles.
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

     d3.select("#follow")
    .on("click", function(){
      loadFollow();
      showGraph();
    })
    
     d3.select("#retweet")
    .on("click", function(){
      loadRetweet();
      showGraph();
    })

     d3.select("#mention")
    .on("click", function(){
      loadMention();
      showGraph();
    })

  }

  function loadFollow() {
    user_num = -1;

    var nodeUpdate = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      var i = Math.floor(Math.random() * m);
      return {
        radius: radius(followers[user_num]/2500),
        color: color(i)
      };
    });

   svg.selectAll("circle")
    .data(nodeUpdate)
    .attr("r", function(d) { return d.radius; });

  };

  function loadRetweet () {
    user_num = -1;

    var nodeUpdate = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      var i = Math.floor(Math.random() * m);
      return {
        radius: radius(retweets[user_num]*3),
        color: color(i)
      };
    });

   svg.selectAll("circle")
    .data(nodeUpdate)
    .attr("r", function(d) { return d.radius; });
  }  

  function loadMention () {
    user_num = -1;

    var nodeUpdate = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      var i = Math.floor(Math.random() * m);
      return {
        radius: radius(mentions[user_num]*4),
        color: color(i)
      };
    });

   svg.selectAll("circle")
    .data(nodeUpdate)
    .attr("r", function(d) { return d.radius; });
  }  

  
});


