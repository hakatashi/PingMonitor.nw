module.exports = function(grunt) {
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
		jade: {
			build: {
				files: [
					{
						expand: true,
						cwd: '.',
						src: ['**/*.jade'],
						dest: '.',
						ext: '.html',
					}
				]
			},
		},
		watch: {
			jade: {
				files: ['**/*.jade'],
				tasks: ['jade'],
			},
		},
		shell: {
			nw: {
				command: 'nw src',
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', ['jade:build', 'shell:nw']);
};