# from vmtk import vmtkscripts
import numpy as np
import matplotlib.pyplot as plt
from vtk.util import numpy_support
import vtk
import time
import sys
import os


class FlowData:

    def __init__(self):
        # fd = open('..\\..\\4dflowjs\\data3\\CD.bin', 'rb')
        fd = open(os.path.join('..','..','4dflowjs','data3','CD.bin'), 'rb')
        CD = np.fromfile(fd, 'float32')
        fd.close()

        self.CD = np.reshape(CD, (243, 203, 229))

        pos = [39.88780060025221, -5.93520980450357, -110.80454965683182]
        norm = [-0.05750491443839002, 0.15380551451084634, -0.986426402992888]

        dx = round(229 / 2)
        dy = round(203 / 2)
        dz = round(243 / 2)
        self.offset = np.array([dx, dy, dz])

    def get_surface(self, thresh=0.21):
        vol = vtk.vtkImageData()
        vol.SetDimensions(229, 203, 243)
        vol.SetOrigin(0, 0, 0)
        vol.SetSpacing(1.0, 1.0, 1.0)
        dx = int(round(229 / 2))
        dy = int(round(203 / 2))
        dz = int(round(243 / 2))
        vol.SetExtent(0 - dx, 228 - dx, 0 - dy, 202 - dy, 0 - dz, 242 - dz)

        self.offset = np.array([dx, dy, dz])

        vol.GetPointData().SetScalars(numpy_support.numpy_to_vtk(self.CD.ravel(), deep=False, array_type=vtk.VTK_FLOAT))

        start = time.time()

        marchingcubes = vtk.vtkMarchingCubes()
        marchingcubes.SetInputData(vol)
        marchingcubes.SetValue(0, thresh) 
        marchingcubes.Update()
        surface = marchingcubes.GetOutput()

        points = numpy_support.vtk_to_numpy(surface.GetPoints().GetData())

        if (surface.GetPolys().GetMaxCellSize() > 3):
            print 'ERROR, SQUARE POLYS EXIST'
        polys2 = np.zeros(
            (surface.GetPolys().GetNumberOfCells(), 3), dtype='uint32')
        cellData = numpy_support.vtk_to_numpy(surface.GetPolys().GetData())
        i = 0
        while (i < polys2.shape[0]):
            polys2[i, :] = cellData[i * 4 + 1:i * 4 + 4]
            i += 1

        surface.ReleaseData()
        vol.ReleaseData()

        end = time.time()
        print end - start

        return (points, polys2)

    def calc_plane2(self, pos, norm)

    def calc_plane(self, pos, norm):
        pos = np.array([float(x) for x in pos])
        norm = np.array([float(x) for x in norm])

        pos0 = pos

        pos = pos + self.offset

        perp0 = np.zeros_like(norm)
        perp0[0] = norm[1]
        perp0[1] = -norm[0]
        perp0 = perp0 / np.linalg.norm(perp0)

        min_val = float('Inf')
        out = [0, 0, 0, 0]
        out[0] = pos0
        out[1] = norm

        # print norm
        # print perp

        theta = 0

        for theta in np.linspace(0.0, np.pi, 50):

            perp = rotate_plane(perp0, norm, theta)

            r = np.arange(-5.0, 15.0)
            rr = np.tile(r, (3, 1))
            # print rr
            # print rr.shape

            ind = rr * \
                np.tile(-norm[:, np.newaxis], (1, 20)) + \
                np.tile(pos[:, np.newaxis], (1, 20))
            ind = np.tile(ind, (1, 20))

            y = np.arange(-10.0, 10.0)

            yy = np.tile(y[:, np.newaxis], (1, 20)).ravel()
            # print yy.shape
            yy = np.tile(yy, (3, 1))
            # print yy.shape

            yy = yy * np.tile(perp[:, np.newaxis], (1, 400))

            # print yy.shape

            # print yy[0, :40]

            # print ind[0, :40]

            # mip = self.CD.max(0)

            ind = ind + yy

            t = trilinear_interp(self.CD, ind)

            val = np.linalg.norm(t)

            plane_norm = np.cross(norm, perp)
            # print np.linalg.norm(plane_norm)
            rot_axis = np.cross(plane_norm, np.array([0.0, 0.0, -1.0]))
            rot_theta = - \
                np.arccos(np.dot(plane_norm, np.array([0.0, 0.0, -1.0])))

            rot_axis = rot_axis / np.linalg.norm(rot_axis)

            # print rot_axis
            # print rot_theta

            # print theta
            # print val

            # print ' '

            # print norm
            # print perp

            # print ' '

            # print rot_axis
            # print rot_theta

            # print '\n'

            if val < min_val:
                min_val = val
                out[2] = rot_axis
                out[3] = rot_theta
            # print t

            # plt.imshow(np.reshape(t, (20, 20)))
            # plt.show()

            # plt.imshow(self.CD[round(pos[2]), :, :])
            # plt.show()

        return out


def rotate_plane(line, rot_axis, theta):
    r = np.cross(line, rot_axis)
    out = np.cos(theta) * line + np.sin(theta) * r
    return out


def trilinear_interp(input_array, indices):
    """Evaluate the input_array data at the indices given"""

    output = np.empty(indices[0].shape)
    x_indices = indices[2]
    y_indices = indices[1]
    z_indices = indices[0]

    x0 = x_indices.astype(np.integer)
    y0 = y_indices.astype(np.integer)
    z0 = z_indices.astype(np.integer)
    x1 = x0 + 1
    y1 = y0 + 1
    z1 = z0 + 1

    x1[np.where(x1 == input_array.shape[2])] = x0.max()
    y1[np.where(y1 == input_array.shape[1])] = y0.max()
    z1[np.where(z1 == input_array.shape[0])] = z0.max()

    x = x_indices - x0
    y = y_indices - y0
    z = z_indices - z0
    output = (input_array[x0, y0, z0] * (1 - x) * (1 - y) * (1 - z) +
              input_array[x1, y0, z0] * x * (1 - y) * (1 - z) +
              input_array[x0, y1, z0] * (1 - x) * y * (1 - z) +
              input_array[x0, y0, z1] * (1 - x) * (1 - y) * z +
              input_array[x1, y0, z1] * x * (1 - y) * z +
              input_array[x0, y1, z1] * (1 - x) * y * z +
              input_array[x1, y1, z0] * x * y * (1 - z) +
              input_array[x1, y1, z1] * x * y * z)

    return output
