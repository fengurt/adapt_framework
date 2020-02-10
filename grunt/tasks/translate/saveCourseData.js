var fs = require("fs");
var path = require("path");

module.exports = function(grunt) {

  var Helpers = require('../helpers')(grunt);

  grunt.registerTask("_saveCourseData", function() {

    var buildConfig = Helpers.generateConfigData();
    var srcPath = buildConfig.outputdir;

    var targetLang = grunt.config("translate.targetLang");
    var jsonext = grunt.config("jsonext");

    [
      "course",
      "contentObjects",
      "articles",
      "blocks",
      "components"
    ].forEach(function(filename) {
      var src = path.join(srcPath, "course", targetLang, filename + "." + jsonext);
      grunt.file.write(src, JSON.stringify(global.translate.courseData[filename], null, 2));
    });

  });

};
