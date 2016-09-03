module.exports = function(grunt) {
  /**
   * Define "validate" and "analyze" tasks, and include required plugins.
   *
   * These tasks are used to ensure code quality.
   *
   * grunt validate
   *   Evaluate the quality of all custom code to make sure it is safe to push.
   *   Should be reasonably fast and display on the command-line.
   *
   * grunt analyze
   *   Deeper inspection & analyze of codebase, not done on every build.
   *   Produces reports for Jenkins. May be a long-running task.
   */
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-force-task');
  grunt.loadNpmTasks('grunt-phplint');
  grunt.loadNpmTasks('grunt-phpcs');
  grunt.loadNpmTasks('grunt-phpmd');

  var Help = require('../lib/help')(grunt);
  var _ = require('lodash');

  // Task set aliases are registered at the end of the file based on these values.
  var validate = [];
  var analyze = [];

  var defaultPatterns = [
    '<%= config.srcPaths.drupal %>/{modules,profiles,libraries,static}/**/*.{php,module,inc,install,profile}',
    '!<%= config.srcPaths.drupal %>/{modules,profiles,libraries,static}/**/*.{box,pages_default,panels_default,views_default,panelizer,strongarm}.inc',
    '!<%= config.srcPaths.drupal %>/{modules,profiles,libraries,static}/**/*.features.*inc',
    '!<%= config.srcPaths.drupal %>/{modules,profiles,libraries,static}/**/vendor/**'
  ];

  // Include common sites and theme locations in phplint validation.
  var phplintPatterns = defaultPatterns.slice(0);
  phplintPatterns.unshift([
    '<%= config.srcPaths.drupal %>/sites/*/*.{php,inc}',
    '<%= config.srcPaths.drupal %>/sites/*/*/*.{php,inc}',
    '<%= config.srcPaths.drupal %>/themes/*/template.php',
    '<%= config.srcPaths.drupal %>/themes/*/templates/**/*.php',
    '<%= config.srcPaths.drupal %>/themes/*/includes/**/*.{inc,php}'
  ]);

  grunt.config('phplint', {
    all: grunt.config.get('config.phplint.dir') ? grunt.config.get('config.phplint.dir') : phplintPatterns
  });
  validate.push('phplint:all');

  // Exclude templates by default from phpcs validation.
  var phpcsPatterns = defaultPatterns.slice(0);
  phpcsPatterns.push('!<%= config.srcPaths.drupal %>/{modules,profiles,libraries,static}/**/*.tpl.php');

  if (grunt.config.get('config.phpcs')) {
    var phpcs = grunt.config.get('config.phpcs.dir') || phpcsPatterns;
    var phpStandard = grunt.config('config.phpcs.standard') ||
      'vendor/drupal/coder/coder_sniffer/Drupal,vendor/drupal/coder/coder_sniffer/DrupalPractice';

    // Support deprecated config.phpcs.ignoreExitCode value until 1.0.
    var ignoreError = grunt.config('config.validate.ignoreError') ||
      grunt.config('config.phpcs.ignoreExitCode');
    ignoreError = ignoreError === undefined ? false : ignoreError;

    grunt.config('phpcs', {
      analyze: {
        src: phpcs
      },
      drupal: {
        src: phpcs
      },
      validate: {
        src: phpcs,
        options: {
          report: grunt.config.get('config.phpcs.validateReport') || 'full',
          reportFile: false
        }
      },
      full: {
        src: phpcs,
        options: {
          report: 'full',
          reportFile: false
        }
      },
      summary: {
        src: phpcs,
        options: {
          report: 'summary',
          reportFile: false
        }
      },
      gitblame: {
        src: phpcs,
        options: {
          report: 'gitblame',
          reportFile: false
        }
      },
      options: {
        bin: '<%= config.phpcs.path %>',
        standard: phpStandard,
        ignoreExitCode: ignoreError,
        report: 'checkstyle',
        reportFile: '<%= config.buildPaths.reports %>/phpcs.xml'
      }
    });
  }

  if (grunt.config.get('config.phpmd')) {
    var phpmdConfig = grunt.config.get('config.phpmd.configPath') || 'phpmd.xml';
    grunt.config('phpmd', {
      custom: {
        dir: '<%= config.srcPaths.drupal %>/'
      },
      options: {
        bin: '<%= config.phpmd.path %>',
        rulesets: phpmdConfig,
        suffixes: "php,module,inc,install,profile",
        exclude: "<%= config.srcPaths.drupal %>/sites",
        reportFormat: 'xml',
        reportFile: '<%= config.buildPaths.reports %>/phpmd.xml'
      }
    });
    analyze.push('phpmd:custom');
  }

  var themes = grunt.config('config.themes');
  if (grunt.config.get('config.eslint')) {
    var eslintConfig = grunt.config.get('config.eslint');
    var eslintTarget = eslintConfig.dir || [
      '<%= config.srcPaths.drupal %>/themes/*/js/**/*.js',
      '<%= config.srcPaths.drupal %>/{modules,profiles,libraries}/**/*.js'
    ];
    var eslintTargetAnalyze = eslintTarget;
    var eslintConfigFile = eslintConfig.configFile || process.cwd() + '/.eslintrc';

    _.each(themes, function(theme, key) {
      if (theme.scripts && theme.scripts.validate) {
        // If the theme has a validate task of it's own, then exclude its
        // javascript files from our validate process.
        eslintTarget.push('!<%= config.srcPaths.drupal %>/themes/' + key + '/js/**/*.js');
      }
      if (theme.scripts && theme.scripts.analyze) {
        // If the theme has an analyze task of it's own, then exclude its
        // javascript files from our analyze process.
        eslintTargetAnalyze.push('!<%= config.srcPaths.drupal %>/themes/' + key + '/js/**/*.js');
      }
    });

    grunt.config('eslint', {
      options: {
        configFile: eslintConfigFile
      },
      validate: eslintTarget,
      analyze: {
        options: {
          format: 'checkstyle',
          outputFile: '<%= config.buildPaths.reports %>/eslint.xml'
        },
        src: eslintTargetAnalyze
      }
    });
  }

  // If any of the themes have code quality commands, attach them here.
  for (var key in themes) {
    if (themes[key].scripts && themes[key].scripts.validate) {
      validate.push('themes:' + key + ':validate');
    }
    if (themes[key].scripts && themes[key].scripts.analyze) {
      validate.push('themes:' + key + ':analyze');
    }
  }

  var filesToProcess = function(patterns) {
    var paths = _.map(patterns, function(item) {
      return grunt.template.process(item);
    });

    // If length is evaluated to truthy at least one file matched.
    return grunt.file.expand(paths);
  };

  grunt.registerTask('validate', 'Validate the quality of custom code.', function(mode) {
    var phpcs = grunt.config.get('phpcs.validate');
    var files;
    if (phpcs) {
      files = filesToProcess(phpcs.src);
      if (files.length) {
        grunt.config.set('phpcs.validate.src', files);
        validate.push('phpcs:validate');
      }
    }
    var eslint = grunt.config.get('eslint.validate');
    var eslintIgnoreError = grunt.config.get('config.validate.ignoreError') === undefined ? false : grunt.config.get('config.validate.ignoreError');
    var eslintName = eslintIgnoreError ? 'force:eslint' : 'eslint';
    if (eslint) {
      files = filesToProcess(eslint);
      if (files.length) {
        grunt.config.set('eslint.validate', files);
        validate.push(eslintName + ':validate');
      }
    }

    if (mode === 'newer' || mode === 'staged') {
      // This works because grunt-newer and grunt-staged have consisting naming.
      grunt.loadNpmTasks('grunt-' + mode);
      // Wrap each task configured for validate in the newer command.
      // grunt-phplint contains complex caching that does the same thing.
      validate = validate.filter(function(item) {
        return item.indexOf('themes:') !== 0;
      }).map(function(item) {
        return item === 'phplint:all' ? item : mode + ':' + item;
      });
    }

    if (validate.length) {
      grunt.task.run(validate);
    }
  });

  grunt.registerTask('analyze', 'Generate reports on code quality for use by Jenkins or other visualization tools.', function() {
    var phpcs = grunt.config.get('phpcs.analyze');
    var files;
    if (phpcs) {
      files = filesToProcess(phpcs.src);
      if (files.length) {
        grunt.config.set('phpcs.analyze', files);
        analyze.push('phpcs:analyze');
      }
    }
    var eslint = grunt.config.get('eslint.analyze');
    var eslintIgnoreError = grunt.config.get('config.validate.ignoreError') === undefined ? false : grunt.config.get('config.validate.ignoreError');
    var eslintName = eslintIgnoreError ? 'force:eslint' : 'eslint';
    if (eslint) {
      // The eslint:analyze task has a deeper configuration structure than
      // eslint:validate.
      files = filesToProcess(eslint.src);
      if (files.length) {
        grunt.config.set('eslint.analyze', files);
        analyze.push(eslintName + ':analyze');
      }
    }

    if (analyze.length) {
      var tasks = analyze;
      if (analyze.length > 1) {
        grunt.loadNpmTasks('grunt-concurrent');
        grunt.config(['concurrent', 'analyze'], {
          tasks: analyze,
          options: {
            logConcurrentOutput: true
          }
        });
        tasks = ['concurrent:analyze'];
      }

      tasks.unshift('mkdir:init');
      grunt.task.run(tasks);
    }
  });

  Help.add([
    {
      task: 'validate',
      group: 'Testing & Code Quality',
      description: 'Quick code health check for syntax errors and basic practices. (e.g. PHPCS w/ Drush Coder rules)'
    },
    {
      task: 'analyze',
      group: 'Testing & Code Quality',
      description: 'Static codebase analysis to detect problems. Outputs Jenkins-compatible reports. (e.g. PHPMD)'
    }
  ]);
};
