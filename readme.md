[![Build Status](https://travis-ci.org/GMOD/jbserver.svg?branch=master)](https://travis-ci.org/GMOD/jbserver)

# JBrowse Server (Preliminary) 

JBrowse Server is a server platform for JBrowse; however, it does not include the client GUI.

(it has not been officially released.)

### Requires

Install JBrowse

##Relies on redis server; start redis service first.
service redis start (CentOS)

### Install
```
git clone https://github.com/GMOD/jbserver.git
cd jbserver
```

### Launch
```
sails lift (port 1337)
```

## View Jobs in Kue
http://localhost:1337/kue

## Useful
npm redis-commander

