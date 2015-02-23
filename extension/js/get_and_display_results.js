
 //// MAIN FUNCTION. Runs on pageload. ////
//////////////////////////////////////////
function run() {
  var $node, yelpRestaurantData, restaurantName, restaurantAddr, restaurantData, jsonData, jsonPath, status, statusStr, severity, severityString;

  jsonPath        = "../data.json";

  restaurantName  = getRestaurantName();
  restaurantAddr  = getRestaurantAddress();

  console.log("Restaurant name", restaurantName);
  console.log("Restaurant Addr", restaurantAddr);
  
  getJSONData(jsonPath).then(function(data) {  
    
    jsonData        = JSON.parse(data);
    restaurantData  = findRestaurant(jsonData, restaurantName, restaurantAddr);

    if (restaurantData) {
      console.log("FOUND MATCH")
      console.log(restaurantData);

      // Generate and render our default DOM node.
      $node = buildDOMNode();
      renderNode($node);

      // Tally our statuses
      status      = tallyInspections(restaurantData, "status", { pass: 0, conditional: 0, closed: 0 });
      statusStr   = generateTallyString(status, "status"); 
      $(".status-tally").html(statusStr);

      // Get our infraction counts
      severity    = tallyInspections(restaurantData, "severity", { M: 0, S: 0, C: 0 });
      severityStr = generateTallyString(severity, "severity"); 
      $(".severity-tally").html(severityStr);


    } else {
      console.log("No match found :(");
    }

  });

  
  

}

run();

function buildDOMNode() {
  return $("<div class='inspection-wrapper'>" +
      "<h4>DineSafe Toronto Food Inspection Results</h4>" +
      "<div class='inspection-details'>" +
        "<div class='status-tally'></div>" +
        "<div class='severity-tally'></div>" +
        "<div class='show-details' onClick='showDetailedInspectionData()'>Click for Details</div>" +
      "</div>" +
    "</div>");
}

function showDetailedInspectionData() {
  alert("Clicked detail view");
}

function renderNode(node) {
  $(".biz-page-header").after(node);
}

function getRestaurantName(className) {
  className = className || "biz-page-title"
  return $.trim( $("."+className).text() );
}

function getRestaurantAddress(className) {
  className = className || "street-address"
  return $("."+className).find( "[itemprop=streetAddress]" ).text();
}

function findRestaurant(data, name, addr) {
  var match, cleanedName, cleanedJsonName;

  // Let's standardize our data by removing non-alphanumeric characters, and lowercasing it.
  name = cleanName(name);
  // For addresses, let's *only* look at the street number. This is basically a redundancy check anyway.
  addr = cleanAddr(addr);

  return _.find(data, function(restaurant) {
    cleanedJsonName = cleanName(restaurant.name);
    cleanedJsonAddr = cleanAddr(restaurant.address);

    return (name === cleanedJsonName && addr === cleanedJsonAddr);
  });
}

function cleanName(str) {
  var str_array;

  if (str) {
    // If there are more than 2 words in the name, just take the first 2.
    // This is to avoid mismatches when there are suffixes on one version like 'restaurant'
    str_array = str.split(" ");

    if (str_array.length > 2) {
      str = str_array.slice(0, 2).join(" ")
    }
    return str.replace(/[^\w]/gi, '').toLowerCase();
  }
}

function cleanAddr(str) {
  if (str)
    return str.split(" ")[0];
}

function getJSONData(path) {
  return $.get(chrome.extension.getURL(path));
}

function tallyInspections(data, field, tally) {
  var report;

  data.inspections.forEach(function(report) {
    tally[report[field]]++;
  });

  return tally;
}

function pluralizeString(string, num) {
  var suffix;

  // Very simple pluralizing logic, works for our case but not general.
  suffix = string.slice(-1) === "s" ? "es" : "s";

  // Yes, double ternary. I should probably do this over several lines, but it's really just formatting nonsense.
  // Returns "1 pass" or "3 passes" or "2 fails"
  return num > 0 ? num + " " + string + (num === 1 ? "" : suffix) : null;
}

function wrapInSpan(content, className) {
  return "<span class='" + className + "'>" + content + "</span>";
}

function generateTallySpan(num, noun, className) {
  var str;

  if (num > 0) {
    str = pluralizeString(noun, num);
    str = wrapInSpan(str, className);
  }

  return str;
}

function generateTallyString(tally, field) {
  var field1, field2, field3;
  
  if ( field === "status" ) {
    field1 = generateTallySpan(tally.pass, "pass", "color-green");
    field2 = generateTallySpan(tally.conditional, "conditional pass", "color-orange");
    field3 = generateTallySpan(tally.closed, "fail", "color-red");
  } else if ( field === "severity" ) {
    field1 = generateTallySpan(tally.M, "minor infraction", "color-orange");
    field2 = generateTallySpan(tally.S, "significant infraction", "color-dark-orange");
    field3 = generateTallySpan(tally.C, "critical infraction", "color-red");
  }


  return [field1, field2, field3].filter(function(n){ return n != null }).join(", ");
}
