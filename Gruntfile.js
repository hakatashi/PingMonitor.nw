module.exports = function(grunt) {
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
		jade: {
			all: {
				files: [
					{
						expand: true,
						cwd: 'src',
						src: ['**/*.jade'],
						dest: 'src',
						ext: '.html',
					},
				],
			},
		},
		less: {
			all: {
				files: [
					{
						expand: true,
						cwd: 'src',
						src: ['**/*.less'],
						dest: 'src',
						ext: '.css',
					},
				],
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
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', ['jade:all', 'less:all', 'shell:nw']);
};
