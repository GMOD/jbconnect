# JBrowse Server

##Requires:

node.js 4 or better, 
sails.js, 
Will make this more automatic, later.

##Installation
```
git clone https://github.com/GMOD/jbserver.git
npm install .
```
##Relies on redis server; start redis service first.
```

service redis start
```
## configure jbrowse directory
(TBD)

##Start the server
```
sails lift (port 1337)
```

##Launch JBrowse (served by the JBrowse Server)
```
http://[server address]:1337/jbrowse
http://localhost:1337/jbrowse
```

##View Jobs in Kue
```
http://[server address]:1337/kue
```

##Useful
```
npm redis-commander
```


A [Sails](http://sailsjs.org) application
