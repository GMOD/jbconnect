# JBrowse Server (Work-in-progress)

##Installation

###Make sure npm is up to date
```
npm install -g npm
```
###Make sure nodejs is up to date
```
npm install n -g
n stable
```
###Make sure sails is installed and up to date (version + 0.12.x
```
npm install -g sails
```

```
git clone https://github.com/GMOD/jbserver.git
npm install .
```

##Relies on redis server; start redis service first.
```
service redis start

```
To configure redis to start upon boot
```
chkconfig redis on
```
##Configure JBrowse Server
- setup JBrowse root directory.
- setup Galaxy root directory. (requirement will be removed)
- setup Galaxy API key. (requirement will be removed)
```
nano config/globals.js
```

Server port default is 1337.  Optionally, change the server port
```
nano config/local.js
```

##Start the server
```
sails lift
```

##Launch JBrowse (served by the JBrowse Server)
```
http://localhost:1337/jbrowse
http://[server address]:1337/jbrowse
```

##Queue Diagnostics
This is useful for browsing the queue.
```
http://[server address]:1337/kue
```

##Redis Diagnostics
This is useful for browse and manage the Redis database.
```
npm install redis-commander -g
```
https://www.npmjs.com/package/redis-commander


A [Sails](http://sailsjs.org) application
