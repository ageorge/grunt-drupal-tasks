# Grunt Drupal Tasks

> A Grunt plugin to automate Drupal 7 and Drupal 8 build and testing tasks.

Code Status (master branch):
[![Travis CI status](https://travis-ci.org/phase2/grunt-drupal-tasks.svg?branch=master)](https://travis-ci.org/phase2/grunt-drupal-tasks)
[![Dependency Status](https://david-dm.org/phase2/grunt-drupal-tasks.svg)](https://david-dm.org/phase2/grunt-drupal-tasks)
[![npm version](https://badge.fury.io/js/grunt-drupal-tasks.svg)](https://www.npmjs.com/package/grunt-drupal-tasks)

## Features

This project is built on the tools of the Grunt community to provide scripted
automation of a number of PHP & Drupal tasks. Here are a few examples of what it
provides:

* Composer workflow
  * Drush make-based build workflow (for Drupal 7.x)
* CI portability (used with Jenkins so far)
* Opt-in for a number of great enhancements:
  * Composer dependency management for PHP
  * Bundler dependency management for Ruby
  * PHP code quality & static analysis checks
  * Compass compilation
  * Behat testing
* Deployment packaging
* Git Hook management
* Extensibility: Add or override with your plugins or configuration.

We are continuously working to improve this toolchain, adding functionality that
we see as common to our _continuous integration_ and everyday development
practices.

## Requirements

For requirements, installation, use, and customization instructions, see the [documentation](https://phase2.github.io/grunt-drupal-tasks).
