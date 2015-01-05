from interpolate_testcy import *
import numpy as np

def rk4(V, pos0, h):
    shape = np.array(V.shape[1:])

    r0 = np.floor(pos0).clip(0, shape-1)
    r1 = np.ceil(pos0).clip(0, shape-1)
    dr = pos0 - r0
    ddr = 1.0 - dr

    k1 = interpolate3D3Dpointarray(V, r0, r1, dr, ddr)

    pos1 = pos0 + k1 * h / 2

    r0 = np.floor(pos1).clip(0, shape-1)
    r1 = np.ceil(pos1).clip(0, shape-1)
    dr = pos1 - r0
    ddr = 1.0 - dr

    k2 = interpolate3D3Dpointarray(V, r0, r1, dr, ddr)

    pos1 = pos0 + k2 * h / 2

    r0 = np.floor(pos1).clip(0, shape-1)
    r1 = np.ceil(pos1).clip(0, shape-1)
    dr = pos1 - r0
    ddr = 1.0 - dr

    k3 = interpolate3D3Dpointarray(V, r0, r1, dr, ddr)

    pos1 = pos0 + k3 * h

    r0 = np.floor(pos1).clip(0, shape-1)
    r1 = np.ceil(pos1).clip(0, shape-1)
    dr = pos1 - r0
    ddr = 1.0 - dr

    k4 = interpolate3D3Dpointarray(V, r0, r1, dr, ddr)

    step = h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
    return step
