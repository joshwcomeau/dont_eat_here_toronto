function tallyStatuses(data) {
  var tally, status, report;

  tally = { pass: 0, conditional: 0, closed: 0 };

  data.inspections.forEach(function(report) {
    tally[report.status]++;
  });

  return tally;
}

function 


// Build our DOM element
var inspectorDOM = $("<div>").addClass("inspection-wrapper").append("<h4>1 Minor Infraction, 2 Significant Infractions</h4>")


// Insert our DOM element
$(".biz-page-title").after(inspectorDOM);


// Get the data
$.get(chrome.extension.getURL("fixture.json"), function(data) {
  data = JSON.parse(data);
  console.log(data);

  // Get the second restaurant's statuses
  statuses = tallyStatuses(data[1]);

  console.log(statuses);
  $(".inspection-wrapper").html(statuses);
})
