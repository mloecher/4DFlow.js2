""" Code for loading and processing flow data for the 4DFlow.js server

TODO:

"""

# from vmtk import vmtkscripts 
import numpy as np
import matplotlib.pyplot as plt
from vtk.util import numpy_support
import vtk
import time
# import sys
import os
from scipy.optimize import minimize
from scipy.interpolate import interpn
from skimage.measure import label, moments
from skimage.morphology import binary_dilation
from paths import rk4


class FlowData(object):
    """All the flow related processing for 4DFlow.js."""

    def __init__(self):
        """Loads flow data into the object."""
        fd = open(os.path.join('..', 'data', 'CD.bin'), 'rb')
        self.CD = np.fromfile(fd, 'float32')
        fd.close()

        fd = open(os.path.join('..', 'data', 'V.bin'), 'rb')
        self.V = np.fromfile(fd, 'float32')
        fd.close()

        self.size = np.array([243, 203, 229])
        self.offset = np.round(self.size/2).astype(np.integer)

        self.CD = np.reshape(self.CD, self.size)
        self.V = np.reshape(self.V, np.insert(self.size, 0, 3))

        print self.V.shape
        self.V = -self.V[::-1,:,:,:].astype('double')
        print self.V.shape

        self.thresh = 0.21

        pos = [51.213236505102714, 21.211930649147188, 39.95256718242292]
        norm = [0.9101205766063721, -0.24033774152975507, -0.33751786031862285]

        self.calc_plane2(pos, norm)

        self.calc_streamlines()

    def get_surface(self, thresh=0.21):
        vol = vtk.vtkImageData()
        vol.SetDimensions(229, 203, 243)
        vol.SetOrigin(0, 0, 0)
        vol.SetSpacing(1.0, 1.0, 1.0)
        vol.SetExtent(0 - self.offset[2], self.size[2] - self.offset[2] - 1,
                      0 - self.offset[1], self.size[1] - self.offset[1] - 1,
                      0 - self.offset[0], self.size[0] - self.offset[0] - 1)

        vol.GetPointData().SetScalars(numpy_support.numpy_to_vtk(
            self.CD.ravel(),
            deep=False,
            array_type=vtk.VTK_FLOAT
        ))

        start = time.time()

        marchingcubes = vtk.vtkMarchingCubes()
        marchingcubes.SetInputData(vol)
        marchingcubes.SetValue(0, thresh)
        marchingcubes.Update()
        surface = marchingcubes.GetOutput()

        points = numpy_support.vtk_to_numpy(surface.GetPoints().GetData())

        if surface.GetPolys().GetMaxCellSize() > 3:
            print 'ERROR, SQUARE POLYS EXIST'
        polys2 = np.zeros(
            (surface.GetPolys().GetNumberOfCells(), 3),
            dtype='uint32'
        )
        cell_data = numpy_support.vtk_to_numpy(surface.GetPolys().GetData())
        i = 0
        while i < polys2.shape[0]:
            polys2[i, :] = cell_data[i * 4 + 1:i * 4 + 4]
            i += 1

        surface.ReleaseData()
        vol.ReleaseData()

        end = time.time()
        print end - start

        self.thresh = thresh

        return (points, polys2)

    def seed_lines(self):
        x = self.plane_coords[0][self.mask]
        y = self.plane_coords[1][self.mask]
        z = self.plane_coords[2][self.mask]

        seeds = np.vstack((z,y,x))

        return seeds.T

    def calc_streamlines(self):
        n_lines = 61
        n_steps = 40
        step_size = 4
        paths = np.zeros((n_steps, n_lines, 3))
        
        paths[0, :, :] = self.seed_lines()

        for i in range(n_steps-1):
            pos0 = paths[i, :,:]
            d = rk4(self.V, pos0, step_size)
            paths[i+1, :,:] = paths[i,:,:] + d

        self.paths = np.transpose(paths, (1, 0, 2))


    def get_velocity_values(self):
        pass


    def get_center_approx(self, pos, norm):
        pos = np.array([float(x) for x in pos])
        norm = np.array([float(x) for x in norm])

        pos = pos + self.offset[::-1]

        nr = 30

        r = np.linspace(0.1, 3.0, nr)
        rr = np.tile(r, (3, 1))

        ind = (
            rr *
            np.tile(-norm[:, np.newaxis], (1, nr)) +
            np.tile(pos[:, np.newaxis], (1, nr))
        )

        t = self.trilinear_interp(self.CD, ind)

        try:
            cutoff = np.where(t<self.thresh)[0][0]
        except:
            print '-------------EXCEPT----1---'
            cutoff = t.size
            print cutoff

        try:
            center = np.argmax(t[:cutoff])
        except:
            print '-------------EXCEPT----2---'
            print cutoff
            print t[:cutoff]
            center = 0

        cpos = pos + -norm*r[center]

        return cpos, -norm

    def calc_plane2(self, pos, norm):


        cpos, ui_norm = self.get_center_approx(pos, norm)

        nx = 21
        ny = 21
        x = np.linspace(-10.0, 10.0, nx)
        y = np.linspace(-10.0, 10.0, ny)

        xx, yy = np.meshgrid(x, y, indexing='ij')

        coords = np.array([xx, yy, np.zeros_like(xx)])

        # Get an initial guess for the angle, then refine with Nelder-Mead
        nth = 4 
        x_theta = np.linspace(0, np.pi/2, nth+2)
        z_theta = np.linspace(-np.pi/2, np.pi/2, nth+1)
        x_theta = x_theta[1:-1]
        z_theta = z_theta[:-1]

        min_val = float('Inf')
        x0 = np.array([0.0, 0.0])

        start = time.time()
        for xth in x_theta:
            for zth in z_theta:
                x = np.array([xth, zth])
                val = self.angle_function(x, coords, cpos)
                if val < min_val:
                    min_val = val
                    x0 = x
        end = time.time()
        print end - start

        start = time.time()
        res = minimize(
            self.angle_function, x0,
            args=(coords, cpos),
            method='nelder-mead',
            options={'xtol': 0.001,
                'disp': True,
                'maxiter': 20}
        )
        end = time.time()
        print end - start

        x = res.x

        cpos = self.refine_cpos(x, coords, cpos)

        return cpos - self.offset[::-1], res.x[0], res.x[1]

    def gen_2d_mask(self, im):
        """Generates a binary mask seeded off of the center voxel
        """

        mask = (im>self.thresh).astype(int)
        mask = label(mask)
        center_label = mask[mask.shape[0]/2, mask.shape[1]/2] 
        mask = (mask==center_label)

        cross = np.array([[0,1,0], [1,1,1], [0,1,0]])

        mask = binary_dilation(mask, cross)

        return mask

    def refine_cpos(self, x, coords, cpos):
        rot_coords = self.xz_rotate(coords, x[0], x[1]) + cpos[:,np.newaxis,np.newaxis]
        t = self.trilinear_interp(self.CD, rot_coords)
        mask = self.gen_2d_mask(t)
        # t = t*mask
        m = moments(mask.astype('float'))
        pos = (m[0, 1] / m[0, 0], m[1, 0] / m[0, 0])

        x = np.arange(21)
        y = np.arange(21)

        x_off = interpn((x,y),rot_coords[0], pos)
        y_off = interpn((x,y),rot_coords[1], pos)
        z_off = interpn((x,y),rot_coords[2], pos)

        print cpos
        out = np.array([x_off[0], y_off[0], z_off[0]])
        print out
        
        self.plane_coords = rot_coords
        self.mask = (mask>0)

        return out

    def angle_function(self, x, coords, cpos):
        rot_coords = self.xz_rotate(coords, x[0], x[1]) + cpos[:,np.newaxis,np.newaxis]
        t = self.trilinear_interp(self.CD, rot_coords)
        t = t*self.gen_2d_mask(t)
        return np.linalg.norm(t)


    def xz_rotate(self, coords, x_theta, z_theta):
        Rx = np.array([
            [1, 0, 0],
            [0, np.cos(x_theta), -np.sin(x_theta)],
            [0, np.sin(x_theta), np.cos(x_theta)]
        ])

        Rz = np.array([
            [np.cos(z_theta), -np.sin(z_theta), 0],
            [np.sin(z_theta), np.cos(z_theta), 0],
            [0, 0, 1]
        ])

        R = np.dot(Rz, Rx)
        in_shape = coords.shape
        out = np.dot(R, coords.reshape((3,-1))).reshape(in_shape)
        return out

    def trilinear_interp(self, input_array, indices):
        """Evaluate the input_array data at the indices given"""

        output = np.empty(indices[0].shape)
        x_indices = indices[2]
        y_indices = indices[1]
        z_indices = indices[0]

        x_indices[x_indices < 0] = 0
        y_indices[y_indices < 0] = 0
        z_indices[z_indices < 0] = 0

        x_indices[x_indices >= self.size[0]-2] = self.size[0]-2
        y_indices[y_indices >= self.size[1]-2] = self.size[1]-2
        z_indices[z_indices >= self.size[2]-2] = self.size[2]-2

        x0 = x_indices.astype(np.integer)
        y0 = y_indices.astype(np.integer)
        z0 = z_indices.astype(np.integer)
        x1 = x0 + 1
        y1 = y0 + 1
        z1 = z0 + 1

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

