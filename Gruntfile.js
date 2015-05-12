module.exports = function(grunt) {

   // Project configuration
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      concat: { // from http://gruntjs.com/sample-gruntfile
         options: {
            separator: ';'
         },
         dist: {
            src: ['src/model.js', 'src/view.js', 'src/controller.js'],
            dest: '<%= pkg.name %>.js'
         }
      },
      watch: {
         files: ['src/*.js'],
         tasks: ['concat']
      }
   });

   // Load plugins
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-watch');

   // Run tasks
   grunt.registerTask('default', ['concat', 'watch']);
};
