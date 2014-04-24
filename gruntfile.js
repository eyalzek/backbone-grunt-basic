/*global module:false*/
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
	// concat: {
	// 	dist: {
	// 		src: [
	// 		'js/*.js',
	// 		'js/vendor/*.js'
	// 		],
	// 		dest: 'js/build/production.js'
	// 	}

	// },

	connect: {
		server: {
			options: {
			port: 9001,
			livereload: true,
			open: true
			}
		}
	},

	watch: {
		scripts: {
			files: [
			'js/*.js',
			'js/vendor/*.js'
			],
			options: {
				livereload: true
			}
		},
		css: {
			files: 'css/style.css',
			options: {
				livereload: true
			}
		},
		html: {
			files: 'index.html',
			options: {
				livereload: true
			}
		}
	}
});

  grunt.registerTask('default', ['connect', 'watch']);
};
