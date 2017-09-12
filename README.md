An Yeoman generator to scaffold a Drupal theme and [Gulp For Drupal](https://github.com/SyneticNL/Gulp-for-Drupal/).
## Installation
``yarn global add generator-drupalfrontend``

``npm install generator-drupalfrontend -g``

## Functionality
You can use this generator to:
 * set up a new theme
 * place gulp inside an existing theme 
 * place theme files inside an existing gulp folder
 * update your gulp installation
 * Use [Gulp For Drupal](https://github.com/SyneticNL/Gulp-for-Drupal/)!!
 
## Configuration
A config file will be created on first usage, edit this file to include your prefered Drupal themes. By default, the config file wil contain a section for a D7 and a section D8 theme. You can add as much themes as you need. Yeoman will ask which theme you want to use.
 
If you include private repositories, make sure your local git installation can access it.

## Usage
You can scaffold the theme by running ``yo drupalfrontend`` inside your drupal theme folder (``/themes/custom`` for Drupal 8 or ``/sites/all/themes/custom`` for Drupal 7). 

To update gulp or place gulp/theme file inside an existing theme folder, run ``yo drupalfrontend`` inside that themes folder.

 
## Changelog
### 0.4.0 :
    *  You can add multiple themes, by default the config contains a section for d8 and d7 themes.
    
### 0.3.0 :
    *  Fixed not removing .git and temp folders so themes are no longer connected to original git repo
     
### 0.2.2 :
    *  process imporvements 
    
### 0.2.0 : 
    * Fixed moving gulp files for MacOS
    
### 0.1.2 :
    * removed Gulp options from config file
    * removed unused name from config file
    * added README
