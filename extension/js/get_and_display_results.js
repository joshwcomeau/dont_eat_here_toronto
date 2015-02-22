
 //// MAIN FUNCTION. Runs on pageload. ////
//////////////////////////////////////////
function run() {
  var $node, yelpRestaurantData, restaurantName, restaurantAddr, restaurantData, jsonData, jsonPath;

  jsonPath        = "../data_sample.json";

  restaurantName  = getRestaurantName();
  restaurantAddr  = getRestaurantAddress();

  console.log("Restaurant name", restaurantName);
  console.log("Restaurant Addr", restaurantAddr);
  
  getJSONData(jsonPath).then(function(data) {  
    
    jsonData        = JSON.parse(data);
    restaurantData  = findRestaurant(jsonData, restaurantName, restaurantAddr);

  });

  
  

  // Generate and render our DOM node.
  // $node = buildDOMNode();
  // renderNode($node);
}

run();

function buildDOMNode() {
  return $("<div>").addClass("inspection-wrapper");
}

function renderNode(node) {
  $(".biz-page-title").after(node);
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

  cleanedName = cleanName(name);

  return _.find(data, function(restaurant) {
    cleanedJsonName = cleanName(restaurant.name);
    console.log(cleanedName, "could be equal to", cleanedJsonName);
    return cleanedName === cleanedJsonName;
  });
}

function cleanName(str) {
  if (str)
    return str.replace(/[^\w]/gi, '').toLowerCase();
}

function getJSONData(path) {
  return $.get(chrome.extension.getURL(path));
}

function tallyStatuses(data) {
  var tally, status, report;

  tally = { pass: 0, conditional: 0, closed: 0 };

  data.inspections.forEach(function(report) {
    tally[report.status]++;
  });

  return tally;
}
