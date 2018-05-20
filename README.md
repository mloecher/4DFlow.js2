# 4DFlow.js #

 This is a python web server and javascript client for viewing and alnayzing 4D-Flow data.

 # Installation #

 The server requires the following:
 - numpy
 - scipy
 - tornado
 - vtk 7+

 There is one bit of cython in the server directory that is needed for 3D interpolation, and to compile it you must run:

``` 
 python setup.py build_ext --inplace
```

in the 'server' directory

# Running #

From the 'server' directory:

``` 
 python tor.py
``` 

which will start the tornado web server on port 8118.  

As of right now the program is hard coded to run on a local machine, but if the server and client are on different machines, the only line that needs to be changed is in 'static/js/websocket.js' where you must switch the 'localhost' in this line:

```
this.ws = new WebSocket("ws://localhost:8118/ws"); 
``` 

# About #