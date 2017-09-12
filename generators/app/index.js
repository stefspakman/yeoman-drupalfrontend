'use strict';
var Generator = require('yeoman-generator');
var fs = require('fs');
var fsextra = require('fs-extra');
var del = require('del');
var glob = require("glob");
var yosay = require('yosay');
var chalk = require('chalk');
var replace = require('replace-in-file');
var findInFiles = require('find-in-files');
var path = require('path');
var os = require('os');
var jsonfile = require('jsonfile');
var homeConfigPath = path.join(os.homedir(), '/yo-drupalFrontend-config.json');

var config = {
  "version": "1.0.1",
  "git": {
    "d8": {
      "url": "",
      "branch": "develop",
      "placeholder": "PROJECT_NAME"
    },
    "d7": {
      "url": "",
      "branch": "develop",
      "placeholder": "PROJECT_NAME"
    }
  }
};
var themeChoices = [];
if (fs.existsSync(homeConfigPath)) {
  var temp = require(homeConfigPath);
  if (temp.version === config.version){
    config = temp;
    Object.keys(config.git).forEach(function(theme) {
      themeChoices.push({
        name: theme
      });
    });
    console.log(themeChoices);
  } else {
    fs.rename(homeConfigPath, path.join(os.homedir(), '/yo-drupalFrontend-config--old.json'), function(err) {
      if ( err ) console.log('ERROR: ' + err)
      else console.log("hallo");
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
      name: 'theme',
      message: 'Which theme do you want to use?',
      choices:themeChoices,
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
      var drupalSettings = config.git[answers.theme];
      if (answers.installTemplate){
        this.spawnCommandSync('git', ['clone', '-b', drupalSettings.branch, drupalSettings.url, 'temp']);
        del.sync(['temp/.git']);
        fsextra.moveSync('temp/', './', { overwrite: false });
        replacePlaceholder('./', answers.name, drupalSettings.placeholder);
        replacePlaceholderInFile('./', answers.name, drupalSettings.placeholder);
      } else {
        this.spawnCommandSync('git', ['clone', '-b', drupalSettings.branch, drupalSettings.url, answers.name]);
        del.sync([answers.name + '/.git']);
        replacePlaceholder('./' + answers.name + '/', answers.name, drupalSettings.placeholder);
        replacePlaceholderInFile('./' + answers.name, answers.name, drupalSettings.placeholder);
      }
    }

    if (installMode_all || answers.installGulp || answers.updateGulp || answers.installTemplate === false){
      this.spawnCommandSync('git', ['clone', 'https://github.com/SyneticNL/Gulp-for-Drupal.git', 'temp']);
      del.sync(['temp/.git']);
      if (installMode_all || answers.installTemplate === false){
        copyAndRemove('temp/', './' + answers.name + '/');
      } else if (answers.updateGulp){
        fs.readdirSync('temp/').forEach(file => {
          try {
            if (file === 'gulpconfig.json') {
              fs.rename('./gulpconfig.json', 'gulpconfig--old.json', function(err) {
                if ( err ) console.log('ERROR: ' + err);
              });
            } else {
              try {
                del.sync(['./' + file]);
              } catch (err) {
                console.error(err);
              }
            }
          } catch (error) {}
      });
        copyAndRemove('temp/', './');
      } else {
        copyAndRemove('temp/', './');
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
          encoding: 'utf8'
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
    if (installMode_all || answers.installTemplate === false) {
      var themepath = path.join(process.cwd(), this.props.name);
      this.spawnCommandSync("yarn", ["install"], {cwd: themepath});
    } else if (answers.installGulp) {
      this.spawnCommandSync("yarn", ["install"], {cwd: './'});
    }
  }
});

function replacePlaceholder(path, folder, placeholder) {
  var allFiles;
  fs.readdirSync(path).forEach(file => {
    allFiles = file;
  });
  var global = "**/@(" + placeholder + "*)";
  glob(global, function (er, allFiles) {
    for (var i = 0; i < allFiles.length; i++){
      var toName = allFiles[i].replace(placeholder, folder);
      fs.rename(allFiles[i], toName, function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });
    }
  });
}

function replacePlaceholderInFile(path, folder, placeholder){
  findInFiles.findSync(placeholder, path)
    .then(function(results) {
      for (var result in results) {
        try {
          const changedFiles = replace.sync({
            files: result,
            from: new RegExp(placeholder,"g"),
            to: folder,
            allowEmptyPaths: false,
            encoding: 'utf8'
          });
        }
        catch (error) {
          console.error('Error occurred:', error);
        }
      }
    });
}

function copyAndRemove(src, dist) {
  fs.readdirSync(src).forEach(file => {
    try {
      fsextra.copySync(src + file, dist + file);
    } catch (err) {
      console.error(err);
    }
    try {
      del.sync([src + file]);
    } catch (err) {
      console.error(err);
    }
  });
  del.sync([src]); //Delete Src folder (usually temp folder)
}
