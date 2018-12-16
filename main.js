const fs = require('file-system');                // file system, to read/write files
const csvToJson = require('convert-csv-to-json'); // convert csv to json
const pretty = require('pretty');                 // prettify the html results before writing to file

let json = csvToJson.fieldDelimiter("\t").getJsonFromCsv("./data/chapters.csv");
let regions = [];

// Cycle through the persons and return a list in html
function buildAdvisors(list) {
  let output = '';
  if (!list || list == '\r') {
    return '';
  }

  let people = list.split(';');
  for (let i=0; i < people.length; i++) {
    let person = people[i].split('|');
    if (person) {
      output = output + '<a href="mailto:' + (person[1] || '#') + '">' + person[0]+'</a> ' + (person[2] || '') + '<br />';
    }
  }

  return output; 
}

// Build a single chapter item with all components in html
function buildChapterItem(chapter, advisors, ispeAdvisors) {

  return '<div class="chapter-item"> \
    <h6><a target="_blank" class="text-x-orange" href="' + chapter.Website + '">' + chapter.ChapterName + '</a></h6> \
    <div class="indent"> \
      <p class="location">' + (chapter.Location || "") + '</p> \
      <div class="faculty-advisor"><strong>Faculty Advisors:</strong> ' + (advisors || "") + '</div> \
      <div class="ispe-advisor"><strong>ISPE Advisors:</strong> ' + (ispeAdvisors || "") + '</div> \
    </div> \
  </div>';
}

// Return the chapter sponsor header in html
function buildSponsorHeader(sponsor){
 return ' <h5 class="chapter-name"> \
  <strong>' + sponsor + '</strong> \
</h5> \
';
}

// Build the accordion tabs for the available regions in html
function buildAccordionTabs(regions){
  var html = "";
  
  for (var key in regions) {

    var chapterhtml = "";
    var chapters = regions[key];

    for (var chapterkey in chapters) {
      chapterhtml += chapters[chapterkey];
    }

    html += '<li class="accordion-item" data-accordion-item=""> \
        <a class="accordion-title" href="#">' + key + '</a> \
        <div class="accordion-content" data-tab-content=""> \
          ' + chapterhtml + '\
        </div> \
      <li>';
  }
  return html;
}

// Conver the json to html and return the full results
function buildData(json) {

  for (let i=0; i < json.length; i++) {
    var chapter = json[i];

    // Build the Chapter Item
    let advisors = buildAdvisors(chapter.FacultyAdvisor); 
    let ispeAdvisors = buildAdvisors(chapter.ISPEIndustryAdvisor);
    let html = buildChapterItem(chapter, advisors, ispeAdvisors);

    // Add to Regions/Sponsors
    regions[chapter.Region] = regions[chapter.Region] || [];
    regions[chapter.Region][chapter.Sponsor] = regions[chapter.Region][chapter.Sponsor] || [];

    if( !regions[chapter.Region][chapter.Sponsor].includes(chapter.Sponsor)) {
      regions[chapter.Region][chapter.Sponsor] += buildSponsorHeader(chapter.Sponsor);
    }

    // Add Chapter Item to Sponsor Chapter
    regions[chapter.Region][chapter.Sponsor] += html;

  }

  let tabhtml = buildAccordionTabs(regions);
  let output = '<ul class="accordion accordion-blue" data-accordion="" data-allow-all-closed="true" >' + tabhtml + '</ul>';
  return output;

}

// Write the results
fs.writeFile('dist/output.html', pretty(buildData(json)), function(err) {});