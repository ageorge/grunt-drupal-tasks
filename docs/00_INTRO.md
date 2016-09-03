# Grunt Drupal Tasks

This project brings the tooling energy of the Node.js and Grunt communities together with best practices in Drupal development to accelerate Drupal 7 and Drupal 8 development.

## Features

* [Generator Gadget](https://github.com/phase2/generator-gadget), a Yeoman-generator to assemble new codebases with best practices configuration.
* Configurable code structure that defaults to a clean development practice.
* Drush make-based [build workflow](https://phase2.github.io/grunt-drupal-tasks/build).
* Optional use of Composer,
  [Code Quality & Static Analysis](https://phase2.github.io/grunt-drupal-tasks/quality), and [Frontend tooling](https://phase2.github.io/grunt-drupal-tasks/frontend) to extend the build process.
* [Behat and SimpleTest Testing](https://phase2.github.io/grunt-drupal-tasks/testing)
* [Deployment packaging](https://phase2.github.io/grunt-drupal-tasks/package)
* [Git Hook management](https://phase2.github.io/grunt-drupal-tasks/git-hooks)
* Desktop Notifications
* Local Development Friendly
* [CI](https://phase2.github.io/grunt-drupal-tasks/ci) Friendly

We are continuously working to improve this toolchain, adding functionality that
we see as common to our _continuous integration_ and everyday development
practices.

## Usage

Working on a project that's integrated **grunt-drupal-tasks**? Run `grunt help`
to view documentation tailored for your project.

To build your Drupal site, run `grunt`.

### Environment Options

These environment variables will override other options.

* `GDT_DOMAIN`: Specify the base URL for live system testing. Falls back to a
setting in the project's Gruntconfig.json, then hostname if not set.
* `GDT_INSTALL_PROFILE`: Overrides the install profile specified in the
project's Gruntconfig.json to be used by the `install` task.
* `GDT_QUIET`: If evaluated truthy, will suppress all desktop notifications.
* `GDT_SITE_ALIAS`: Configure the default Drush site alias for the project.
* `GDT_SITEURLS`: Overrides the URL(s) for the project's site(s) specified in
the Gruntconfig.json by which each can be accessed for end-to-end testing by
tools such as Behat. Use instead of `GDT_DOMAIN` if the project has multiple
subsites or URLs.
