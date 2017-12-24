# Octrees

This project is a proof of concept / experimentation about octrees and
using them as a data structure to store voxel based data and render it efficiently.

An Octree is just a normal tree with eight childs per node suitable for storing three dimensional data. 
The main problem with storing and rendering voxel data in a naive way is that the amount of memory and processing
needed usually is of order **O(N^3)**. One possible workaround is to exploit the specific characteristics
of the data we want to work with. For example 3D scenes are mostly composed of solid surfaces an opaque
objects, this means that we only need to store or use data about the surfaces to be able to render these scenes.
If solid objects are assumed to be homogeneous then we just need to store some properties for the whole inner part of
those objects. It seems reasonable that working only with surfaces should be more of a N^2 problem. Moreover if
the surfaces are flat an featureless we can also save a lot of data to describe them.:

An octree can be used precisely to store 3D data in this way, the tree will be shallower in simpler areas
and deeper in more complex ones using less data to represent featureless surfaces and more data
for more complex things.

# Noise

There are some experiments in this project with several noise generators for perlin noise
and simplex noise. They are used to generate volumetric data in a procedural way.

# Minecraft

The original idea was to make a voxel renderer to render big minecraft like worlds procedurally and use octrees
to solve the efficiency issues. Octrees have two main advantages for this:

- They are a cheap representation for simple scenes with solid objects and flat surfaces.
- If we render an octree at a given depth we automatically get lower Level Of Detail versions of terrain that
are easier to render in the distance.
- They can be useful to avoid rendering occluded objects, this can save a lot of rendering time.

The problems are the following:

- Volumetric noise generation isn't cheap. The upside is that the algorithms are perfectly parallelizable and perhaps
could be executed on the GPU.
- Constructing an octree from volumetric data isn't cheap either: It seems hard to do since we have to test if every
voxel is empty or not (N^3). This is also somewhat paralellizable.

The ideal would be an algorithm that can directly generate an octree that represents volumetric noise instead of generating
the noise first and then creating the octree from the noise. It would also need to be able to generate the octree
at a given level, this is useful for generating low res versions of terrain first and only generate the higher resolution
versions when the player is near.


