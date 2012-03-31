#!/bin/sh
git add .
git commit -m "$*"
git push -u origin master
git push heroku master
