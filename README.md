# JBrowse Server (Work-in-progress)

##Installation
```
git clone https://github.com/GMOD/jbserver.git
npm install .
```

##Relies on redis server; start redis service first.
```
service redis start
```

##Configure JBrowse
Point to the JBrowse root directory
```
nano config/globals.js
```

Optionally, change the server port
```
nano config/local.js
```


##Start the server
```
sails lift (default port 1337)
```

##Launch JBrowse (served by the JBrowse Server)
```
http://localhost:1337/jbrowse
http://[server address]:1337/jbrowse
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
