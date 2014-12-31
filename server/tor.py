import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import struct
import sys 
import numpy as np
import time
import json
  
from flow_data import FlowData

FD = FlowData()

class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print 'new connection'
    
    def send_cd(self, thresh):
        print 'sending: ' + str(thresh)
        header = {'type':'new_isosurface',
                  'thresh':thresh}
        verts, polys = FD.get_surface(thresh)
        self.write_message(header)
        self.write_message(verts.ravel().tostring(), binary=True)
        self.write_message(polys.ravel().tostring(), binary=True)
        print 'done'

    def send_plane(self, pos, norm):
        res = FD.calc_plane2(pos, norm)
        header = {'type':'new_plane',
                  'cpos':res[0].tolist(),
                  'rx':res[1],
                  'rz':res[2]
                  }
        self.write_message(header)
        print 'done'

    def on_message(self, message):
        request = json.loads(message)
        print request
        if request['type'] == 'new isosurface':
            self.send_cd(float(request['thresh']))
        elif request['type'] == 'plane point':
            self.send_plane(request['pos'], request['norm'])


    def on_close(self):
      print 'connection closed'
 
 
application = tornado.web.Application([
    (r'/ws', WSHandler),
])
 
 
if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()