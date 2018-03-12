# Timetable app

## Environment

1. Node 6.9 or higher


## Run

Install all dependencies using following command `npm install`. After this you can run app without building a binary with command `electron .` (electron must be install with flag `-g` for global access) or you can pack app into an executable with command `npm run-script package-win`, than executable file will be located in `builds` directory

## Package Managers
* npm - for js
* bower - for styles

## Project Structure

* src/app - root of angular app, should contain everything related to frontend
* src/lib - common reusable modules
