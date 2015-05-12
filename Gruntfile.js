module.exports = function(grunt) {

   // load plugins
   require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

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
         all: {
            files: ['src/model.js', 'src/view.js', 'src/controller.js', 'Gruntfile.js', 'index.html'],
            tasks: ['concat'],
            options: {
               livereload: true,
               interval: 1007
            }
         }
      },
      express: { // from http://rhumaric.com/2013/07/renewing-the-grunt-livereload-magic/ and http://thecrumb.com/2014/03/15/using-grunt-for-live-reload/
         all: {
            options: {
               port: 9000,
               hostname: "0.0.0.0",
               bases: ['C:\\Users\\James\\Documents\\Repositories\\Family-Learning-Cycle\\'],
               livereload: true
            }
         }
      },
      open: {
         all: {
            path: 'http://localhost:<%= express.all.options.port%>'
         }
      }
   });

   // Run tasks
   grunt.registerTask('default', ['concat', 'express', 'open', 'watch']);
};
