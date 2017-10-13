/*
Copyright (c) 2013 Benedikt Bitterli

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

   1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.

   2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.

   3. This notice may not be removed or altered from any source
   distribution.
*/

#ifndef VOXELOCTREE_HPP_
#define VOXELOCTREE_HPP_

//#include "math/Vec3.hpp"

#include "ChunkedAllocator.hpp"
#include "IntTypes.hpp"

#include <memory>
#include <vector>
#include <glm/vec3.hpp>

class IVoxelData;

class VoxelOctree {

    // Max depth of the octree
    static const int32 MaxScale = 23;

    uint64 _octreeSize;


    IVoxelData *_voxels;
    glm::vec3 _center;

    uint32 _depth; // TODO: (remove) Global variable used for printing debugging information in the construction method below
    uint64 buildOctree(ChunkedAllocator<uint32> &allocator, int x, int y, int z, int size, uint64 descriptorIndex);

public:

    std::unique_ptr<uint32[]> _octree; //TODO: make private and create a visitor pattern if needed

    VoxelOctree(const char *path);
    VoxelOctree(IVoxelData *voxels);

    bool raymarch(const glm::vec3 &orig, const glm::vec3 &dest, float rayScale, uint32 &normal, float &t);

    void prettyPrintTreeSequential(uint64 size);
    void prettyPrintTree(uint32 maxDepth);
    void _prettyPrintNode(uint64 nodeIndex, uint32 maxDepth, uint32 currentDepth);
    std::string nodeDetail(uint64 nodeIndex);
    std::string descriptorToString(uint32 &descriptor);

    glm::vec3 center() const {
        return _center;
    }

    void save(const char *path);
};

#endif /* VOXELOCTREE_HPP_ */
