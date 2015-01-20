import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import struct
import sys 
import numpy as np
import time
import json
import os
import mimetypes
  
from flow_data import FlowData
from flow_proc import FlowProcessor

root = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'static')

print root

FD = FlowData()

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        # The render method worked well for production level, but I couldn't get
        # the caching to turn off
        outfile = open(os.path.join(root, "index.html"))
        for line in outfile:
            self.write(line)
        self.finish()

class MyStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print 'new connection'
        self.FC = FlowProcessor(FD)
    
    def send_cd(self, thresh):
        print 'sending: ' + str(thresh)
        header = {'type':'new_isosurface',
                  'thresh':thresh}
        verts, polys = self.FC.get_surface(thresh)
        self.write_message(header)
        self.write_message(verts.ravel().tostring(), binary=True)
        self.write_message(polys.ravel().tostring(), binary=True)
        print 'done'

    def send_plane(self, pos, norm, id_num):
        res = self.FC.calc_plane2(pos, norm, id_num)
        header = {'type':'new_plane',
                  'cpos':res[0].tolist(),
                  'rx':res[1],
                  'rz':res[2]
                  }
        self.write_message(header)
        print 'done'

    def send_paths(self, typename, id_num):
        res = self.FC.calc_streamlines(id_num)
        header = {'type':'paths',
                  'steps':res.shape[1],
                  }
        self.write_message(header)
        self.write_message(res.ravel().tostring(), binary=True)
        print 'done'

    def on_message(self, message):
        request = json.loads(message)
        print request
        if request['type'] == 'new isosurface':
            self.send_cd(float(request['thresh']))
        elif request['type'] == 'plane point':
            self.send_plane(request['pos'], request['norm'], request['id_num'])
        elif request['type'] == 'paths_from_plane':
            self.send_paths(request['type'], request['id_num'])


    def on_close(self):
      print 'connection closed'
 
 
application = tornado.web.Application([
    (r'/ws', WSHandler),
    (r'/', MainHandler),
    (r'/(.*)', MyStaticFileHandler, {'path': root}),
    ])
 
 
if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()