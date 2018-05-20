""" Code for loading and processing flow data for the 4DFlow.js server

TODO:

"""

# from vmtk import vmtkscripts
import numpy as np
import os

class FlowData(object):

    def __init__(self):
        """Loads flow data into the object."""
        fd = open(os.path.join('..', 'static', 'data', 'CD.bin'), 'rb')
        self.CD = np.fromfile(fd, 'float32')
        fd.close()

        fd = open(os.path.join('..', 'static', 'data', 'V.bin'), 'rb')
        self.V = np.fromfile(fd, 'float32')
        fd.close()

        self.size = np.array([243, 203, 229])
        self.offset = np.round(self.size/2).astype(np.integer)

        self.CD = np.reshape(self.CD, self.size)
        self.V = np.reshape(self.V, np.insert(self.size, 0, 3))

        self.V = self.V[::-1,:,:,:].astype('double')
