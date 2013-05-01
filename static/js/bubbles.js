//load in data
d3.csv("../static/data/data_trunc.csv", function(dataRows) {

  //initialize lists to store user data
  var username = [],
      followers = [],
      retweets = [],
      mentions = [],
      source = [],
      color_index = [],
      user_num = -1;

  //fill the lists with data from csv
  dataRows.forEach(function(r) {
    //add the users
    username.push(r.username);
    source.push(r.source);

    //parse the values to integers
    var follow_count = parseInt(r.followers),
        retweet_count = parseInt(r.retweets),
        mention_count = parseInt(r.mentions);

    //add to the list
    followers.push(follow_count);
    retweets.push(retweet_count);
    mentions.push(mention_count);

    //add to color index
    switch(r.source) {
      case "web":
        color_index.push(0);
        break;
      case "SocialFlow":
        color_index.push(1);
        break;
      case "TweetDeck":
        color_index.push(2);
        break;
      case "Business Insider":
        color_index.push(3);
        break;
      case "StockTwits Web":
        color_index.push(4);
        break;
      case "Twitter for Android":
        color_index.push(5);
        break;
      case "HootSuite":
        color_index.push(6);
        break;
      case "twitterfeed":
        color_index.push(7);
        break;
      case "Twitter for iPhone":
        color_index.push(8);
        break;
      case "Seeking Alpha":
        color_index.push(9);
        break;
      case "Janetter":
        color_index.push(10);
        break;
      case "Sprout Social":
        color_index.push(11);
        break;
      case "Mobile Web (M2)":
        color_index.push(12);
        break;
      case "Tweet Button":
        color_index.push(13);   
        break;
      case "Safari on iOS":
        color_index.push(14);   
        break;
      case "NASDAQ.com":
        color_index.push(15);   
        break;
      case "TradingView":
        color_index.push(16);   
        break;
      case "RiskReversal":
        color_index.push(17);   
        break;
      case "bitly":
        color_index.push(18);  
        break;
      default:
        color_index.push(19);        
    }
  });

  //define table margins
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  //create the svg
  var svg = d3.select("#vis").append("svg:svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var user_num = -1;

  //define node fields    
  var n = username.length - 1, //number of users
      m = 1000, 
      padding = 6,
      radius = d3.scale.sqrt().range([1, 2]),
      color = d3.scale.category20c(),
      gravity = -10,
      friction = .5,
      charge = -10;

  //load dynamic node data    
  var nodes = d3.range(n).map(function() {
    user_num++; //increment by one to access next user
    return {
      radius: radius((followers[user_num])/1800),
      username: username[user_num],
      source: source[user_num],
      color: color(color_index[user_num])
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
      .enter().append("svg:circle")
        .attr("r", function(d) { return d.radius; })
        .attr("class","node")
        .attr("username", function(d) {return d.username; })
        .attr("source", function(d) {return d.source; })
        .style("fill", function(d) { return d.color; })
        .call(force.drag);
        

    //add tipsy tooltip
    $(".node").tipsy({html:true,
                      fade: true,
                      gravity: 'e',
                      title: function () {
                        var name = $(this).attr("username");
                        var source = $(this).attr("source");
                      return name + "<br>" + source;}}
                    ); 

    //calls cluster, updates on movement
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

    //reset user_num
    user_num = -1;

    //update node values with new data
    nodes = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      return {
        radius: radius((followers[user_num])/1800),
        username: username[user_num],
        source: source[user_num],
        color: color(color_index[user_num])
      };
    });

   svg.selectAll("circle")
    .data(nodes)
    .attr("r", function(d) { return d.radius; })
    .attr("class","node")
    .attr("username", function(d) {return d.username; })
    .attr("source", function(d) {return d.source; })
    .style("fill", function(d) { return d.color; });

  };

  function loadRetweet () {

    //reset user_num
    user_num = -1;

    //update node values with new data
    nodes = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      return {
        radius: radius(retweets[user_num]*2),
        username: username[user_num],
        source: source[user_num],
        color: color(color_index[user_num])
      };
    });

   svg.selectAll("circle")
    .data(nodes)
    .attr("r", function(d) { return d.radius; })
    .attr("class","node")
    .attr("username", function(d) {return d.username; })
    .attr("source", function(d) {return d.source; })
    .style("fill", function(d) { return d.color; });
  }  

  function loadMention () {

    //reset user_num
    user_num = -1;

    //update node values with new data
    nodes = d3.range(n).map(function() {
      user_num++; //increment by one to access next user
      return {
        radius: radius(mentions[user_num]*3),
        username: username[user_num],
        source: source[user_num],
        color: color(color_index[user_num])
      };
    });


   svg.selectAll("circle")
    .data(nodes)
    .attr("r", function(d) { return d.radius; })
    .attr("class","node")
    .attr("username", function(d) {return d.username; })
    .attr("source", function(d) {return d.source; })
    .style("fill", function(d) { return d.color; });
  }  

  
});


