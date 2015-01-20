import numpy as np
import os
from skimage.segmentation import slic

fd = open(os.path.join('..', 'static', 'data', 'CD.bin'), 'rb')
CD = np.fromfile(fd, 'float32')
fd.close()

size = np.array([243, 203, 229])
CD = np.reshape(CD, size)

SLIC = slic(CD,  multichannel=False, convert2lab=False)