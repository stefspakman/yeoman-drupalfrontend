'use strict';
var Generator = require('yeoman-generator');
var fs = require('fs');
var fsextra = require('fs-extra');
var glob = require("glob");
var yosay = require('yosay');
var chalk = require('chalk');
var mv = require('mv');
var replace = require('replace-in-file');
var findInFiles = require('find-in-files');
var path = require('path');
var os = require('os');
var jsonfile = require('jsonfile');
var homeConfigPath = path.join(os.homedir(), '/yo-drupalFrontend-config.json');

var config = {
  "version": "1.0.0",
  "git": {
    "d8": {
      "name": "",
      "url": "",
      "branch": "develop"
    },
    "d7": {
      "name": "",
      "url": "",
      "branch": "develop"
    },
    "gulp": {
      "url": "https://github.com/SyneticNL/Gulp-for-Drupal.git",
      "branch": "master"
    }
  }
};

if (fs.existsSync(homeConfigPath)) {
  console.log('Using local Config');
  var temp = require(homeConfigPath);
  if (temp.version === config.version){
    config = temp;
  } else {
    fs.rename(homeConfigPath, 'yo-drupalFrontend-config--old.json', function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
    jsonfile.writeFileSync(homeConfigPath, config, {spaces: 2});
    console.log(yosay(
      'Welcome, we just updated the configuration file,\nplease configure your settings.\nYou can find the configuration file here:\n' + homeConfigPath
    ));
    process.exit();
  }
} else {
  console.log("Using default Config");
  jsonfile.writeFileSync(homeConfigPath, config, {spaces: 2});
  console.log(yosay(
    'Welcome, we just created a configuration file,\nplease configure your settings.\nYou can find the configuration file here:\n' + homeConfigPath
  ));
  process.exit();
}


var gulpExists = false;
var templateExists = false;
if (fs.existsSync('./gulpfile.js')) {
  gulpExists = true;
}
if (fs.existsSync('./template.php') || fs.existsSync('./' + (process.cwd()).split(path.sep).pop() + '.theme')) {
  templateExists = true;
}
var installMode_all = false;
var installMode_gulp = false;
var installMode_updateGulp = false;
var installMode_template = false;
if (templateExists === false && gulpExists === true){
  installMode_template = true;
} else if (templateExists === true && gulpExists === false){
  installMode_gulp = true;
} else if (templateExists === true && gulpExists === true){
  installMode_updateGulp = true;
} else {
  installMode_all = true;
}

module.exports = Generator.extend({
  prompting: function () {

    this.log(yosay(
      'Welcome, we now build an Drupal theme, based of your default theme \nand\n' + chalk.blue('Gulp-for-Drupal') + '!'
    ));

    var prompts = [{
      type    : 'confirm',
      name    : 'installGulp',
      message : 'We found a template but no Gulpfile, would you like to install Gulp?',
      when    : installMode_gulp
    }, {
        type    : 'confirm',
        name    : 'installTemplate',
        message : 'We found a Gulpfile but no template, would you like to install only the templatefiles?',
        when    : installMode_template
      }, {
      type    : 'confirm',
      name    : 'updateGulp',
      message : 'We found a Gulpfile and a template, would you like to update Gulp?',
      when    : installMode_updateGulp
    }, {
      type    : 'input',
      name    : 'name',
      message : 'Your theme name',
      default : function (response) {
        var defaultValue = 'default-theme';
        if (response.installTemplate){
          defaultValue = (process.cwd()).split(path.sep).pop();
        }
        return defaultValue;
      },
      when    : installMode_all || function (response) { if (response.updateGulp || response.installGulp) { return false } else { return true };}
    }, {
      type: 'list',
      name: 'drupal',
      message: 'Which version of Drupal do you use?',
      choices:[{name: 'Drupal 8'}, {name: 'Drupal 7'}],
      store   : false,
      when    : installMode_all || function (response) { if (response.updateGulp || response.installGulp) { return false } else { return true };}
    }, {
      type    : 'input',
      name    : 'url',
      message : 'Your project url',
      default : function (response) {
        var defaultValue = response.name + '.dev';
        if (response.installGulp){
          defaultValue = ((process.cwd()).split(path.sep).pop()) + '.dev';
        } else if (response.updateGulp){
          var gulpconfig = require(path.join(process.cwd(), 'gulpconfig.json'));
          defaultValue = (gulpconfig.general.projectpath).replace('/','');
        }
        return defaultValue;
      }
    }];
    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },
  default: function () {
      var answers = this.props;
    if (installMode_all || answers.installTemplate || answers.installGulp === false){
      var themePath;
      var replaceInTemplatePath;
      if (answers.installTemplate){
        if (answers.drupal === 'Drupal 8'){
          var gitURL = config.git.d8.url;
          this.spawnCommandSync('git', ['clone', '-b', config.git.d8.branch, gitURL, 'temp']);
        } else {
          var gitURL = config.git.d7.url;
          this.spawnCommandSync('git', ['clone', '-b', config.git.d7.branch, gitURL, 'temp']);
        }
        fsextra.moveSync('temp/', './', { overwrite: false });

        themePath = './';
        replaceInTemplatePath = './';
      } else {
        if (answers.drupal === 'Drupal 8'){
          var gitURL = config.git.d8.url;
          this.spawnCommandSync('git', ['clone', '-b', config.git.d8.branch, gitURL, answers.name]);
        } else {
          var gitURL = config.git.d7.url;
          this.spawnCommandSync('git', ['clone', '-b', config.git.d7.branch, gitURL, answers.name]);
        }
        themePath = './' + answers.name + '/';
        replaceInTemplatePath = './' + answers.name;
      }

      var allFiles;
      fs.readdirSync(themePath).forEach(file => {
        allFiles = file;
    });

      glob("**/@(PROJECT_NAME*)", function (er, allFiles) {
        for (var i = 0; i < allFiles.length; i++){
          var toName = allFiles[i].replace("PROJECT_NAME", answers.name);
          fs.rename(allFiles[i], toName, function(err) {
            if ( err ) console.log('ERROR: ' + err);
          });
        }
      });


      findInFiles.findSync("PROJECT_NAME", replaceInTemplatePath)
        .then(function(results) {
          for (var result in results) {
            try {
              const changedFiles = replace.sync({
                files: result,
                from: /PROJECT_NAME/g,
                to: answers.name,
                allowEmptyPaths: false,
                encoding: 'utf8',
              });
              console.log('Modified files:', changedFiles.join(', '));
            }
            catch (error) {
              console.error('Error occurred:', error);
            }
          }
        });
    }

    if (installMode_all || answers.installGulp || answers.updateGulp || answers.installTemplate === false){

      var destination = 'temp';
      this.spawnCommandSync('git', ['clone', config.git.gulp.url, destination]);
      if (installMode_all || answers.installTemplate === false){
        fsextra.moveSync('temp/', answers.name + '/', { overwrite: false });
      } else if (answers.updateGulp){
        fs.readdirSync('temp/').forEach(file => {
          console.log(file);
          try {
            if (file === 'gulpconfig.json'){
              fs.rename('./gulpconfig.json', 'gulpconfig--old.json', function(err) {
                if ( err ) console.log('ERROR: ' + err);
              });
            } else {
              fs.unlinkSync('./' + file);
            }
          } catch (error) {}
      });
        fsextra.moveSync('temp/', './', { overwrite: false });
      } else {
        fsextra.moveSync('temp/', './', { overwrite: false });
      }


      try {
        var files;
        if (installMode_all || answers.installTemplate === false){
          files = answers.name + '/gulpconfig.json';
        } else {
          files = './gulpconfig.json';
        }
        const setGulpUrl = replace.sync({
          files: files,
          from: /example.dev/g,
          to: answers.url,
          allowEmptyPaths: false,
          encoding: 'utf8',
        });
        console.log('Modified files:', setGulpUrl.join(', '));
      }
      catch (error) {
        console.error('Error occurred:', error);
      }
    }
  },
  install: function () {
    var answers = this.props;
    if (installMode_all || answers.installGulp || answers.installTemplate === false) {
      var themepath = path.join(process.cwd(), this.props.name);
      this.spawnCommandSync("yarn", ["install"], {cwd: themepath});
    }
  }
});
