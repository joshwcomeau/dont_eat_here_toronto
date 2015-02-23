
 //// MAIN FUNCTION. Runs on pageload. ////
//////////////////////////////////////////
function run() {
  var $node, yelpRestaurantData, restaurantName, restaurantAddr, restaurantData, jsonData, 
      jsonPath, status, statusStr, severity, severityString, inspectionTable;

  jsonPath        = "../data.json";

  restaurantName  = getRestaurantName();
  restaurantAddr  = getRestaurantAddress();

  console.log("Restaurant name", restaurantName);
  console.log("Restaurant Addr", restaurantAddr);
  
  getJSONData(jsonPath).then(function(data) {  
    
    jsonData        = JSON.parse(data);
    restaurantData  = findRestaurant(jsonData, restaurantName, restaurantAddr);

    if (restaurantData) {
      // Generate and render our default DOM node.
      $node = buildDOMNode();
      renderNode($node);

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
      $(".severity-tally").after(inspectionTable);

      // Bind the show-details click
      clickToShow(".show-details", ".inspection-table");


    } else {
      console.log("No match found :(");
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

function buildDOMNode() {
  return $("<div class='inspection-wrapper'>"                           +
      "<h4>DineSafe Toronto Food Inspection Results</h4>"               +
      "<div class='inspection-details'>"                                +
        "<div class='status-tally'></div>"                              +
        "<div class='severity-tally'></div>"                            +
        "<div class='show-details'>Show Inspection Details</div>"       +
        "<div class='not-yelp-notice'>"                                 +
          "This inspection data provided by the Don't Eat Here Chrome " +
          "extension and is unaffiliated with Yelp."                    +
        "</div>"                                                        +  
      "</div>"                                                          +
    "</div>");
}



function renderNode(node) {
  $(".biz-page-header").after(node);
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



function tallyInspections(data, field, tally) {
  var report;

  data.inspections.forEach(function(report) {
    tally[report[field]]++;
  });

  return tally;
}

function clickToShow(handler, target) {
  $(handler).on("click", function() {
    $(handler).hide();
    $(target).fadeIn(500);
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
