
 //// MAIN FUNCTION. Runs on pageload. ////
//////////////////////////////////////////
function run() {
  var $node, yelpRestaurantData, restaurantName, restaurantAddr, restaurantData, jsonData, 
      jsonPath, status, statusStr, severity, severityString, inspectionTable, buttonPath, wrapperClass;

  jsonPath        = "../data.json";

  // variables
  buttonPath      = "white_x.png";
  wrapperClass    = "inspection-wrapper";

  restaurantName  = getRestaurantName();
  restaurantAddr  = getRestaurantAddress();

  getJSONData(jsonPath).then(function(data) {  
    
    jsonData        = JSON.parse(data);
    restaurantData  = findRestaurant(jsonData, restaurantName, restaurantAddr);

    $node = buildDOMNode(wrapperClass);
    renderNode($node);
    attachCloseButton(buttonPath, wrapperClass);

    if (restaurantData) {
      // Generate and render our default DOM node.
      attachFoundDomToNode($node);

      // Update the restaurant name
      $(".inspection-header-name").text(restaurantData.name)

      // Tally our statuses
      status          = tallyInspections(restaurantData, "status", { pass: 0, conditional: 0, closed: 0 });
      statusStr       = generateTallyString(status, "status"); 
      $(".status-tally").html(statusStr);

      // Get our infraction counts
      severity        = tallyInspections(restaurantData, "severity", { M: 0, S: 0, C: 0 });
      severityStr     = generateTallyString(severity, "severity"); 
      $(".severity-tally").html(severityStr);

      // Generate the inspection table
      inspectionTable = generateInspectionTable(restaurantData);
      $(".inspection-details").append(inspectionTable);

      // Bind the show-details click
      clickToToggleTable(".show-details", ".inspection-table");


    } else {
      attachNotFoundDomToNode($node);
    }
  });
}

run();



 //// TOP LEVEL FUNCTIONS.  ////
///////////////////////////////

function getRestaurantName(className) {
  className = className || "biz-page-title"
  return $.trim( $("."+className).text() );
}

function getRestaurantAddress(className) {
  className = className || "street-address"
  return $("."+className).find( "[itemprop=streetAddress]" ).text();
}

function getJSONData(path) {
  return $.get(chrome.extension.getURL(path));
}

function buildDOMNode(wrapperClass) {
  return $("<div class='" + wrapperClass + "'>"                         +
    "<h6>DineSafe Toronto Food Inspection Results</h6>"                 +
  "</div>");
}

function attachFoundDomToNode($node) {
  $node.append("<h4 class='inspection-header-name'></h4>"               +
    "<div class='inspection-details'>"                                  +
      "<div class='col first'>"                                         +                                     
        "<div class='status-tally'></div>"                              +
        "<div class='severity-tally'></div>"                            +
      "</div><div class='col'>"                                         +
        "<button class='show-details'>Show Inspection Details</button>" +
      "</div>"                                                          +
    "</div>"                                                            +
    "<div class='not-yelp-notice'>"                                     +
      "This inspection data provided by the Don't Eat Here Chrome "     +
      "extension and is unaffiliated with Yelp."                        + 
    "</div>");                                                        
}

function attachNotFoundDomToNode($node) {
  $node.append("<div class='inspection-not-found'>"                     +
    "<h5>Inspection Not Found</h5>"                                     +
    "<p>Sorry, we could not locate any inspection results for"          +
        "this restaurant.</p></div>");
}

function attachCloseButton(filename, wrapperClass) {
  var path = chrome.extension.getURL(filename);
  var $node = $("<div></div>");

  $node
    .addClass("close-btn")
    .css({backgroundImage: 'url(' + path + ')'})
    .on("click", function() {
      $(wrapperClass).fadeOut(500);
  });

  $(wrapperClass).prepend($node);
}


function renderNode(node) {
  $(".biz-page-header").after(node);
}


function findRestaurant(data, name, addr) {
  var match, cleanedName, cleanedJsonName;

  // Let's standardize our data by removing non-alphanumeric characters, filler words like 'the' and 'a', and lowercasing it.
  name = getNameArray(name);

  // For addresses, let's *only* look at the street number. This is basically a redundancy check anyway.
  addr = cleanAddr(addr);

  return _.find(data, function(restaurant) {
    cleanedJsonName = getNameArray(restaurant.name);
    cleanedJsonAddr = cleanAddr(restaurant.address);

    // Consider it a match when they share a single matching word and a matching address
    return (matchNames(name, cleanedJsonName) && addr === cleanedJsonAddr);
  });
}


// See if these two names are a match. Expects two arrays, split by whitespace.
function matchNames(name1, name2) {
  // Start by checking if they share at least 1 word in common
  if ( _.intersection(name1, name2).length ) 
    return true;

  // Also, check if the two are the same when joined together (sometimes things are space-separated when they shouldnt be)
  if ( name1.join("") === name2.join("") )
    return true;

  return false;
}

function getNameArray(str) {
  var strArray, filteredStrArray,
      fillerWords = ["the", "a", "restaurant", "cafe", "cuisine"];

  // remove any special characters
  str = str.toLowerCase().replace(/[^\w\s]/gi, '');

  if (str) {
    strArray = str.split(" ");

    // Remove filler words
    return _.filter(strArray, function(word) {
      return !(_.includes(fillerWords, word));
    });
  }
}

function cleanAddr(str) {
  if (str)
    return str.split(" ")[0];
}



function tallyInspections(data, field, tally) {
  var report;

  data.inspections.forEach(function(report) {
    tally[report[field]]++;
  });

  return tally;
}

function clickToToggleTable(button, table) {
  $(button).on("click", function() {
    if ( $(table).is(":visible") ) {
      $(button).text("Show Inspection Details");
      $(table).fadeOut(250); 
    } else {
      $(button).text("Hide Inspection Details");
      $(table).fadeIn(500);
    }
  });
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

function formatStatus(status) {
  // Capitalize first letter
  status = status.charAt(0).toUpperCase() + status.slice(1);

  // Change 'Closed' to 'Fail'
  if ( status === "Closed" ) { status = "Fail"; }

  return status;
}

function formatSeverity(severity) {
  var formattedSeverity = null;
  
  if ( severity === "M" ) {
    formattedSeverity = "Minor";
  } else if ( severity === "S" ) {
    formattedSeverity = "Significant";
  } else if ( severity === "C" ) {
    formattedSeverity = "Critical";
  }

  return formattedSeverity;
}

function generateInspectionTable(data) {
  // the actual <table> tag comes pre-
  var $table, headerRow, row, status, severity;

  $table = $("<table class='inspection-table'></table>");

  headerRow  = "<tr>";
  headerRow += "<th>Date</th>";
  headerRow += "<th>Status</th>";
  headerRow += "<th>Severity</th>";
  headerRow += "<th>Details</th>";
  headerRow += "</tr>"
  $table.append(headerRow);


  data.inspections.forEach(function(inspection) {
    row = ""; // Reset our row for this iteration

    status   = formatStatus(inspection.status);
    severity = formatSeverity(inspection.severity);

    row += "<tr>";
    row += "<td class='date'>"      + inspection.date               + "</td>";
    row += "<td class='status'>"    + (status || "-")               + "</td>";
    row += "<td class='severity'>"  + (severity  || "-")            + "</td>";
    row += "<td class='details'>"   + (inspection.details  || "-")  + "</td>";
    row += "</tr>"

    $table.append(row);
  });

  return $table;
}
