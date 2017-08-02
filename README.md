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
 
## Configuration
A config file will be created on first usage, edit this file to include your prefered Drupal 7 & Drupal 8 theme. 
[Gulp For Drupal](https://github.com/SyneticNL/Gulp-for-Drupal/) will be installed inside the theme folder.

If you include private repositories, make sure your local git installation can access it.

## Usage
You can scaffold the theme by running ``yo drupalfrontend`` inside your drupal theme folder (``/themes/custom`` for Drupal 8 or ``/sites/all/themes/custom`` for Drupal 7). 

To update gulp or place gulp/theme file inside an existing theme folder, run ``yo drupalfrontend`` inside that themes folder.

 
## Changelog
### 0.2.1 :
    *  process imporvements 
    
### 0.2.0 : 
    * Fixed moving gulp files for MacOS
    
### 0.1.2 :
    * removed Gulp options from config file
    * removed unused name from config file
    * added README
