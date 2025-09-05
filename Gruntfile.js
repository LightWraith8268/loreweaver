module.exports = function (grunt) {
  // A tiny build that guarantees dist/ exists with at least one file
  grunt.registerTask("build", "Create dist folder and a placeholder", function () {
    grunt.file.mkdir("dist");
    grunt.file.write("dist/.keep", "ok");
    grunt.log.ok("dist/ created");
  });
  grunt.registerTask("default", ["build"]);
};
